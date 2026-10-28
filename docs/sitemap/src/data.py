# OKASTO sitemap v2 - single source of truth for diagram + PDF
FACTS = "Founded 19 Jan 2024 · 200+ vehicles · Private airport transfers in Bangkok, Pattaya & Phuket"
PARTNERS = "Klook · Mozio · Talixo · Drivado · Bookaway · Traveltip · WAUG"

GROUPS = [  # id, name, thai, ink, tint, line
 ("core","Core","หน้าหลัก","#04306D","#EAF4FE","#9CC3EC"),
 ("book","Booking funnel","ขั้นตอนจอง","#0B5CA8","#E0F0FF","#7DBCF2"),
 ("seo","SEO landing","หน้าดึงคนจาก Google","#0A7A2F","#E6F9EC","#8FD9A8"),
 ("sup","Support","ช่วยเหลือ","#0B7285","#E3F6F8","#86D0DA"),
 ("trust","Trust & Legal","ความน่าเชื่อถือ/กฎหมาย","#5A3FB0","#F0ECFC","#C1B3EE"),
 ("b2b","Partner / B2B","พาร์ทเนอร์/องค์กร","#8A5A00","#FFF4DC","#EBC777"),
 ("back","Back office","หลังบ้าน","#4F6280","#EEF1F5","#B8C3D3"),
]
G = {g[0]: g for g in GROUPS}

# status: built | launch | p2 ; note: extra tags
# fields: id, group, level, name, th, url, status, key (diagram), purpose, content(list), cta, index, tags, sub
P = []
def page(id, group, level, name, th, url, status, key, purpose, content, cta, index="index", tags=(), sub=None, today=None):
    P.append(dict(id=id, group=group, level=level, name=name, th=th, url=url, status=status, key=key, purpose=purpose,
                  content=content, cta=cta, index=index, tags=list(tags), sub=sub, today=today))

# ---------- L0 ----------
page("home","core",0,"Home","หน้าแรก","/","built",
 "Hero + search widget (instant fixed price) · trust strip: since 2024 · 200+ vehicles · partners as grey text · popular routes · fleet teaser · how it works · FAQ teaser",
 "Get a price and start booking within the first screen, then build trust.",
 ["Hero: soft airport photo under white/sky veil, navy headline, 3 key points (name-sign meet & greet · free waiting on arrivals · per-vehicle price incl. tolls & fuel)",
  "Search widget overlapping the hero: pickup → drop-off · date/time · passengers · bags · child seats → prices for 6 vehicle classes",
  "Trust strip: Since 2024 · 200+ vehicles · 'Also available on' Klook, Mozio, Talixo, Drivado, Bookaway, Traveltip, WAUG (grey text, no logos)",
  "Popular routes cards → SEO route pages · Fleet teaser → Fleet · How it works (3 steps) · FAQ teaser → Help centre",
  "Reviews block stays hidden until real, permissioned reviews exist"],
 "Get prices → Book & Pay", today="index.html")

# ---------- Core ----------
page("routes","core",1,"Routes & Prices","เส้นทางและราคา","/routes-prices","built",
 "Fixed per-vehicle price table · airport × zone × 6 classes · filter by airport",
 "Transparent fixed prices; the price-research page for planners.",
 ["Price table by airport (BKK, DMK, HKT, UTP) × destination zone × vehicle class","Filter by airport / city · 'Book this route' prefills the widget","Note: prices per vehicle, incl. tolls & fuel"],
 "Book this route", today="Home #routes")
page("fleet","core",1,"Fleet","ประเภทรถ","/fleet","built",
 "6 vehicle classes: seats · bags · sample models · photos · compare",
 "Help guests choose the right vehicle for their group and luggage.",
 ["6 classes with seats, bag capacity, sample models, interior/boot photos","Compare table · 'Which car fits us?' helper","Real photos replace AI placeholders before launch"],
 "Get prices", today="Home #fleet")
page("luggage","core",2,"Luggage guide","คู่มือขนาดกระเป๋า","/fleet/luggage","built",
 "Bag sizes vs. vehicle capacity · oversized items (surf, golf, bike, wheelchair)",
 "Prevent wrong-size bookings.",
 ["Bag size illustrations (cabin / medium / large)","Capacity per vehicle class","Oversized items: surfboard, golf bag, bicycle, wheelchair → note in booking"],
 "Choose vehicle", today="Home #luggage-size")
