export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { role, credential } = req.body || {};
  if (!role || !credential) {
    return res.status(400).json({ error: "Missing role or credential" });
  }

  const expected = role === "owner"
    ? process.env.ADMIN_OWNER_PASSWORD
    : process.env.ADMIN_STAFF_PIN;

  if (!expected) {
    return res.status(500).json({ error: "Admin credentials not configured" });
  }

  if (credential !== expected) {
    return res.status(401).json({ error: "Invalid credential" });
  }

  return res.status(200).json({ ok: true, role });
}
