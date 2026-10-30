# OKASTO Private Transfer — static website

To use it, open `index.html` in a browser. There's no build step, no backend and no database.
To go live, upload the whole folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, cPanel…).

| File | What it is |
|---|---|
| `index.html` | The public site (TH / EN / 中文) |
| `admin.html` | **Not for the public.** A price editor that runs in your browser (`noindex`). Do not link to it. Remove it from the public upload or protect it with a password. |
| `data/prices.json` | **The price list** (the single source of truth): rates, vehicles, charter, locations, search aliases, zone shapes and landmarks |
| `js/prices-data.js` | A copy of the same data as JavaScript. It is used when the site is opened as a file (`file://`) or when the JSON can't load. |
| `js/config.js` | Contacts, LINE / WhatsApp, optional Google Sheet URL, place-search settings, online payment (Beam) switch |
| `netlify/functions/create-beam-payment.js`, `netlify.toml` | **Untested** server-side stub for Beam payments (only needed when payment goes live) |
| `about.html`, `contact.html`, `terms.html`, `privacy.html` | Content pages (TH / EN / 中文). Terms and Privacy are **drafts: have a lawyer review them before launch** |
| `js/pages.js`, `js/page.js` | Text of the four content pages (all three languages) and the small script that shows them |
| `js/i18n.js` | All texts in Thai / English / Chinese |
| `js/app.js`, `js/places.js` | Site logic and place search |
| `css/style.css` | Design (brand colours are at the top in `:root`) |
| `img/`, `fonts/`, `favicon*`, `apple-touch-icon.png` | Logo files, OG image, self-hosted fonts |
| `dispatch/` | **Not for the public.** Driver-dispatch demo (`noindex`): role switcher, driver app, freelancer sign-up, dispatch desk. Do not link to it. |
| `data/dispatch.json`, `js/dispatch-data.js` | Example drivers, jobs and payout rates for that demo (the `.js` file is the `file://` copy) |
| `js/dispatch-core.js`, `js/dispatch.js`, `css/dispatch.css` | Demo rules and screens. State stays in this browser (`localStorage`). |

Open `dispatch/index.html` and pick a role. Accepting a job in the driver app shows it as assigned on the desk, including in another tab. **Reset example data** on the demo index restores the sample. Every figure is example data. Drivers see their payout only, never the customer price. There is no backend.

---

## 1. Changing prices

Prices are the **NET rate card** and are shown to the public as they are (`markupPercent: 0`).

### Easiest: admin.html
1. Open `admin.html` (it works by double-click, too).
2. Edit the prices. An empty cell means the vehicle is **not offered** on that route; the site greys it out.
   You can also add or remove destinations and origins, edit charter rates, vehicles, location names, **search aliases**, and a location's **centre / radius**.
3. Click **Download prices.json** and **Download prices-data.js**.
4. Replace `data/prices.json` and `js/prices-data.js` on the host with the downloaded files. Always replace **both** files.

Changes are kept as a draft in that browser until you download. "Discard draft" throws the draft away.

### By hand
Edit `data/prices.json`, then copy it into `js/prices-data.js` (`window.OKASTO_PRICES = { …same JSON… };`).

* `rates[origin][destination] = [economy, suv, premium, ev, van, luxvan]`. Use `null` for not offered.
* `autoReverse: true` shows each route in the opposite direction (destination → airport) at the **same price** with a "return" label.
  If the opposite direction is written out explicitly (as with the Pattaya → BKK / DMK rows), that explicit price wins.

### Markup and rounding
In `prices.json` (or in admin.html → Settings):

* `markupPercent`: a percentage added to **every** transfer and charter price. `0` means NET = public price; `10` means +10 %.
* `roundTo`: the price shown is rounded to the **nearest** multiple. For example, with `roundTo: 50` and +10 % markup, 1,050 × 1.1 = 1,155 is shown as **1,150**.
* `extraBabySeat` (300): the price of each extra baby seat. It is shown as it is and is **not** marked up.

All prices are labelled as estimates ("from"). Until online payment is live, the final price is confirmed in chat.

