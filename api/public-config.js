export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const required = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "EMAILJS_PUBLIC_KEY",
    "EMAILJS_SERVICE_ID",
    "EMAILJS_TEMPLATE_CUSTOMER",
    "EMAILJS_TEMPLATE_BUSINESS",
    "SQUARE_APP_ID",
    "SQUARE_LOCATION",
    "BUSINESS_EMAIL"
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    return res.status(500).json({ error: `Missing env vars: ${missing.join(', ')}` });
  }

  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    emailjsPublicKey: process.env.EMAILJS_PUBLIC_KEY,
    emailjsServiceId: process.env.EMAILJS_SERVICE_ID,
    emailjsTemplateCustomer: process.env.EMAILJS_TEMPLATE_CUSTOMER,
    emailjsTemplateBusiness: process.env.EMAILJS_TEMPLATE_BUSINESS,
    squareAppId: process.env.SQUARE_APP_ID,
    squareLocation: process.env.SQUARE_LOCATION,
    businessEmail: process.env.BUSINESS_EMAIL
  });
}
