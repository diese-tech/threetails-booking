import { createHmac, timingSafeEqual } from "crypto";

// Collect the raw request body from the stream before any parsing.
// Square's signature covers (notification_url + raw_body), so we must
// use the original bytes — re-serialising a parsed object would break verification.
function collectRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Constant-time HMAC-SHA256 comparison to prevent timing attacks.
function verifySquareSignature(rawBody, signatureHeader, signingSecret, notificationUrl) {
  if (!signatureHeader) return false;
  const hmac = createHmac("sha256", signingSecret);
  hmac.update(notificationUrl + rawBody);
  const expected = hmac.digest("base64");
  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    // Buffers of different lengths throw — treat as mismatch.
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signingSecret = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signingSecret) {
    console.error("SQUARE_WEBHOOK_SIGNATURE_KEY is not configured");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  // Must read the raw body BEFORE parsing so the signature covers the original bytes.
  const rawBody = await collectRawBody(req);
  const rawBodyStr = rawBody.toString("utf8");

  const signatureHeader = req.headers["x-square-hmacsha256-signature"];

  // Reconstruct the notification URL exactly as Square would have used it.
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const notificationUrl = `${protocol}://${host}${req.url}`;

  if (!verifySquareSignature(rawBodyStr, signatureHeader, signingSecret, notificationUrl)) {
    console.warn("Square webhook: signature verification failed", {
      url: notificationUrl,
      hasSignatureHeader: Boolean(signatureHeader),
    });
    return res.status(403).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBodyStr);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { type } = event;
  console.log(`Square webhook event received: ${type}`);

  switch (type) {
    case "payment.completed":
    case "payment.updated":
      // TODO: update booking payment status
      break;
    case "refund.completed":
    case "refund.updated":
      // TODO: update booking refund status
      break;
    default:
      break;
  }

  return res.status(200).json({ received: true });
}
