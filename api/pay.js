export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { source_id, amount_cents, email, note, idempotency_key } = req.body;

  if (!source_id || !amount_cents) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch("https://connect.squareupsandbox.com/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer EAAAl3_7KZm3mbuJb8k7pQjY8WmGShnJ1tgxSsOsVitCAd6ixYWfaocgaEpcz0Ab",
        "Square-Version": "2024-01-18"
      },
      body: JSON.stringify({
        source_id,
        idempotency_key,
        amount_money: { amount: amount_cents, currency: "USD" },
        buyer_email_address: email || undefined,
        note: note || "Three Tails Cafe Booking"
      })
    });

    const data = await response.json();

    if (data.errors) {
      return res.status(400).json({ errors: data.errors });
    }

    return res.status(200).json({ payment: data.payment });

  } catch (err) {
    return res.status(500).json({ error: "Payment request failed: " + err.message });
  }
}