### Optional: prices from a Google Sheet
1. Make a Sheet with a header row `section,from,to,economy,suv,premium,ev,van,luxvan,min_hours,name_en,name_th,name_zh,type`.
   admin.html → **Download CSV** gives you a ready-made starting file. Import it into Sheets.
2. Go to **File → Share → Publish to web → (sheet) → CSV**, then copy the link.
3. In `js/config.js`, set `pricesSheetCsvUrl: "https://docs.google.com/…&output=csv"`.

The site then reads prices from the Sheet on every visit. If the Sheet fails, it falls back to `prices.json`, then to `prices-data.js`.
Zone shapes, aliases and landmarks always come from `prices.json`. The Sheet only overrides prices, charter, settings and location names.

**Recommendation for going live:** use the **prices.json + admin.html** workflow. Prices change rarely. Nothing on the live site depends on Google being up or someone mis-typing a cell. And nobody needs edit access to a shared Sheet.
Use the Sheet only if several people must change prices often without access to the host.

### Sources the loader uses, in order
`pricesSheetCsvUrl` (if set) → `data/prices.json` (when served over http/https) → `js/prices-data.js`.

---

## 2. Pickup / drop-off search

The booking form has two search boxes. You can type an airport, hotel, area or address. **"Choose from list"** switches to the classic dropdowns.

1. **Built-in index (no key, works offline).** This covers every airport and price zone with aliases (e.g. *Swampy, Suvarnabhumi, สุวรรณภูมิ, 素万那普, ดอนเมือง*) and about 24 landmarks (Siam Paragon, ICONSIAM, Terminal 21 Pattaya…).
   Typos are tolerated (fuzzy matching).
2. **Hotels and addresses via Photon** (photon.komoot.io, OpenStreetMap data, free, no key). Results are limited to Thailand.
   Each result's coordinates are mapped to a price zone:
   * Airports first, by radius.
   * Then zone shapes:
     * Bangkok Zone 1 = east bank of the Chao Phraya up to Lak Si.
     * Zone 2 = Thonburi side or north of Lak Si.
     * Pattaya North / Central / South bands.
   * Then the nearest zone centre within its radius (Phuket beaches, Hua Hin, Khao Lak, Ao Nang).

   If no zone matches, the price box shows **"Contact us for a quote"**. The LINE / WhatsApp message is prefilled with the exact place names.
   *Privacy note:* the typed text is sent to photon.komoot.io, a public server with fair-use limits. To turn it off, set `geocoder.provider: "none"` in `js/config.js`; the site then only uses the built-in index.
3. **Google Places (optional).** Put a key in `geocoder.googlePlacesApiKey`. This needs a Google Cloud project **with billing enabled** and both **Places API (New)** and **Maps JavaScript API** turned on.
   Restrict the key to your domain (HTTP referrer) and to those two APIs.
   **Cost:** Google bills autocomplete requests per session plus a Place Details call per selected place. Check the current prices and free monthly allowance at <https://developers.google.com/maps/billing-and-pricing/pricing>, and set a **budget alert / daily quota cap** in Cloud Console.
   A small transfer site normally stays inside the free tier, but bots typing into the box can create charges.
   Google mode is wired in but was **not tested** (no key was available).

### Editing zones, aliases and landmarks
These live in `data/prices.json` (read `_geo_readme` inside the file):
* `locations[].aliases`: extra search words, in any language.
* `locations[].center: [lat, lon]` and `radiusKm`: a circle zone (airports, Phuket beaches…).
* `locations[].polygons`: shapes for Bangkok Zone 1 / 2 and the Pattaya bands, as `[[lat, lon], …]`.
* `places[]`: landmarks `{ name:{en,th,zh}, aliases, at:[lat,lon] }`. Their zone is worked out from `at`.

admin.html edits aliases, centre and radius. Edit polygons and landmarks in the JSON, then copy it into `prices-data.js`.

---

## 3. Contacts and chat

All of these are in `js/config.js`:
* **LINE @okasto** (real):
  * Add friend: `https://line.me/R/ti/p/@okasto`
  * Prefilled message: `https://line.me/R/oaMessage/@okasto/?<url-encoded text>`
