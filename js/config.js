/* ==========================================================================
   OKASTO Private Transfer — SITE CONFIG (contacts + where prices come from)
   --------------------------------------------------------------------------
   PRICES ARE NOT IN THIS FILE. They live in ONE data file:
       data/prices.json        (transfer price matrix, charter, vehicles, markupPercent, roundTo)
   with an identical fallback copy in js/prices-data.js (used when index.html is opened
   via file://, where browsers block loading local JSON). Edit both with admin.html.

   Loading order:  pricesSheetCsvUrl (if set)  ->  data/prices.json  ->  js/prices-data.js
   ========================================================================== */
window.OKASTO_CONFIG = {
  brand: "OKASTO",
  currencySymbol: "฿",
  defaultLang: "en",               // "th" | "en" | "zh" (browser language / saved choice override this)

  // Optional: published Google Sheet CSV (File > Share > Publish to web > CSV). Leave "" to use data/prices.json.
  // Column layout: see README.md ("Prices from Google Sheets").
  pricesSheetCsvUrl: "",
  pricesJsonUrl: "data/prices.json",

  contact: {
    // LINE Official Account (real)
    lineId: "@okasto",
    lineUrl: "https://line.me/R/ti/p/@okasto",                       // add-friend link
    lineMessageUrl: "https://line.me/R/oaMessage/@okasto/?{text}",    // {text} = URL-encoded booking message
    lineIsPlaceholder: false,
    // WhatsApp number — international format, digits only (no +, no spaces)
    whatsappNumber: "66626691009",
    whatsappDisplay: "WhatsApp +66 62 669 1009",
    whatsappIsPlaceholder: false,
    // Real contacts (24h phone is also the hotline)
    phoneDisplay: "+66 92 748 4646 (24h)",
    phoneTel: "+66927484646",
    email: "booking@okasto.com",
    company: "Okasto Co., Ltd.",
    address: "15/4 Moo 5, Bang Rak Yai, Bang Bua Thong, Nonthaburi 11110, Thailand",
    addressShort: "Bang Bua Thong, Nonthaburi",            // shown in the checkout footer
    supportHours: "24/7"
  }
};

/* --------------------------------------------------------------------------
   PLACE SEARCH (Pickup / Drop-off boxes)
   1) Built-in list (no key, offline): airports, price zones, aliases and landmarks from data/prices.json.
   2) Hotels/addresses: "photon" = free Photon geocoder (photon.komoot.io, OpenStreetMap data, no key).
      The typed text is sent to photon.komoot.io — set provider to "none" to keep everything offline.
   3) Optional Google Places: put a browser API key in googlePlacesApiKey (needs a Google Cloud project
      with billing + "Places API (New)" + "Maps JavaScript API" enabled; restrict the key to your domain).
      When a key is set, Google replaces Photon. Google charges per request — see README.
   -------------------------------------------------------------------------- */
window.OKASTO_CONFIG.geocoder = {
  provider: "photon",                               // "photon" | "google" (auto when key set) | "none"
  photonUrl: "https://photon.komoot.io/api/",
  googlePlacesApiKey: "",
  thailandBbox: [97.3, 5.6, 105.7, 20.5],           // minLon, minLat, maxLon, maxLat
  minChars: 3,
  debounceMs: 350
};

/* --------------------------------------------------------------------------
   ONLINE PAYMENT ("Book & Pay") — Beam Checkout (beamcheckout.com), NOT CONNECTED YET
   NEVER put a Beam API key, merchant secret or webhook HMAC key in this file: everything here
   is public. Secrets belong in a server-side function (see netlify/functions/create-beam-payment.js
   and README "Online payment with Beam").
   - enabled: false  -> "Book & Pay" opens the checkout (Review -> Payment -> Done). The customer picks a
                        method, then sends the booking via LINE / WhatsApp; OKASTO replies with a Beam
                        payment link. No network call.
   - enabled: true + checkoutApiEndpoint (recommended), e.g. "/.netlify/functions/create-beam-payment":
                        the booking (incl. the chosen "method" id) is POSTed (JSON) to YOUR endpoint, which creates a Beam payment link
                        server-side and returns { "url": "https://pay.beamcheckout.com/..." }; the customer
                        is then redirected there. Takes priority over paymentLinkUrl.
   - enabled: true + paymentLinkUrl: redirect to a fixed payment link made in Beam Lighthouse.
                        Optional placeholders {amount} (THB), {amount_satang}, {reference}, {email} are
                        filled in if present in the URL; otherwise the URL is opened as is (a fixed Beam
                        link has its own amount, so only use this for a single-price product or a deposit).
   -------------------------------------------------------------------------- */
