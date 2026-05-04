export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { payment_id, idempotency_key } = req.body;

  if (!payment_id) {
    return res.status(400).json({ error: "Missing payment_id" });
  }

  if (!process.env.SQUARE_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Square token not configured" });
  }

  try {
    const response = await fetch("https://connect.squareupsandbox.com/v2/refunds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2024-01-18"
      },
      body: JSON.stringify({
        idempotency_key: idempotency_key || crypto.randomUUID(),
        payment_id,
        reason: "Customer cancellation via self-service portal"
      })
    });

    const data = await response.json();

    if (data.errors) {
      return res.status(400).json({ errors: data.errors });
    }

    return res.status(200).json({ refund: data.refund });

  } catch (err) {
    return res.status(500).json({ error: "Refund request failed: " + err.message });
  }
}