* **WhatsApp**: **+66 62 669 1009** (`whatsappNumber: "66626691009"` is used in wa.me links; `whatsappDisplay` is the text shown on the site).
* Phone **+66 92 748 4646**, booking@okasto.com, company name and address.

The site deliberately contains **no bank account details** and sends **no booking data to any webhook or server** by default. Inquiries go to LINE / WhatsApp / e-mail. The only outside network call is the place-search lookup (Photon, or Google if you add a key), which sends only what the visitor types in the Pickup/Drop-off box. Set `geocoder.provider` to `"none"` in `js/config.js` to turn it off. Once you switch on online payment (section 3b), "Book & Pay" also POSTs the booking to **your own** payment endpoint, and only then.

### Booking buttons
* **Book & Pay** (main button in the booking box, on each price-table row and on each fleet card) opens the **checkout** (see "Checkout flow" below). The fleet and price-table buttons first fill the form (vehicle / route) and scroll to it. Book & Pay needs name, phone and e-mail (under "Your details").
* **Ask via LINE / Ask via WhatsApp** (secondary) send an *inquiry* with the trip details prefilled. When a place has no fixed price they read "Ask for a quote on LINE / WhatsApp".
* While online payment is off, the customer still chooses an online method; the last step then offers **Send booking via LINE / WhatsApp** (a booking message with a reference such as `OK-261027-AB12`, the e-mail, the price, the chosen payment method and "I agree to the booking & cancellation policy"). OKASTO replies with a Beam payment link. The how-it-works step, FAQ "How do I pay?" and the note under the buttons use the `*_soon` wording in `js/i18n.js` while payment is off.
* There is **no cash and no bank-transfer option** anywhere on the site, by design.

### Checkout flow (Book & Pay)
A full-screen sheet on phones, a centred two-column panel on desktop. Header: OKASTO logo, step indicator **Review › Payment › Done**, close (×, Esc). Right column (top on phones): order summary card with the vehicle photo (`img/photos/fleet-<id>.jpg`), route, date/time/flight, passengers/bags, chosen method, booking reference, total and "Net price, tolls & fuel included"; under it three plain trust points (free cancellation up to 24h, meet & greet, 24/7 support). Footer: company, address, e-mail, phone (from `contact` in `js/config.js`).
1. **Review & confirm** – trip and contact details, a one-line cancellation summary with "Read the full cancellation policy" (expands the four policy lines), and a required checkbox **"I agree to the booking & cancellation policy"**.
2. **Choose a payment method** – radio cards built from `payment.methods` in `js/config.js` (keyboard: Tab to the group, arrow keys to choose), plus the strip "Payments are processed securely by Beam Checkout. OKASTO never sees or stores your card details." The button reads **Confirm booking** while payment is off, **Pay ฿1,250 securely** when it is on.
3. **Done** – payment off: "Booking received – one last step" with the reference, **Send booking via LINE / WhatsApp** and "What happens next". The page also says plainly that the booking reaches OKASTO only when the customer sends the message (the site has no server). Payment on: the customer is redirected to Beam instead.
Trips without a fixed price skip step 2 and end on "Request ready" (send for a quote).
No security badges, ratings, review counts or countdowns are shown, on purpose: add only claims OKASTO can prove.

### Payment methods (`payment.methods` in `js/config.js`)
| id | Shown as | Beam `linkSettings` group | Default |
|---|---|---|---|
| `card` | Credit / debit card | `card` | on |
| `promptpay` | PromptPay QR | `qrPromptPay` | on |
| `mobilebanking` | Mobile banking (Krungthai NEXT, Krungsri app, SCB Easy) | `mobileBanking` | on |
| `ewallet` | E-wallet (TrueMoney, LINE Pay, ShopeePay, Alipay, WeChat Pay) | `eWallets` | on |
| `installments` | Card installments (3/4/6/10 months) | `cardInstallments` | **off** (needs Beam approval) |

Set `enabled: false` to hide one; edit `label` / `note` (TH/EN/ZH) to change the text. Each method must also be **activated on OKASTO's Beam merchant account** (ask Beam / Lighthouse) – the list on the site is a plan, not a confirmation that Beam has enabled it. If you change the enabled list, set the same ids in the Netlify env var `ALLOWED_METHODS`.