page("charter","core",1,"Hourly charter","เช่ารถพร้อมคนขับรายชั่วโมง","/charter","built",
 "Car + driver by the hour · minimum hours · what's included · get a quote",
 "Second service line: hourly hire with driver.",
 ["Hourly rates per class · minimum hours","Inclusions/exclusions (overtime, overnight, tolls/parking TBC)","Example uses: city day, shopping, meetings"],
 "Book hourly", today="Home #charter")
page("services","core",1,"Service info","ข้อมูลบริการ","/service-info","built",
 "Meet & greet with name sign · flight tracking · free waiting · child seats · stops · online payment only",
 "Explain exactly what the guest gets.",
 ["Meet & greet with name sign · flight monitoring · free waiting time (arrivals)","Child seats · extra stops (rules TBC)","Booking confirmed by email · pay online via Beam only, no cash"],
 "Get prices", today="Home #info")

# ---------- Booking funnel ----------
page("b1","book",1,"1 · Search & quote","ค้นหาและดูราคา","/ (widget) · /book","built",
 "Pickup ↔ drop-off · date & time · pax · bags · child seats → instant fixed price",
 "Turn intent into a price in one step.", ["Fields: pickup, drop-off (airport/hotel/address), date & time, passengers, bags, child seats","Return trip toggle","Instant fixed prices from prices.json"],
 "See vehicles", index="—", today="Home widget")
page("b2","book",2,"2 · Choose vehicle","เลือกรถ","/book/vehicle","built",
 "6 classes: price · seats · bags · 'fits your group' hint",
 "Pick the vehicle with confidence.", ["Vehicle cards: price, seats, bags, photo","Recommended badge when the group fits","Free cancellation ≥24 h shown next to price"],
 "Continue", index="noindex", today="price result")
page("b3","book",2,"3 · Details & review","กรอกข้อมูลและตรวจสอบ","/booking","built",
 "Name · phone · email · flight no. · notes · extras · agree Terms + Privacy",
 "Collect what the driver needs; review before paying.", ["Lead passenger: name, phone (WhatsApp/LINE optional), email","Flight number (enables flight tracking) · notes · extras","Price summary · checkbox linking Terms & Privacy"],
 "Continue to payment", index="noindex", today="checkout step 1")
page("b4","book",2,"4 · Pay with Beam","ชำระเงินผ่าน Beam","/booking/payment","built",
 "Card · PromptPay QR · mobile banking · e-wallet · online only, no cash",
 "Secure, trusted payment.", ["Beam-hosted payment (card, PromptPay QR, mobile banking, e-wallet as enabled)","Lock icon + 'Secure payment via Beam' · total in THB","No cash, no manual transfer"],
 "Pay now", index="noindex", today="checkout step 2")
page("b5","book",2,"5 · Confirmation","จองสำเร็จ","/booking/confirmed","built",
 "Booking ref · trip summary · what happens next · confirmation email",
 "Reassure and set expectations.", ["Booking reference + summary","Next steps: confirmation email, meeting point, driver contact before pickup","Links: Manage booking · Meeting points"],
 "Manage booking", index="noindex", today="checkout step 3")
page("b6","book",2,"Payment failed · retry","ชำระไม่สำเร็จ","/booking/payment-failed","launch",
 "Clear reason · retry payment · trip details kept · contact help",
 "Recover failed payments instead of losing the booking.", ["Friendly error + likely reason","Retry with same trip details","Help link (email / chat for questions)"],
 "Try again", index="noindex")

# ---------- SEO landing ----------
page("hub","seo",1,"Airport transfers hub","รวมบริการรับส่งสนามบิน","/airport-transfers","launch",
 "All airports & cities served · from-prices · links to every landing page",
 "SEO hub that links all landing pages (like Welcome Pickups' destination list).",
 ["Airports and cities served with 'from' prices","Short intro per area · map (optional)","Links to all airport, city and route pages"],
 "Get prices")
