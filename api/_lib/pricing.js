// api/_lib/pricing.js
//
// Server-side pricing source of truth for /api/book. The browser never
// computes the amount sent to Square — it sends adults/children/code,
// the server calls quote(), and the server tells Square what to charge.
//
// All math is in integer cents to avoid floating-point drift. The 20%
// discount uses Math.round (banker-style is unnecessary at this scale
// and would make tests fragile).
//
// Inputs are validated and coerced; bad input returns a structured error
// rather than throwing, so callers can surface a clean 400 to the client.
//
// This file has no I/O and no dependencies. Pure function.

export const ADULT_PRICE_CENTS = 1500;
export const CHILD_PRICE_CENTS = 900;
export const DISCOUNT_PCT      = 0.20;

// Allowed discount codes. These will move to the settings store in
// Gate E (PR-16); for now they live here so the server has its own
// source of truth distinct from the public client bundle.
export const VALID_CODES = Object.freeze(["VET", "SHELTER", "DVM"]);

// Per-booking guardrails. Keep customer-facing flow honest even before
// the settings store ships. MAX_ADULTS allows 1..10 because the slot
// itself caps total units at 10.
export const MAX_ADULTS   = 10;
export const MAX_CHILDREN = 10;

function isInt(n) { return Number.isInteger(n); }

export function quote(input) {
  const adults   = (input && isInt(input.adults))   ? input.adults   : NaN;
  const children = (input && isInt(input.children)) ? input.children : NaN;
  const rawCode  = input && typeof input.discount_code === "string"
    ? input.discount_code.trim().toUpperCase()
    : "";

  if (!isInt(adults) || adults < 1 || adults > MAX_ADULTS) {
    return { ok: false, error: "invalid_adults" };
  }
  if (!isInt(children) || children < 0 || children > MAX_CHILDREN) {
    return { ok: false, error: "invalid_children" };
  }

  const subtotal = adults * ADULT_PRICE_CENTS + children * CHILD_PRICE_CENTS;

  let codeValid = false;
  let discountCents = 0;
  if (rawCode) {
    if (VALID_CODES.includes(rawCode)) {
      codeValid = true;
      discountCents = Math.round(subtotal * DISCOUNT_PCT);
    } else {
      return { ok: false, error: "invalid_code" };
    }
  }

  const totalCents = subtotal - discountCents;

  return {
    ok: true,
    adults,
    children,
    discount_code: rawCode || null,
    code_valid: codeValid,
    discount_pct: codeValid ? DISCOUNT_PCT : 0,
    breakdown: {
      adult_unit_cents: ADULT_PRICE_CENTS,
      child_unit_cents: CHILD_PRICE_CENTS,
      subtotal_cents: subtotal,
      discount_cents: discountCents
    },
    total_cents: totalCents
  };
}