---

## 3b. Online payment with Beam (not connected yet)

OKASTO will take card payments through **Beam Checkout** (<https://www.beamcheckout.com>, docs <https://docs.beamcheckout.com>). Nothing is connected yet: `payment.enabled` is `false` in `js/config.js`.

**Never put a Beam API key, merchant secret or webhook HMAC key in `js/config.js` or any front-end file.** Everything in the website folder is public. Beam's own docs say the same: keys must only be used server-side.

### What Beam's docs say (checked October 2026, from the public docs, not tested with a real account)
* **Payment Links API v1.** `POST https://api.beamcheckout.com/api/v1/payment-links` (Playground: `https://playground.api.beamcheckout.com`). It returns `{ "id", "url" }`; you redirect the customer to `url`, which is Beam's hosted checkout. It can't be shown in an iframe.
* **Auth.** HTTP Basic: `Authorization: Basic base64(merchantId:apiKey)`. The merchant API key is created in **Beam Lighthouse → Developers**. Playground and Production keys are different.
* **Body (main fields).**
  * `order.currency: "THB"`.
  * `order.netAmount` **in satang** (smallest unit: 1,250 THB → `125000`).
  * `order.referenceId`, `order.description`, optional `order.orderItems[]`.
  * `linkSettings`: groups `card`, `cardInstallments` (`installments3m/4m/6m/10m`), `qrPromptPay`, `eWallets`, `mobileBanking`, `buyNowPayLater`, each `{ "isEnabled": true }`. **If you send `linkSettings` it replaces the account defaults and every group you leave out is disabled on that link**; if you omit it, the link uses the defaults set in Lighthouse. The function sends only the group the customer chose.
  * `redirectUrl` (where the customer lands after paying) and optional `cancelUrl`, `expiresAt`, `collectPhoneNumber`.
  * Beam recommends sending an **idempotency key** on create. Check the header name in their API reference.
* **Confirmation.** The redirect is *not* proof of payment. Beam sends a **`payment_link.paid` webhook**, signed with header `X-Beam-Signature` = base64 HMAC-SHA256 of the raw body using your webhook HMAC key from Lighthouse. You can also poll `GET /api/v1/payment-links/{id}`.
* Links can also be made by hand in **Lighthouse** with a fixed amount.

### Option A (recommended): serverless function, exact amount per booking
1. Deploy the folder on **Netlify** (other hosts work too; port the function). `netlify.toml` is included.
2. In Netlify → Site settings → Environment variables, add:
   * `BEAM_MERCHANT_ID` and `BEAM_API_KEY`;
   * `SITE_URL` (e.g. `https://www.okasto.com`);
   * for testing, `BEAM_API_BASE=https://playground.api.beamcheckout.com`.
3. `netlify/functions/create-beam-payment.js` (**untested stub**) does the following:
   * re-calculates the price from `data/prices.json` and rejects a mismatched amount;
   * checks `paymentMethod` against `ALLOWED_METHODS` and maps it to one `linkSettings` group (server-side; the browser never sends linkSettings);
   * creates the payment link with Basic auth;
   * returns `{ url }`.
4. In `js/config.js` set:
   ```js
   payment: { provider: "beam", enabled: true, paymentLinkUrl: "", checkoutApiEndpoint: "/.netlify/functions/create-beam-payment", currency: "THB", referencePrefix: "OK" }
   ```
   After Review and choosing a method, the button reads **Pay ฿1,250 securely**. It POSTs the booking JSON to the endpoint and redirects to the returned `https://` URL. After paying, the customer returns to `/?payment=success&ref=…` and sees a thank-you note.
5. Add a webhook receiver for `payment_link.paid` (verify the signature) that e-mails booking@okasto.com, or check payments in Lighthouse before confirming. This is not included yet.
6. Test everything in Beam **Playground** with their test cards, then switch to Production keys and base URL.

### Option B: a fixed Beam payment link (no server)
Set `enabled: true` and `paymentLinkUrl` to a link made in Lighthouse. The site redirects to it.
* If the URL contains `{amount}`, `{amount_satang}`, `{reference}`, `{email}` or `{method}`, those are filled in.
* A fixed Lighthouse link has its own amount and **ignores** them, as far as the docs show. So Option B only suits a fixed deposit or a single price.

### Booking JSON sent to `checkoutApiEndpoint`
`reference, lang, currency, amount (THB, null = needs quote), pickup{label,zone}, dropoff{label,zone}, route{from,to,rateFrom,rateTo,reverse}, date, time, flight, passengers, luggage, vehicle, vehicleLabel, name, phone, email, notes, method, paymentMethod, policyAccepted`.
Trips without a fixed price (outside the price zones) can't be paid online. The checkout offers sending them via LINE / WhatsApp for a quote.

---

## Luggage size

* Each vehicle lists only **standard bags** (24 inch). Carry-ons are no longer shown or stored; old files or drafts that still have `carryOn` are ignored, and admin.html removes it on download.
* The **Luggage size** section (`#luggage-size` in `index.html`) shows the policy text (`lug_p1`–`lug_p4` in `js/i18n.js`, TH/EN/ZH) and the size table.
* The illustration is an inline SVG inside `<figure id="luggageFigure">`. To use your own picture, put it in `img/` (e.g. `img/luggage-size.png`) and replace the `<svg>…</svg>` with `<img src="img/luggage-size.png" alt="…" class="lug-svg">`. The HTML table underneath can stay or be removed.
* "Luggage size guide" links sit under the Large bags field in the booking box, in Service info, under the fleet, and in the footer.

## Cancellation wording

The owner's final policy. The site shows these four lines in the Service info box and the "Can I cancel?" FAQ. The Thai and Chinese versions are in `js/i18n.js` (`cancel1`–`cancel4`, `faq5_a`):

1. Free cancellation with at least 24 hours' notice, by email at booking@okasto.com or by calling +66 92 748 4646 (available 24/7).
2. Cancellations or booking changes made on-site must be in writing by email.
3. Cancellations are only valid once you receive a confirmation email from OKASTO.
4. Last-minute cancellations (less than 24 hours' notice) or no-shows will incur a full charge.

If you change the email or phone in `js/config.js`, update these lines too.

## Images

The photos in `img/photos/` are **AI-generated illustrations** (placeholders, not real OKASTO cars, drivers or customers). Replace them with real OKASTO photos later: keep the **same file names** and roughly the same shape, and the site picks them up with no code changes.

| File | Size / shape | Used for |
|---|---|---|
| `hero-airport-transfer.jpg` | 1280×720 (16:9), keep under ~300 KB | Hero background on desktop (shown mirrored, under a navy–sky gradient) |
| `hero-airport-transfer-mobile.jpg` | 780×520 | Hero background on phones / tablets (shorter band, stronger gradient) |
| `meet-greet.jpg` | 640×480 (4:3), under ~100 KB | "Meet & greet at arrivals" photo in Service details |
| `van-luggage.jpg` | 640×480 (4:3), under ~100 KB | "Help with your luggage" photo in Service details |
| `fleet-economy.jpg` | 600×320, under ~80 KB | Economy card in Our fleet |
| `fleet-suv.jpg` | 600×320, under ~80 KB | SUV card |
| `fleet-premium.jpg` | 600×320, under ~80 KB | Premium card |
| `fleet-ev.jpg` | 600×320, under ~80 KB | Electric SUV card |
| `fleet-van.jpg` | 600×320, under ~80 KB | Normal Van card |
| `fleet-luxvan.jpg` | 600×320, under ~80 KB | Luxury Van card |

Fleet photos are studio shots: front three-quarter view, light sky-to-white background, every car facing left, whole vehicle visible with similar margins. Real photos should follow the same framing: 600×320 (15:8), car centred, wheels about 7% above the bottom edge. If a fleet photo is missing, that card falls back to the drawn car illustration. Captions and alt text are in `js/i18n.js` (`ph_*` keys). The hero image is preloaded; the others are lazy-loaded. The fleet section says "Photos are for illustration; the actual vehicle may differ."

## 4. Brand, logo and colours
* `img/logo.jpg`: the original logo. `img/logo.png`: transparent and trimmed. `img/logo-stacked-520.png`: the web size, used in the footer.
* `img/logo-horizontal.png`: the header lockup (wordmark + plane / bed / route icons). `img/logo-wordmark.png`: the mobile header. `img/logo-horizontal-white.png`: for dark backgrounds.
* `img/icon-plane.png`, `icon-bed.png`, `icon-route.png`: the single icons. `img/icon-512.png`, `apple-touch-icon.png`, `favicon.svg / .ico / -32.png`: the navy "O".
* `img/og-image.png` (1200×630): the social share image. The domain in `index.html` `<head>` is the placeholder **okasto.example**; replace it with the real domain.
* Colours were sampled from the logo:
  * **Minimal light-blue theme (October 2026):** pale blue backgrounds (`#F5FAFF`, `#EAF4FE`), thin lines (`#E3EEF9`), few shadows. Navy `#04306D` is used only for text and small accents. The main button ("Book & Pay", "Book Now") is sky blue `#8CC8F5` with dark navy text `#062A57` (contrast 7.9:1). Links are `#1668B8`. The theme is the block at the end of `css/style.css` ("Minimal light-blue theme"); delete that block to return to the previous navy style.
  * Accents are used by meaning: **yellow `#F0A117` = airports / flights**, **red `#E91E26` = hotels / stays**, **green `#12CF47` = routes / places / success**.
    Darker text-safe shades are used where an accent colour is text (WCAG AA).
* Fonts are **Nunito** (Latin) and **Kanit** (Thai). They are self-hosted in `fonts/` (SIL Open Font License), so there are no calls to Google Fonts. Chinese uses the system font.

## Review files (`review/`)
`review/okasto-site-flow.png` / `.pdf` is a one-page flowchart of the site for team review (numbered screens, which button leads where, back office lane). `01-home.png` … `11-admin.png` are the full-resolution desktop (1280 px, Thai) screenshots used in it (no 10: the LINE / WhatsApp step opens an outside app). `12-about.png` … `15-privacy.png` show the content pages, and `before-after-home.png` / `before-after-checkout.png` compare the old navy style with the light-blue theme. These files are not used by the website and can be deleted before upload.

## Content pages, facts and partners
* **About** (`about.html`): Okasto Co., Ltd., founded 19 January 2024 (19 ม.ค. 2567), Bang Bua Thong, Nonthaburi; 200+ vehicles in service; private transfers in Bangkok, Pattaya and Phuket. **Contact** (`contact.html`): LINE @okasto, WhatsApp +66 62 669 1009, phone +66 92 748 4646 (24/7), booking@okasto.com, the office address and a map link. These contacts are read from `js/config.js`.
* **Terms & Conditions** (`terms.html`) and **Privacy Policy** (`privacy.html`, Thailand PDPA): **drafts, have a lawyer review them before launch.** A yellow banner says so on the page; remove the `draft` text in `js/pages.js` once they are approved. Both pages carry `noindex` until then.
* Items marked **"to be confirmed" / "รอยืนยัน" / "待确认"** still need an owner decision: waiting rate per hour after the free time, flight-delay basis for waiting time, price of extra stops, refund method and timing, smoking / cleaning fee, liability cap and force majeure wording, governing law / courts, data-protection contact (DPO), cross-border transfer safeguards, how long booking data is kept, and how fast data requests are answered.
* The checkout "I agree" box links to the Terms and the Privacy Policy (they open in a new tab). The header has About and Contact; the footer has a "Company" column with all four pages.
* **Testimonials:** the sample reviews section is **hidden** (`hidden` on `<section id="reviews">` in `index.html`). Put real customer quotes (with their permission) in `js/i18n.js` and remove `hidden` to show it again.
* **Partners:** the home trust strip ("Since 2024 · 200+ vehicles · 24/7 · Also available on …") and the About page list Klook, Mozio, Talixo, Drivado, Bookaway, Traveltip and WAUG as **plain grey text, not logos**. The wording is "partners" / "available on" and does not claim endorsement. **Official partner logos may be added only with each partner's permission and following its brand guidelines**; no partner logos are included in this folder.
* Header: from 1200 px wide the full menu is shown (the "Charter" link is in the mobile menu, the footer and the Routes section); below 1200 px the menu button is used.