window.OKASTO_CONFIG.payment = {
  provider: "beam",
  enabled: false,
  paymentLinkUrl: "",
  checkoutApiEndpoint: "",
  currency: "THB",
  referencePrefix: "OK",

  /* Payment methods offered in step 2 of the checkout ("Choose a payment method").
     Online methods only, all through Beam Checkout. Each id maps to ONE Beam payment-link
     "linkSettings" group in netlify/functions/create-beam-payment.js (the server decides the
     mapping; the browser only sends the id):
       card          -> linkSettings.card              (credit / debit cards)
       promptpay     -> linkSettings.qrPromptPay       (Thai PromptPay QR; Alipay app users can scan it too)
       mobilebanking -> linkSettings.mobileBanking     (Krungthai NEXT, Krungsri app, SCB Easy per Beam docs)
       ewallet       -> linkSettings.eWallets          (LINE Pay, TrueMoney, Alipay, WeChat Pay, ShopeePay)
       installments  -> linkSettings.cardInstallments (3/4/6/10 months; ask Beam to activate first)
     A method only works if it is also activated on OKASTO's Beam merchant account (Lighthouse).
     Set enabled:false to hide a method. Order here = order on screen.
     While payment.enabled is false, every method can still be chosen: the customer then sends the
     booking (with the chosen method) via LINE / WhatsApp and OKASTO replies with a Beam payment link. */
  methods: [
    { id: "card", enabled: true, icon: "card",
      label: { en: "Credit / debit card", th: "บัตรเครดิต / เดบิต", zh: "信用卡 / 借记卡" },
      note:  { en: "Pay by card on Beam's secure payment page", th: "ชำระด้วยบัตรบนหน้าชำระเงินที่ปลอดภัยของ Beam", zh: "在 Beam 安全付款页面用银行卡支付" } },
    { id: "promptpay", enabled: true, icon: "qr",
      label: { en: "PromptPay QR", th: "พร้อมเพย์ QR", zh: "PromptPay 二维码" },
      note:  { en: "Scan with any Thai banking app (Alipay app works too)", th: "สแกนจ่ายด้วยแอปธนาคารไทยได้ทุกแอป (ใช้แอป Alipay ได้ด้วย)", zh: "用泰国银行 App 扫码（支付宝 App 也可扫描）" } },
    { id: "mobilebanking", enabled: true, icon: "bank",
      label: { en: "Mobile banking", th: "โมบายแบงก์กิ้ง", zh: "手机银行" },
      note:  { en: "Krungthai NEXT, Krungsri app, SCB Easy", th: "Krungthai NEXT, แอปกรุงศรี, SCB Easy", zh: "Krungthai NEXT、Krungsri App、SCB Easy" } },
    { id: "ewallet", enabled: true, icon: "wallet",
      label: { en: "E-wallet", th: "อีวอลเล็ท", zh: "电子钱包" },
      note:  { en: "TrueMoney, LINE Pay, ShopeePay, Alipay, WeChat Pay", th: "TrueMoney, LINE Pay, ShopeePay, Alipay, WeChat Pay", zh: "TrueMoney、LINE Pay、ShopeePay、支付宝、微信支付" } },
    { id: "installments", enabled: false, icon: "calendar",
      label: { en: "Card installments", th: "ผ่อนชำระผ่านบัตร", zh: "信用卡分期" },
      note:  { en: "3, 4, 6 or 10 months on eligible cards", th: "ผ่อน 3, 4, 6 หรือ 10 เดือน สำหรับบัตรที่ร่วมรายการ", zh: "符合条件的信用卡可分 3、4、6 或 10 期" } }
  ]
};