air_key="From-price table to top destinations · meeting point · travel times · airport FAQ · prefilled widget"
air_content=["H1 '<Airport> airport transfer' + prefilled widget","Most-booked destinations with fixed prices (Kiwitaxi-style table)","Meeting point + photo · typical travel times (TBC) · 6–8 airport FAQs (FAQPage schema)","300–500 words unique copy × 3 languages"]
page("bkk","seo",2,"Suvarnabhumi (BKK)","สุวรรณภูมิ","/suvarnabhumi-airport-transfer","launch",air_key,"Rank for BKK transfer searches.",air_content,"Book from BKK",sub="air")
page("dmk","seo",2,"Don Mueang (DMK)","ดอนเมือง","/don-mueang-airport-transfer","launch",air_key,"Rank for DMK transfer searches.",air_content,"Book from DMK",sub="air")
page("hkt","seo",2,"Phuket (HKT)","ภูเก็ต","/phuket-airport-transfer","launch",air_key,"Rank for HKT transfer searches.",air_content,"Book from HKT",sub="air")
page("utp","seo",2,"U-Tapao (UTP)","อู่ตะเภา","/u-tapao-airport-transfer","p2",air_key,"Rank for UTP searches once volume justifies it.",air_content,"Book from UTP",sub="air")
city_key="Areas & hotels zones · airport options · prices · tips"
city_content=["Areas/zones in the city and which airport to use","Price table from each airport","Local tips (traffic, hotel drop-off) · city FAQ"]
page("c-bkk","seo",2,"Bangkok","กรุงเทพฯ","/bangkok-transfer","launch",city_key,"City-intent searches (e.g. 'Bangkok private transfer').",city_content,"Get prices",sub="city")
page("c-pty","seo",2,"Pattaya","พัทยา","/pattaya-transfer","launch",city_key,"Capture 'Bangkok airport to Pattaya' demand.",city_content,"Get prices",sub="city")
page("c-hkt","seo",2,"Phuket","ภูเก็ต","/phuket-transfer","launch",city_key+" (Patong · Kata · Karon …)","Phuket beach-area searches.",city_content,"Get prices",sub="city")
page("c-hh","seo",2,"Hua Hin","หัวหิน","/hua-hin-transfer","p2",city_key,"Long-distance route demand from Bangkok.",city_content,"Get prices",sub="city")
page("route","seo",3,"Route pages (template)","หน้าเส้นทาง A → B","/transfer/{from}-to-{to}","launch",
 "Top 6 at launch, e.g. BKK→Bangkok · BKK→Pattaya · DMK→Bangkok · DMK→Pattaya · HKT→Patong · HKT→Kata/Karon · price per class",
 "Win high-intent 'A to B' searches; generated from prices.json.",
 ["Route H1 + fixed price per vehicle class","Distance & travel time (TBC) · what's included · meeting point","Prefilled widget · related routes · route FAQ","Launch with the top 6 routes; add more from booking data in Phase 2"],
 "Book this route")

# ---------- Support ----------
page("help","sup",1,"Help centre & FAQ","ศูนย์ช่วยเหลือ / FAQ","/help","built",
 "12 FAQs today → Phase 2 categories: before you book · at the airport · payments & refunds · changes",
 "Answer questions before they become chats.",
 ["Today: 12 FAQs in TH/EN/ZH (meeting point, delays, inclusions, payment, cancellation, child seats, per car, bags, oversized items, stops, waiting, who is OKASTO)","Phase 2: searchable categories + article pages","FAQPage schema"],
 "Book & Pay", today="Home #faq")
page("manage","sup",1,"Manage booking","จัดการการจอง","/manage","launch",
 "Find by booking ref + email · view · request change · cancel (free ≥24 h) · receipt",
 "Self-service after booking (every benchmark has it).",
 ["Lookup: booking reference + email","Launch (lite): view summary + change/cancel request sent by email; Phase 2: real self-service with backend","Policy reminder: free cancellation ≥24 h · refund via Beam to original method (timing TBC)","Download receipt"],
 "Find my booking", index="noindex")
page("meet","sup",2,"Meeting points","จุดนัดพบ","/help/meeting-points","launch",
 "Per airport/terminal: where the driver waits · photos · what if you can't find the driver",
 "Reduce no-shows and arrival-day stress.",
 ["BKK, DMK, HKT (UTP later): exact spot per terminal + photo (TBC)","Name-sign meet & greet explanation","If you can't find the driver: who to contact"],
 "Manage booking")
