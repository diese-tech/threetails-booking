// api/_lib/__tests__/pricing.test.mjs
//
// Run with: node --test api/_lib/__tests__/pricing.test.mjs
//
// Pure-function tests, no network, no DB. ESM to match the rest of /api.

import test from "node:test";
import assert from "node:assert/strict";
import {
  quote,
  ADULT_PRICE_CENTS,
  CHILD_PRICE_CENTS,
  VALID_CODES
} from "../pricing.js";

test("constants match the documented prices in dollars", () => {
  assert.equal(ADULT_PRICE_CENTS, 1500); // $15
  assert.equal(CHILD_PRICE_CENTS, 900);  // $9
});

test("single adult, no children, no code", () => {
  const q = quote({ adults: 1, children: 0 });
  assert.equal(q.ok, true);
  assert.equal(q.total_cents, 1500);
  assert.equal(q.breakdown.subtotal_cents, 1500);
  assert.equal(q.breakdown.discount_cents, 0);
  assert.equal(q.code_valid, false);
  assert.equal(q.discount_code, null);
});

test("two adults plus three children, no code", () => {
  const q = quote({ adults: 2, children: 3 });
  assert.equal(q.ok, true);
  assert.equal(q.breakdown.subtotal_cents, 2 * 1500 + 3 * 900); // 5700
  assert.equal(q.total_cents, 5700);
});

test("zero children edge case is fine", () => {
  const q = quote({ adults: 4, children: 0 });
  assert.equal(q.ok, true);
  assert.equal(q.total_cents, 4 * 1500);
});

test("valid discount code applies 20% off in integer cents", () => {
  // 2A + 1C = 3900c. 20% off = 780c. Total = 3120c.
  const q = quote({ adults: 2, children: 1, discount_code: "VET" });
  assert.equal(q.ok, true);
  assert.equal(q.code_valid, true);
  assert.equal(q.discount_pct, 0.2);
  assert.equal(q.breakdown.subtotal_cents, 3900);
  assert.equal(q.breakdown.discount_cents, 780);
  assert.equal(q.total_cents, 3120);
  assert.equal(q.discount_code, "VET");
});

test("discount code is case- and whitespace-insensitive", () => {
  for (const c of ["vet", " Vet ", "shelter", "Dvm"]) {
    const q = quote({ adults: 1, children: 0, discount_code: c });
    assert.equal(q.ok, true, `code: ${c}`);
    assert.equal(q.code_valid, true, `code: ${c}`);
  }
});

test("known clean discount math: 5A + 1C with SHELTER", () => {
  const q = quote({ adults: 5, children: 1, discount_code: "SHELTER" });
  assert.equal(q.ok, true);
  assert.equal(q.breakdown.subtotal_cents, 8400);
  assert.equal(q.breakdown.discount_cents, 1680);
  assert.equal(q.total_cents, 6720);
});

test("unknown discount code is rejected", () => {
  const q = quote({ adults: 1, children: 0, discount_code: "FREEBIE" });
  assert.equal(q.ok, false);
  assert.equal(q.error, "invalid_code");
});

test("empty/missing discount code is treated as no code (not an error)", () => {
  for (const v of [undefined, null, "", "   "]) {
    const q = quote({ adults: 1, children: 0, discount_code: v });
    assert.equal(q.ok, true, `value: ${JSON.stringify(v)}`);
    assert.equal(q.code_valid, false);
    assert.equal(q.breakdown.discount_cents, 0);
  }
});

test("invalid adult counts are rejected", () => {
  for (const v of [0, -1, 11, 1.5, "1", null, undefined]) {
    const q = quote({ adults: v, children: 0 });
    assert.equal(q.ok, false, `adults: ${JSON.stringify(v)}`);
    assert.equal(q.error, "invalid_adults");
  }
});

test("invalid children counts are rejected", () => {
  for (const v of [-1, 11, 1.5, "0", null, undefined]) {
    const q = quote({ adults: 1, children: v });
    assert.equal(q.ok, false, `children: ${JSON.stringify(v)}`);
    assert.equal(q.error, "invalid_children");
  }
});

test("VALID_CODES export matches what we accept", () => {
  for (const c of VALID_CODES) {
    const q = quote({ adults: 1, children: 0, discount_code: c });
    assert.equal(q.ok, true, `code: ${c}`);
  }
});

test("missing input object does not crash", () => {
  const q = quote();
  assert.equal(q.ok, false);
});
