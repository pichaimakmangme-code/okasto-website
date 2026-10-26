/* ==========================================================================
   OKASTO — create a Beam payment link (Netlify Function)       *** UNTESTED STUB ***
   --------------------------------------------------------------------------
   Written from Beam's public docs (docs.beamcheckout.com, Payment Links API v1, checked Oct 2026).
   It has NOT been run against Beam (no merchant account / keys were available). Test it in
   Beam's Playground first, and check the request fields against the current API reference.

   Flow: browser "Book & Pay" -> POST booking JSON here -> we re-check the price from data/prices.json
         -> POST https://api.beamcheckout.com/api/v1/payment-links (Basic auth, server-side secrets)
         -> return { url } -> browser redirects the customer to Beam's hosted checkout.

   Environment variables (Netlify > Site settings > Environment variables — NEVER in front-end code):
     BEAM_MERCHANT_ID   Merchant ID from Beam Lighthouse
     BEAM_API_KEY       Merchant API key (Lighthouse > Developers)
     BEAM_API_BASE      optional: https://playground.api.beamcheckout.com (testing) | https://api.beamcheckout.com (default)
     SITE_URL           e.g. https://www.okasto.com  (customer returns to SITE_URL/?payment=success&ref=...)
     ALLOWED_ORIGIN     optional: your site origin for CORS (default: SITE_URL)
     ALLOWED_METHODS    optional: comma list of method ids accepted (default: card,promptpay,mobilebanking,ewallet)
                        -> keep in sync with js/config.js payment.methods (enabled ones)

   Payment method: the browser sends only an id ("paymentMethod"); the mapping to Beam's payment-link
   "linkSettings" groups lives HERE (server side). Per Beam's Payment Links docs, sending linkSettings
   REPLACES the account defaults and any group you leave out is disabled on that link, so the customer
   sees only the method they chose. Every group must also be activated on the merchant account.

   Then in js/config.js:  payment: { enabled: true, checkoutApiEndpoint: "/.netlify/functions/create-beam-payment", ... }

   IMPORTANT: the redirect back to the site is NOT proof of payment. Confirm bookings from Beam's
   "payment_link.paid" webhook (verify X-Beam-Signature = base64 HMAC-SHA256 of the raw body with your
   webhook HMAC key) or by checking the link in Lighthouse. A webhook receiver is not included here.
   ========================================================================== */
const PRICES = require("../../data/prices.json");

function displayPrice(rate) {
  if (rate == null) return null;
  const k = Number(PRICES.roundTo) || 1, m = 1 + (Number(PRICES.markupPercent) || 0) / 100;
  return Math.round(Math.round(rate * m * 100) / 100 / k) * k;
}
// Server-side price check: never trust the amount sent by the browser.
function serverPrice(b) {
  const r = b && b.route, vi = PRICES.vehicles.findIndex(v => v.id === b.vehicle);
  if (!r || vi < 0) return null;
  const row = PRICES.rates[r.rateFrom] && PRICES.rates[r.rateFrom][r.rateTo];
  return row ? displayPrice(row[vi]) : null;
}
// Method id (from js/config.js payment.methods) -> Beam payment-link linkSettings. UNTESTED against Beam.
const LINK_SETTINGS = {
  card:          { card: { isEnabled: true } },
  promptpay:     { qrPromptPay: { isEnabled: true } },
  mobilebanking: { mobileBanking: { isEnabled: true } },
  ewallet:       { eWallets: { isEnabled: true } },
  installments:  { cardInstallments: { installments3m: { isEnabled: true }, installments4m: { isEnabled: true },
                                       installments6m: { isEnabled: true }, installments10m: { isEnabled: true } } }
};
const ALLOWED_METHODS = (process.env.ALLOWED_METHODS || "card,promptpay,mobilebanking,ewallet").split(",").map(s => s.trim()).filter(Boolean);
const clip = (s, n) => String(s == null ? "" : s).slice(0, n);

exports.handler = async (event) => {
  const origin = process.env.ALLOWED_ORIGIN || process.env.SITE_URL || "";
  const cors = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
  const json = (status, body) => ({ statusCode: status, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const { BEAM_MERCHANT_ID, BEAM_API_KEY, SITE_URL } = process.env;
  const BASE = process.env.BEAM_API_BASE || "https://api.beamcheckout.com";
  if (!BEAM_MERCHANT_ID || !BEAM_API_KEY || !SITE_URL) return json(500, { error: "Payment not configured" });

  let b;
  try { b = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "Bad JSON" }); }
  const price = serverPrice(b);
  if (price == null) return json(400, { error: "This trip needs a quote — no online payment" });
  if (Number(b.amount) !== price) return json(409, { error: "Price changed, please refresh", price });
  const method = String(b.paymentMethod || "");
  if (!ALLOWED_METHODS.includes(method) || !LINK_SETTINGS[method]) return json(400, { error: "Unsupported payment method" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email || "")) return json(400, { error: "Email required" });

  const ref = clip(b.reference, 40).replace(/[^A-Za-z0-9-]/g, "") || ("OK-" + Date.now());
  const vehicle = PRICES.vehicles.find(v => v.id === b.vehicle);
  const desc = clip(`${b.pickup && b.pickup.label} → ${b.dropoff && b.dropoff.label}, ${b.date} ${b.time}`, 200);
  const payload = {
    order: {
      currency: "THB",
      netAmount: price * 100,                 // smallest currency unit (satang): 1,250 THB -> 125000
      description: clip(`OKASTO private transfer ${ref}`, 100),
      referenceId: ref,
      internalNote: clip([desc, `${b.passengers} pax, ${b.luggage} bags, ${vehicle ? vehicle.id : b.vehicle}`,
        `Flight ${b.flight || "-"}`, `Method ${method}`, `${b.name} / ${b.phone} / ${b.email}`, b.notes].filter(Boolean).join(" | "), 500),
      orderItems: [{ itemName: clip(`Private transfer (${b.vehicleLabel || b.vehicle})`, 100), description: desc, price: price * 100, quantity: 1, productId: clip(b.vehicle, 40) }]
    },
    linkSettings: LINK_SETTINGS[method],         // only the chosen method is shown on Beam's page
    collectPhoneNumber: false,
    redirectUrl: `${SITE_URL.replace(/\/$/, "")}/?payment=success&ref=${encodeURIComponent(ref)}`
  };

  try {
    const res = await fetch(`${BASE}/api/v1/payment-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${BEAM_MERCHANT_ID}:${BEAM_API_KEY}`).toString("base64")
        // Beam recommends an idempotency key on create; add the header name from their API reference.
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) { console.error("Beam error", res.status, data); return json(502, { error: "Payment provider error" }); }
    // TODO: store { ref, beamPaymentLinkId: data.id, booking b } (e.g. email booking@okasto.com or a database).
    return json(200, { url: data.url, id: data.id, reference: ref });
  } catch (e) {
    console.error(e);
    return json(502, { error: "Payment provider unreachable" });
  }
};