page("contact","sup",1,"Contact","ติดต่อเรา","/contact","built",
 "LINE · WhatsApp (questions only) · phone · email · office address",
 "All channels in one place; booking stays in Book & Pay.",
 ["Channel cards: LINE, WhatsApp, phone, email (numbers not shown in this document)","Note: chat is for questions; bookings go through Book & Pay","Office address + map link"],
 "Book & Pay", today="contact.html")

# ---------- Trust & legal ----------
page("about","trust",1,"About OKASTO","เกี่ยวกับเรา","/about","built",
 "Since 19 Jan 2024 · 200+ vehicles · service areas · partners as grey text · company details",
 "Prove we are a real, established company using confirmed facts only.",
 ["Who we are: founded 19 Jan 2024 (Okasto Co., Ltd.) · 200+ vehicles","Service areas · what's included · vehicle table","'Also available on' partners as grey wordmarks (no logos, no endorsement claim)","Company details (Thai name & registration no. TBC)"],
 "Get prices", today="about.html")
page("standards","trust",2,"Safety & service standards","มาตรฐานความปลอดภัย","/about/standards","p2",
 "Driver vetting · vehicle checks · insurance — verified facts only",
 "Answer 'is it safe?' with evidence.", ["Driver screening & training (TBC)","Vehicle age, maintenance, insurance (TBC)","Only publish what OKASTO can prove"],
 "Get prices")
page("reviews","trust",2,"Reviews","รีวิว","/reviews","p2",
 "Real, permissioned reviews only · hidden until available",
 "Social proof without invented content.", ["Real reviews with name/country/rating and permission","Optional: link to partner-platform ratings if allowed","Hidden until real reviews exist"],
 "Get prices")
page("policy","trust",1,"Booking & cancellation policy","นโยบายการจองและยกเลิก","/booking-policy","built",
 "Free cancellation ≥24 h · waiting time · no-show · changes",
 "Clear rules before payment.", ["Free cancellation up to 24 h before pickup","Waiting time & no-show rules","Changes, refunds via Beam (timing TBC)"],
 "Book & Pay", today="Home #info")
page("terms","trust",1,"Terms & Conditions","ข้อกำหนดและเงื่อนไข","/terms","built",
 "12 sections · draft, lawyer review before launch",
 "Required by payment gateway; protects both sides.", ["12 sections drafted in TH/EN/ZH","Yellow 'draft' banner until lawyer-approved","Linked from footer + checkout agree box"],
 "—", index="noindex (draft)", tags=["draft"], today="terms.html")
page("privacy","trust",1,"Privacy Policy (PDPA)","นโยบายความเป็นส่วนตัว","/privacy","built",
 "10 sections · PDPA · draft, lawyer review before launch",
 "PDPA compliance.", ["10 sections drafted in TH/EN/ZH","Data collected, purposes, sharing (Beam, drivers, partners), rights","DPO / retention / transfers TBC"],
 "—", index="noindex (draft)", tags=["draft"], today="privacy.html")
page("cookies","trust",2,"Cookie notice","นโยบายคุกกี้","/cookies","p2",
 "Only if analytics / ad pixels are added · consent banner",
 "PDPA-compliant tracking.", ["Cookie list, purposes and consent banner settings"], "—")
page("404","trust",1,"404 page","ไม่พบหน้า","/404","launch",
 "Short message · search widget · links to Home and Help",
 "Never a dead end.", ["Friendly message + mini search widget + links to Home, Help, Contact"], "Get prices", index="noindex")

# ---------- Partner / B2B ----------
page("partners","b2b",1,"Partners & travel agents","พาร์ทเนอร์ / เอเจนต์","/partners","p2",
 "Where to book us (Klook, Mozio, Talixo …) · agency enquiry form · net rates & API on request",
 "One door for travel agencies, OTAs and resellers.",
 ["'Also available on' list (text only, wording 'partners' / 'available on')","Benefits for agencies (TBC by OKASTO) · enquiry form → email","Integration options on request (booking link, widget, API) — Mozio/Kiwitaxi pattern"],
 "Become a partner")
page("corporate","b2b",2,"Corporate travel","ลูกค้าองค์กร","/partners/business","p2",
 "Company bookings for staff & guests · pay online via Beam · receipts",
 "Recurring revenue from companies.", ["Use cases: staff, visitors, events","Booking on behalf of guests","Payment online via Beam; receipt/tax-invoice process TBC"],
 "Contact sales")
page("hotels","b2b",2,"Hotels & concierge","โรงแรม / คอนเซียร์จ","/partners/hotels","p2",
 "Book guest transfers · bulk quote · co-branded booking link",
 "Hotels as a steady referral channel.", ["Guest transfer flow for concierge","Bulk/recurring quote request","Optional referral link"],
 "Enquire")
page("pbk","b2b",1,"Partner booking link","ลิงก์จองพาร์ทเนอร์","/p/<partnerId>","built",
 "Private link per Agency or Hotel · own contract rates · no login · no main menu · no LINE button",
 "Let a partner without a booking platform book at their own contract rates.",
 ["Partner name, type badge (Agency or Hotel) and partner ID. Demo preview strip. Example data only",
  "Contract rate table by route and vehicle — each partner has different example rates",
  "Booking form: route, vehicle (left-facing fleet photos), flight and time, passenger, partner reference",
  "Payment option A — Book now, settle at month end (credit): no payment now; contract price goes on the monthly invoice. Shown only when creditEnabled, with an optional credit limit",
  "Payment option B — Pay now via OKASTO payment (Beam), kickback at month end: public website price paid online; commission = public − contract, paid back at month end. Beam is a placeholder (no cash, no real charge)",
  "Confirm is simulated in the browser and addressed to bookings@okasto.com — not a LINE notification",
  "noindex. Do not list /p/<partnerId> (or each partner) in sitemap.xml"],
 "Confirm booking", index="noindex", today="p/<partnerId>/index.html")
page("psent","b2b",2,"Booking sent","ส่งการจองแล้ว","/p/<partnerId>/sent","built",
 "Confirmation plus example email to bookings@okasto.com · partner type · payment method · kickback",
 "Show the partner that the booking would be emailed to the OKASTO team.",
 ["Booking reference and trip summary",
  "Partner type (Agency / Hotel) and the chosen payment method",
  "Kickback bookings also show the commission (public price − contract price)",
  "Example inbox mock addressed to bookings@okasto.com — not LINE. Nothing is actually sent yet",
  "noindex"],
 "New booking", index="noindex", today="p/<partnerId>/sent.html")
page("pstm","b2b",2,"Monthly partner statement","ใบแจ้งยอดประจำเดือน","/p/<partnerId>/statement","built",
 "Month's bookings · total owed on credit · total kickback due · labelled as an example",
 "Show what the partner would be invoiced and what commission is due.",
 ["List of the month's bookings with route, vehicle, payment method and amounts",
  "Total owed: contract price of credit bookings (month-end invoice)",
  "Total kickback due: commission on Beam-paid bookings",
  "Per partner, example figures, noindex. Not listed per partner in sitemap.xml"],
 "New booking", index="noindex", today="p/<partnerId>/statement.html")
page("drive","b2b",1,"Drive with OKASTO","ร่วมเป็นคนขับ / พาร์ทเนอร์รถ","/drive-with-us","p2",
 "Driver & fleet-partner requirements · documents · apply (form → email)",
 "Grow supply (Welcome Pickups / Blacklane / GetTransfer all have this).",
 ["Requirements: licence, vehicle age/type, insurance (TBC)","How it works: get jobs in advance, payment terms (TBC)","Application form → email (no backend at first)"],
 "Apply")

# ---------- Back office ----------
page("admin","back",1,"Price editor","แก้ไขราคา","/admin","built",
 "Edit prices.json by route × class · login required",
 "Keep prices current without a developer.", ["Edit price per route × vehicle class","Export/import prices.json"], "Save", index="noindex · no links", today="admin.html")
page("bookings","back",1,"Bookings & payments","รายการจอง/การชำระ","/admin/bookings","p2",
 "List · status · Beam payment state · refunds", "One view of every booking.", ["Bookings with status","Beam payment state + refunds","Export CSV"], "—", index="noindex · no links")
page("dispatch","back",1,"Dispatch & drivers","จัดคนขับ","/admin/dispatch","p2",
 "Assign driver & vehicle · daily run sheet", "Operations.", ["Assign driver/vehicle","Daily run sheet","Driver contact sent to guest"], "—", index="noindex · no links")
page("inbox","back",1,"Unified inbox","กล่องข้อความรวม","/admin/inbox","p2",
 "LINE + WhatsApp + email in one place", "Faster replies to questions.", ["Merge LINE, WhatsApp, email","Link chat to booking ref"], "—", index="noindex · no links")

JOURNEYS = [
 ("J1","Book & Pay (main path)","จองและชำระเงิน",[("home","Home / landing page"),("b1","Search & quote"),("b2","Choose vehicle"),("b3","Details & review"),("b4","Pay with Beam"),("b5","Confirmation + email")],"If payment fails → Payment failed · retry (keeps trip details)"),
 ("J2","Manage booking","จัดการการจอง",[("b5","Confirmation email"),("manage","Manage booking (ref + email)"),("manage","View · change · cancel"),("policy","Policy check: free ≥24 h"),("b4","Refund via Beam")],"Launch: change/cancel request by email · Phase 2: full self-service"),
 ("J3","Search engine → booking","จาก Google สู่การจอง",[("route","Google: 'BKK to Pattaya transfer'"),("route","Route / airport page"),("b1","Prefilled widget"),("b2","Choose vehicle"),("b5","… Pay → Confirmation")],"SEO pages carry their own prefilled widget, so the funnel stays 4 clicks"),
 ("J4","Question before booking","มีคำถามก่อนจอง",[("help","Help centre / FAQ"),("contact","LINE / WhatsApp (questions only)"),("b1","Back to Book & Pay")],"Chat answers questions; bookings and payments always go through Book & Pay"),
 ("J5","Arrival day","วันเดินทาง",[("meet","Meeting points guide"),("services","Driver with name sign"),("contact","Contact if needed")],"Flight tracking + free waiting on arrivals"),
 ("J6","Partner / supply (Phase 2)","พาร์ทเนอร์ (เฟส 2)",[("partners","Partners page"),("partners","Enquiry form → email"),("drive","Drive with OKASTO → apply")],"Enquiry forms send email only. The private booking link (J7) is a separate noindex demo, not this marketing page."),
 ("J7","Partner booking link (demo)","ลิงก์จองของพาร์ทเนอร์",[("pbk","Private link /p/<partnerId>"),("pbk","Credit or Beam kickback"),("psent","Email to bookings@okasto.com"),("pstm","Monthly statement")],"Example data, simulated in the browser. noindex — do not list each partner in sitemap.xml. Backend, real email and Beam are still TODO."),
]

BENCH = [
 ("Klook","klook.com/airport-transfers",
  "Search box sitting on the hero; vehicle cards with seats & bags; meet & greet and flight-based pickup explained; free-cancellation shown with the price",
  "Search widget on hero · vehicle cards · 'free cancellation ≥24 h' next to price · flight number in details step","Home · Choose vehicle · Details & review"),
 ("Welcome Pickups","welcomepickups.com",
  "Destination hub listing every airport/port by city; manage, edit or cancel the trip; separate 'become a driver partner' page; partner help centre per segment (hotels, agencies)",
  "Airport transfers hub · Manage booking · Drive with OKASTO · Help centre split by topic","Hub · Manage booking · Drive · Help"),
 ("Blacklane","blacklane.com",
  "Clear service lines (airport · hourly · city-to-city); free waiting stated up front; dedicated Business and Travel-agency pages; chauffeur-company onboarding with documents",
  "Service lines in nav (Transfers · Hourly charter) · waiting time stated on service & route pages · Corporate + Partners pages","Service info · Charter · Corporate · Partners"),
 ("GetTransfer","gettransfer.com",
  "Request form captures pax, luggage, child seats, extras; clear FAQ on who does what; carrier sign-up page",
  "Complete trip-details fields; plain-language 'who is responsible' in Help; supply sign-up. NOT copied: bidding marketplace — OKASTO keeps instant fixed prices","Search & quote · Help · Drive"),
 ("Kiwitaxi","kiwitaxi.com",
  "Country → airport → route landing pages with 'most-booked routes' fixed-price tables, travel times, how-to-book and FAQs; B2B affiliate programme with widgets",
  "Airport & route page template (price table + FAQ + prefilled widget) · Partners page with booking link/widget option. NOT copied: pay-driver-in-cash","Airport · City · Route pages · Partners"),
 ("Mozio","mozio.com",
  "Business-partner page listing integration options (booking tool, white label, widget, API); corporate-travel and hotel pages with 4-step 'how it works'",
  "Partners page structure + 'how it works' steps; integrations listed as 'on request' only","Partners · Corporate · Hotels"),
]
