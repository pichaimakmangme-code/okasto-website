/* OKASTO — content pages (about / contact / terms / privacy) in th / en / zh.
   Facts only. Unknowns are marked with <span class="tbc">…</span>. Terms & Privacy are DRAFTS for lawyer review.
   No bank account details and no other phone numbers than the official contacts in js/config.js. */
(function () {
var PARTNERS = "Klook · Mozio · Talixo · Drivado · Bookaway · Traveltip · WAUG";
var partnerRow = '<ul class="partner-row" aria-label="Partners"><li>Klook</li><li>Mozio</li><li>Talixo</li><li>Drivado</li><li>Bookaway</li><li>Traveltip</li><li>WAUG</li></ul>';
var ADDR = "15/4 Moo 5, Bang Rak Yai, Bang Bua Thong, Nonthaburi 11110, Thailand";
var ADDR_TH = "15/4 หมู่ 5 ต.บางรักใหญ่ อ.บางบัวทอง จ.นนทบุรี 11110";
var ADDR_ZH = "泰国暖武里府 Bang Bua Thong 县 Bang Rak Yai 区 5 村 15/4 号，邮编 11110";
var MAP = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("15/4 Moo 5 Bang Rak Yai Bang Bua Thong Nonthaburi 11110");
function card(ico, k, v, href, small, ext) {
  var val = href ? '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + v + '</a>' : '<span class="v">' + v + '</span>';
  return '<div class="contact-card"><svg class="ico" aria-hidden="true"><use href="#' + ico + '"/></svg><div><strong>' + k + '</strong>' + val + (small ? '<small>' + small + '</small>' : '') + '</div></div>';
}
function contactCards(L) {
  return '<div class="contact-cards">' +
    card("i-line", "LINE", "@okasto", "https://line.me/R/ti/p/@okasto", L[0], true) +
    card("i-wa", "WhatsApp", "+66 62 669 1009", "https://wa.me/66626691009", L[1], true) +
    card("i-phone", L[2], "+66 92 748 4646", "tel:+66927484646", L[3]) +
    card("i-mail", L[4], "booking@okasto.com", "mailto:booking@okasto.com", L[5]) +
    '</div>';
}
var TBC = { en: '<span class="tbc">to be confirmed</span>', th: '<span class="tbc">รอยืนยัน</span>', zh: '<span class="tbc">待确认</span>' };

window.OKASTO_PAGES = {
/* ============================== ABOUT ============================== */
about: {
  en: { title: "About OKASTO", lead: "Private airport transfers and car-with-driver charters in Thailand, run by Okasto Co., Ltd.",
    body:
'<h2>Who we are</h2>' +
'<p>OKASTO is the transfer brand of <strong>Okasto Co., Ltd.</strong>, a Thai company founded on 19 January 2024 and based in Bang Bua Thong, Nonthaburi. We arrange private transfers with a driver: one car (or van) for you and your group, door to door, at a fixed price per vehicle.</p>' +
'<ul class="fact-list">' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>Since 2024</strong> — founded 19 January 2024</span></li>' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>200+ vehicles</strong> in service, from economy sedans to luxury vans</span></li>' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>24/7</strong> support by phone, LINE, WhatsApp and email</span></li></ul>' +
'<h2>Where we drive</h2>' +
'<p>Private airport transfers in <strong>Bangkok, Pattaya and Phuket</strong>: from Suvarnabhumi (BKK), Don Mueang (DMK), U-Tapao (UTP) and Phuket (HKT) airports to hotels and addresses in Bangkok, Pattaya and Phuket. Our price list also covers routes to Hua Hin, Khao Lak and Krabi, and we offer a car with driver by the hour.</p>' +
'<h2>What is included</h2>' +
'<ul><li>Fixed net price per vehicle (not per person), including tolls, fuel, mileage, the driver and first-class insurance.</li>' +
'<li>Meet &amp; greet: the driver waits in the arrivals hall with a sign showing your name.</li>' +
'<li>2 hours of free waiting on airport arrivals; flight delays, early arrivals and airline cancellations at no extra charge.</li>' +
'<li>One free 15-minute stop on the way; the first child seat free of charge.</li></ul>' +
'<h2>Our vehicles</h2>' +
'<table><thead><tr><th>Class</th><th>Models (or similar)</th><th>Passengers</th></tr></thead><tbody>' +
'<tr><td>Economy</td><td>Toyota Altis / Vios</td><td>up to 3</td></tr>' +
'<tr><td>SUV</td><td>Toyota Fortuner / Innova</td><td>up to 4</td></tr>' +
'<tr><td>Premium</td><td>Toyota New Camry</td><td>up to 3</td></tr>' +
'<tr><td>Electric SUV</td><td>MG EV, BYD E8, BYD Atto 3</td><td>up to 3</td></tr>' +
'<tr><td>Normal van</td><td>Toyota Hiace / Commuter</td><td>6–9</td></tr>' +
'<tr><td>Luxury van</td><td>Toyota Alphard</td><td>up to 5</td></tr></tbody></table>' +
'<p class="muted">Each vehicle takes 2 standard (24-inch) bags. See the <a href="index.html#luggage-size">luggage size guide</a>.</p>' +
'<h2>Partners</h2>' +
'<p>OKASTO transfers are also available through partner travel platforms, including:</p>' + partnerRow +
'<p class="muted">Partner names are shown for information only and do not imply endorsement by these companies.</p>' +
'<h2>Company details</h2>' +
'<table><tbody><tr><th>Company</th><td>Okasto Co., Ltd.</td></tr><tr><th>Founded</th><td>19 January 2024</td></tr><tr><th>Address</th><td>' + ADDR + '</td></tr><tr><th>Contact</th><td><a href="contact.html">Contact page</a> · booking@okasto.com</td></tr></tbody></table>' },
  th: { title: "เกี่ยวกับ OKASTO", lead: "บริการรถรับส่งสนามบินส่วนตัวและเช่ารถพร้อมคนขับในประเทศไทย ดำเนินการโดย Okasto Co., Ltd.",
    body:
'<h2>เราคือใคร</h2>' +
'<p>OKASTO เป็นแบรนด์บริการรถรับส่งของ <strong>Okasto Co., Ltd.</strong> บริษัทไทยที่ก่อตั้งเมื่อวันที่ 19 มกราคม 2567 ตั้งอยู่ที่อำเภอบางบัวทอง จังหวัดนนทบุรี เราให้บริการรถรับส่งส่วนตัวพร้อมคนขับ รถหนึ่งคัน (หรือรถตู้) สำหรับคุณและผู้ร่วมเดินทาง รับส่งถึงที่ ในราคาเหมาต่อคัน</p>' +
'<ul class="fact-list">' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>ก่อตั้งปี 2567</strong> — 19 มกราคม 2567</span></li>' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>รถให้บริการกว่า 200 คัน</strong> ตั้งแต่รถเก๋งอีโคโนมีถึงรถตู้หรู</span></li>' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>ติดต่อได้ 24 ชั่วโมง</strong> ทางโทรศัพท์ LINE WhatsApp และอีเมล</span></li></ul>' +
'<h2>พื้นที่ให้บริการ</h2>' +
'<p>รถรับส่งสนามบินส่วนตัวใน<strong>กรุงเทพฯ พัทยา และภูเก็ต</strong> จากสนามบินสุวรรณภูมิ (BKK) ดอนเมือง (DMK) อู่ตะเภา (UTP) และภูเก็ต (HKT) ไปยังโรงแรมและที่อยู่ในกรุงเทพฯ พัทยา และภูเก็ต ตารางราคายังครอบคลุมเส้นทางไปหัวหิน เขาหลัก และกระบี่ และมีบริการเช่ารถพร้อมคนขับรายชั่วโมง</p>' +
'<h2>ราคานี้รวมอะไรบ้าง</h2>' +
'<ul><li>ราคาเหมาสุทธิต่อคัน (ไม่ใช่ต่อคน) รวมค่าทางด่วน ค่าน้ำมัน ค่าระยะทาง ค่าคนขับ และประกันภัยชั้นหนึ่ง</li>' +
'<li>บริการรอรับ: คนขับถือป้ายชื่อของคุณรอที่โถงผู้โดยสารขาเข้า</li>' +
'<li>ขาเข้ารอฟรี 2 ชั่วโมง เที่ยวบินล่าช้า มาถึงก่อนเวลา หรือสายการบินยกเลิก ไม่มีค่าใช้จ่ายเพิ่ม</li>' +
'<li>แวะพักฟรี 1 ครั้ง 15 นาทีระหว่างทาง คาร์ซีทเด็กตัวแรกฟรี</li></ul>' +
'<h2>รถของเรา</h2>' +
'<table><thead><tr><th>ประเภท</th><th>รุ่น (หรือเทียบเท่า)</th><th>ผู้โดยสาร</th></tr></thead><tbody>' +
'<tr><td>Economy</td><td>Toyota Altis / Vios</td><td>ไม่เกิน 3</td></tr>' +
'<tr><td>SUV</td><td>Toyota Fortuner / Innova</td><td>ไม่เกิน 4</td></tr>' +
'<tr><td>Premium</td><td>Toyota New Camry</td><td>ไม่เกิน 3</td></tr>' +
'<tr><td>Electric SUV</td><td>MG EV, BYD E8, BYD Atto 3</td><td>ไม่เกิน 3</td></tr>' +
'<tr><td>รถตู้</td><td>Toyota Hiace / Commuter</td><td>6–9</td></tr>' +
'<tr><td>รถตู้หรู</td><td>Toyota Alphard</td><td>ไม่เกิน 5</td></tr></tbody></table>' +
'<p class="muted">รถแต่ละคันรับกระเป๋ามาตรฐาน (24 นิ้ว) ได้ 2 ใบ ดู<a href="index.html#luggage-size">คู่มือขนาดกระเป๋า</a></p>' +
'<h2>พาร์ทเนอร์</h2>' +
'<p>จองบริการของ OKASTO ได้ผ่านแพลตฟอร์มท่องเที่ยวพาร์ทเนอร์ ได้แก่</p>' + partnerRow +
'<p class="muted">ชื่อพาร์ทเนอร์แสดงเพื่อเป็นข้อมูลเท่านั้น ไม่ได้หมายความว่าบริษัทเหล่านี้รับรองบริการของเรา</p>' +
'<h2>ข้อมูลบริษัท</h2>' +
'<table><tbody><tr><th>บริษัท</th><td>Okasto Co., Ltd.</td></tr><tr><th>ก่อตั้ง</th><td>19 มกราคม 2567</td></tr><tr><th>ที่อยู่</th><td>' + ADDR_TH + '</td></tr><tr><th>ติดต่อ</th><td><a href="contact.html">หน้าติดต่อเรา</a> · booking@okasto.com</td></tr></tbody></table>' },
  zh: { title: "关于 OKASTO", lead: "泰国私人机场接送及带司机包车服务，由 Okasto Co., Ltd. 运营。",
    body:
'<h2>我们是谁</h2>' +
'<p>OKASTO 是 <strong>Okasto Co., Ltd.</strong> 旗下的接送品牌。公司于 2024 年 1 月 19 日在泰国成立，位于暖武里府 Bang Bua Thong。我们提供带司机的私人接送：一辆轿车（或商务车）专供您和同行人使用，门到门服务，按车一口价。</p>' +
'<ul class="fact-list">' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>成立于 2024 年</strong> — 2024 年 1 月 19 日</span></li>' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>200+ 辆</strong>运营车辆，从经济型轿车到豪华商务车</span></li>' +
'<li><svg class="ico"><use href="#i-check"/></svg><span><strong>24/7</strong> 电话、LINE、WhatsApp 和邮件客服</span></li></ul>' +
'<h2>服务范围</h2>' +
'<p><strong>曼谷、芭提雅和普吉岛</strong>的私人机场接送：从素万那普（BKK）、廊曼（DMK）、乌塔堡（UTP）和普吉（HKT）机场往返曼谷、芭提雅和普吉岛的酒店及地址。价格表还包括前往华欣、考拉和甲米的路线，并提供按小时计费的带司机包车。</p>' +
'<h2>价格包含</h2>' +
'<ul><li>按车计价的固定净价（非按人计价），含过路费、油费、里程费、司机费和一级保险。</li>' +
'<li>举牌接机：司机在到达大厅举着写有您姓名的牌子等候。</li>' +
'<li>接机免费等候 2 小时；航班延误、提前抵达或航空公司取消均不额外收费。</li>' +
'<li>途中可免费停靠一次 15 分钟；第一个儿童座椅免费。</li></ul>' +
'<h2>车型</h2>' +
'<table><thead><tr><th>类别</th><th>车型（或同级）</th><th>乘客</th></tr></thead><tbody>' +
'<tr><td>经济型</td><td>Toyota Altis / Vios</td><td>最多 3 人</td></tr>' +
'<tr><td>SUV</td><td>Toyota Fortuner / Innova</td><td>最多 4 人</td></tr>' +
'<tr><td>高级型</td><td>Toyota New Camry</td><td>最多 3 人</td></tr>' +
'<tr><td>电动 SUV</td><td>MG EV、BYD E8、BYD Atto 3</td><td>最多 3 人</td></tr>' +
'<tr><td>商务车</td><td>Toyota Hiace / Commuter</td><td>6–9 人</td></tr>' +
'<tr><td>豪华商务车</td><td>Toyota Alphard</td><td>最多 5 人</td></tr></tbody></table>' +
'<p class="muted">每辆车可放 2 件标准行李（24 英寸）。请参阅<a href="index.html#luggage-size">行李尺寸指南</a>。</p>' +
'<h2>合作伙伴</h2>' +
'<p>您也可以通过以下合作旅行平台预订 OKASTO 接送服务：</p>' + partnerRow +
'<p class="muted">合作伙伴名称仅供参考，并不代表这些公司对我们服务的背书。</p>' +
'<h2>公司信息</h2>' +
'<table><tbody><tr><th>公司</th><td>Okasto Co., Ltd.</td></tr><tr><th>成立日期</th><td>2024 年 1 月 19 日</td></tr><tr><th>地址</th><td>' + ADDR_ZH + '<br><span class="muted">' + ADDR + '</span></td></tr><tr><th>联系</th><td><a href="contact.html">联系我们</a> · booking@okasto.com</td></tr></tbody></table>' }
},
/* ============================== CONTACT ============================== */
contact: {
  en: { title: "Contact us", lead: "We answer 24/7. The fastest way to reach us is LINE or WhatsApp.",
    body: contactCards(["Chat with us — fastest reply", "Chat or call on WhatsApp", "Phone (24/7)", "Calls answered 24 hours a day", "Email", "Bookings, changes and cancellations in writing"]) +
'<h2>Address</h2><p><strong>Okasto Co., Ltd.</strong><br>' + ADDR + '<br><a href="' + MAP + '" target="_blank" rel="noopener">Open in Google Maps</a></p>' +
'<p class="muted">This is our office address. Pickups are arranged at the airport or the address in your booking.</p>' +
'<h2>Bookings, changes and cancellations</h2><ul>' +
'<li>New booking: use <a href="index.html#book">Book &amp; Pay</a> on the home page, or send us your trip details on LINE or WhatsApp.</li>' +
'<li>Your booking is confirmed once you receive a confirmation email from OKASTO.</li>' +
'<li>Free cancellation with at least 24 hours\' notice, by email at booking@okasto.com or by phone. Changes made on-site must be in writing by email.</li>' +
'<li>Please have your booking reference (e.g. OK-…) ready when you contact us.</li></ul>' +
'<h2>Support hours</h2><p>24 hours a day, 7 days a week.</p>' },
  th: { title: "ติดต่อเรา", lead: "ติดต่อได้ตลอด 24 ชั่วโมง ช่องทางที่ตอบเร็วที่สุดคือ LINE หรือ WhatsApp",
    body: contactCards(["แชทกับเรา — ตอบเร็วที่สุด", "แชทหรือโทรผ่าน WhatsApp", "โทรศัพท์ (24 ชม.)", "รับสายตลอด 24 ชั่วโมง", "อีเมล", "การจอง เปลี่ยนแปลง และยกเลิกเป็นลายลักษณ์อักษร"]) +
'<h2>ที่อยู่</h2><p><strong>Okasto Co., Ltd.</strong><br>' + ADDR_TH + '<br><a href="' + MAP + '" target="_blank" rel="noopener">เปิดใน Google Maps</a></p>' +
'<p class="muted">นี่คือที่อยู่สำนักงาน จุดรับจะเป็นสนามบินหรือที่อยู่ตามที่ระบุในการจอง</p>' +
'<h2>การจอง การเปลี่ยนแปลง และการยกเลิก</h2><ul>' +
'<li>จองใหม่: กด <a href="index.html#book">จองและชำระเงิน</a> ที่หน้าแรก หรือส่งรายละเอียดการเดินทางมาทาง LINE หรือ WhatsApp</li>' +
'<li>การจองจะยืนยันเมื่อคุณได้รับอีเมลยืนยันจาก OKASTO</li>' +
'<li>ยกเลิกฟรีเมื่อแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง ทางอีเมล booking@okasto.com หรือโทรศัพท์ การเปลี่ยนแปลงที่หน้างานต้องแจ้งเป็นลายลักษณ์อักษรทางอีเมล</li>' +
'<li>กรุณาเตรียมหมายเลขการจอง (เช่น OK-…) ไว้เมื่อติดต่อเรา</li></ul>' +
'<h2>เวลาทำการ</h2><p>ตลอด 24 ชั่วโมง ทุกวัน</p>' },
  zh: { title: "联系我们", lead: "24/7 全天候服务。最快的联系方式是 LINE 或 WhatsApp。",
    body: contactCards(["在线聊天 — 回复最快", "WhatsApp 聊天或通话", "电话（24 小时）", "24 小时接听", "电子邮件", "预订、变更和取消（书面）"]) +
'<h2>地址</h2><p><strong>Okasto Co., Ltd.</strong><br>' + ADDR_ZH + '<br><span class="muted">' + ADDR + '</span><br><a href="' + MAP + '" target="_blank" rel="noopener">在 Google 地图中打开</a></p>' +
'<p class="muted">这是我们的办公地址。接送地点为机场或您预订中填写的地址。</p>' +
'<h2>预订、变更和取消</h2><ul>' +
'<li>新预订：在首页点击<a href="index.html#book">预订并付款</a>，或通过 LINE / WhatsApp 发送行程信息。</li>' +
'<li>收到 OKASTO 发送的确认邮件后，预订即告确认。</li>' +
'<li>提前至少 24 小时通过邮件 booking@okasto.com 或电话通知，可免费取消。现场变更须通过电子邮件书面提出。</li>' +
'<li>联系我们时请准备好预订编号（例如 OK-…）。</li></ul>' +
'<h2>服务时间</h2><p>每周 7 天，每天 24 小时。</p>' }
},
/* ============================== TERMS (DRAFT) ============================== */
terms: {
  en: { title: "Terms & Conditions", lead: "The terms that apply when you book a private transfer or charter with OKASTO.", draft: "DRAFT — for review by a lawyer before publication. Items marked “to be confirmed” still need a decision.",
    body:
'<p class="muted">Draft version: 26 October 2026</p>' +
'<h2>1. Who we are</h2><p>These terms apply to bookings with Okasto Co., Ltd. (“OKASTO”, “we”), ' + ADDR + '. Email booking@okasto.com, phone +66 92 748 4646 (24/7).</p>' +
'<h2>2. Booking and confirmation</h2><ul>' +
'<li>You can book through this website (Book &amp; Pay), LINE, WhatsApp or email, or through a partner platform. Bookings made through a partner platform are also subject to that platform\'s terms.</li>' +
'<li>A booking is valid only once you receive a confirmation email from OKASTO.</li>' +
'<li>Please give correct details: names, phone, email, flight number, pickup and drop-off address, date and time, number of passengers and bags. We are not responsible for problems caused by incorrect details.</li>' +
'<li>Prices shown for addresses outside our listed price zones are estimates; the final price is confirmed by chat before you pay.</li></ul>' +
'<h2>3. Prices and payment</h2><ul>' +
'<li>Prices are net, in Thai baht, <strong>per vehicle</strong> (not per person), and include tolls, fuel, mileage, the driver and first-class insurance.</li>' +
'<li>Payment is made online through Beam Checkout (credit/debit card, PromptPay QR, mobile banking or e-wallet). We do not accept cash. OKASTO does not see or store your card details.</li>' +
'<li>Extra services are charged as stated: each child seat after the first costs ฿300 per booking; waiting beyond the free time is charged by the hour (rate ' + TBC.en + ').</li></ul>' +
'<h2>4. Waiting time and flight changes</h2><ul>' +
'<li>Airport arrivals: 2 hours of free waiting, counted from the actual landing time ' + TBC.en + '.</li>' +
'<li>Departures and other pickups: 15-minute grace period; after that, waiting is charged by the hour.</li>' +
'<li>Flight delays, early arrivals and airline cancellations are covered at no extra charge when you give us your flight number.</li></ul>' +
'<h2>5. Stops, child seats and special requests</h2><ul>' +
'<li>One free 15-minute stop during the trip (restroom, pharmacy, etc.). Additional stops: ' + TBC.en + '.</li>' +
'<li>Child seats: the first one is free; each extra seat costs ฿300 per booking. Please request seats when booking.</li></ul>' +
'<h2>6. Luggage</h2><ul>' +
'<li>Each vehicle takes 2 standard (24-inch) bags.</li>' +
'<li>Bags larger than 24 inch and smaller than 28 inch count as 2 standard bags; larger bags count as 3.</li>' +
'<li>Special items (including wheelchairs, strollers, surfboards and golf equipment) count as 1 extra-large bag. Sedans cannot take wheelchairs; surfboards and bicycles need a van.</li>' +
'<li>If there are more passengers or more luggage than the vehicle allows, the driver may refuse the service, and no refund is given. Please choose a larger vehicle when in doubt.</li></ul>' +
'<h2>7. Changes and cancellation</h2><ul>' +
'<li>Free cancellation with at least 24 hours\' notice before pickup, by email at booking@okasto.com or by phone at +66 92 748 4646.</li>' +
'<li>Cancellations or changes made on-site must be in writing by email.</li>' +
'<li>A cancellation is valid only once you receive a confirmation email from OKASTO.</li>' +
'<li>Cancellations with less than 24 hours\' notice are charged in full.</li>' +
'<li>Refund method and timing for free cancellations: ' + TBC.en + ' (refunds go back through Beam to the original payment method).</li></ul>' +
'<h2>8. No-show</h2><p>If you do not come to the agreed pickup point within the waiting time and we cannot reach you, the booking counts as a no-show and is charged in full. Please contact us as soon as possible if you are delayed.</p>' +
'<h2>9. Passenger conduct</h2><ul>' +
'<li>Passengers must wear seat belts and follow the driver\'s safety instructions and Thai law.</li>' +
'<li>Illegal or dangerous items may not be carried. Smoking in the vehicle: ' + TBC.en + '.</li>' +
'<li>The driver may refuse or end a trip if a passenger\'s behaviour puts the driver, other passengers or the vehicle at risk; in that case no refund is given.</li>' +
'<li>Cleaning or repair costs for damage or heavy soiling caused by passengers may be charged ' + TBC.en + '.</li></ul>' +
'<h2>10. Liability</h2><ul>' +
'<li>Our vehicles carry first-class insurance. Passengers are responsible for their own belongings; please check the vehicle before leaving it.</li>' +
'<li>We plan pickup times with reasonable margins, but we are not responsible for delays or missed flights caused by events outside our control, such as traffic, weather, road closures, accidents involving third parties, or incorrect information provided by the customer.</li>' +
'<li>Limit of liability (for example up to the price paid for the booking) and force majeure wording: ' + TBC.en + ' — to be drafted by the lawyer.</li></ul>' +
'<h2>11. Governing law</h2><p>These terms are governed by the laws of Thailand ' + TBC.en + '.</p>' +
'<h2>12. Contact</h2><p>Questions about these terms: booking@okasto.com, LINE @okasto, WhatsApp +66 62 669 1009, phone +66 92 748 4646 (24/7). See also our <a href="privacy.html">Privacy Policy</a>.</p>' },
  th: { title: "ข้อกำหนดและเงื่อนไข", lead: "ข้อกำหนดที่ใช้เมื่อคุณจองรถรับส่งส่วนตัวหรือเช่ารถพร้อมคนขับกับ OKASTO", draft: "ฉบับร่าง — ต้องให้ทนายความตรวจสอบก่อนเผยแพร่ หัวข้อที่ระบุว่า “รอยืนยัน” ยังต้องตัดสินใจ",
    body:
'<p class="muted">ฉบับร่าง: 26 ตุลาคม 2569</p>' +
'<h2>1. เราคือใคร</h2><p>ข้อกำหนดนี้ใช้กับการจองกับ Okasto Co., Ltd. (“OKASTO”, “เรา”) ' + ADDR_TH + ' อีเมล booking@okasto.com โทร +66 92 748 4646 (24 ชม.)</p>' +
'<h2>2. การจองและการยืนยัน</h2><ul>' +
'<li>จองได้ผ่านเว็บไซต์นี้ (จองและชำระเงิน) LINE WhatsApp อีเมล หรือแพลตฟอร์มพาร์ทเนอร์ การจองผ่านแพลตฟอร์มพาร์ทเนอร์อยู่ภายใต้เงื่อนไขของแพลตฟอร์มนั้นด้วย</li>' +
'<li>การจองจะมีผลเมื่อคุณได้รับอีเมลยืนยันจาก OKASTO เท่านั้น</li>' +
'<li>กรุณาให้ข้อมูลที่ถูกต้อง: ชื่อ โทรศัพท์ อีเมล เที่ยวบิน ที่อยู่รับและส่ง วันและเวลา จำนวนผู้โดยสารและกระเป๋า เราไม่รับผิดชอบปัญหาที่เกิดจากข้อมูลไม่ถูกต้อง</li>' +
'<li>ราคาสำหรับที่อยู่นอกโซนราคาที่กำหนดเป็นราคาประมาณการ ราคาสุดท้ายยืนยันทางแชทก่อนชำระเงิน</li></ul>' +
'<h2>3. ราคาและการชำระเงิน</h2><ul>' +
'<li>ราคาเป็นราคาสุทธิ หน่วยเป็นบาท <strong>ต่อคัน</strong> (ไม่ใช่ต่อคน) รวมค่าทางด่วน ค่าน้ำมัน ค่าระยะทาง ค่าคนขับ และประกันภัยชั้นหนึ่ง</li>' +
'<li>ชำระเงินออนไลน์ผ่าน Beam Checkout (บัตรเครดิต/เดบิต พร้อมเพย์ QR โมบายแบงก์กิ้ง หรืออีวอลเล็ท) ไม่รับเงินสด OKASTO ไม่เห็นและไม่เก็บข้อมูลบัตรของคุณ</li>' +
'<li>บริการเสริมคิดตามที่แจ้ง: คาร์ซีทเด็กตัวที่สองขึ้นไป ตัวละ ฿300 ต่อการจอง การรอเกินเวลาฟรีคิดเป็นรายชั่วโมง (อัตรา ' + TBC.th + ')</li></ul>' +
'<h2>4. เวลารอและการเปลี่ยนแปลงเที่ยวบิน</h2><ul>' +
'<li>รับที่สนามบินขาเข้า: รอฟรี 2 ชั่วโมง นับจากเวลาเครื่องลงจริง ' + TBC.th + '</li>' +
'<li>ขาออกและการรับจากที่อื่น: ผ่อนผัน 15 นาที หลังจากนั้นคิดค่ารอเป็นรายชั่วโมง</li>' +
'<li>เที่ยวบินล่าช้า มาถึงก่อนเวลา หรือสายการบินยกเลิก ไม่มีค่าใช้จ่ายเพิ่ม เมื่อคุณแจ้งหมายเลขเที่ยวบิน</li></ul>' +
'<h2>5. การแวะพัก คาร์ซีท และคำขอพิเศษ</h2><ul>' +
'<li>แวะพักฟรี 1 ครั้ง 15 นาทีระหว่างทาง (ห้องน้ำ ร้านขายยา ฯลฯ) การแวะเพิ่ม: ' + TBC.th + '</li>' +
'<li>คาร์ซีทเด็ก: ตัวแรกฟรี ตัวถัดไปตัวละ ฿300 ต่อการจอง กรุณาแจ้งตอนจอง</li></ul>' +
'<h2>6. สัมภาระ</h2><ul>' +
'<li>รถแต่ละคันรับกระเป๋ามาตรฐาน (24 นิ้ว) ได้ 2 ใบ</li>' +
'<li>กระเป๋าใหญ่กว่า 24 นิ้วแต่เล็กกว่า 28 นิ้ว นับเป็น 2 ใบ ใหญ่กว่านั้นนับเป็น 3 ใบ</li>' +
'<li>สิ่งของพิเศษ (รวมถึงวีลแชร์ รถเข็นเด็ก กระดานโต้คลื่น อุปกรณ์กอล์ฟ) นับเป็นกระเป๋าใหญ่พิเศษ 1 ใบ รถเก๋งรับวีลแชร์ไม่ได้ กระดานโต้คลื่นและจักรยานต้องใช้รถตู้</li>' +
'<li>หากผู้โดยสารหรือสัมภาระเกินกว่าที่รถรองรับ คนขับอาจปฏิเสธการให้บริการ และจะไม่มีการคืนเงิน หากไม่แน่ใจกรุณาเลือกรถคันใหญ่ขึ้น</li></ul>' +
'<h2>7. การเปลี่ยนแปลงและการยกเลิก</h2><ul>' +
'<li>ยกเลิกฟรีเมื่อแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมงก่อนเวลารับ ทางอีเมล booking@okasto.com หรือโทร +66 92 748 4646</li>' +
'<li>การยกเลิกหรือเปลี่ยนแปลงที่หน้างาน ต้องแจ้งเป็นลายลักษณ์อักษรทางอีเมล</li>' +
'<li>การยกเลิกจะมีผลเมื่อคุณได้รับอีเมลยืนยันจาก OKASTO เท่านั้น</li>' +
'<li>การยกเลิกโดยแจ้งล่วงหน้าน้อยกว่า 24 ชั่วโมง เรียกเก็บค่าบริการเต็มจำนวน</li>' +
'<li>วิธีและระยะเวลาคืนเงินกรณียกเลิกฟรี: ' + TBC.th + ' (คืนผ่าน Beam ไปยังช่องทางที่ชำระเดิม)</li></ul>' +
'<h2>8. การไม่มาใช้บริการ (No-show)</h2><p>หากคุณไม่มาที่จุดรับภายในเวลารอ และเราติดต่อคุณไม่ได้ จะถือว่าไม่มาใช้บริการและเรียกเก็บค่าบริการเต็มจำนวน หากล่าช้ากรุณาติดต่อเราโดยเร็วที่สุด</p>' +
'<h2>9. ความประพฤติของผู้โดยสาร</h2><ul>' +
'<li>ผู้โดยสารต้องคาดเข็มขัดนิรภัย ปฏิบัติตามคำแนะนำด้านความปลอดภัยของคนขับและกฎหมายไทย</li>' +
'<li>ห้ามนำสิ่งของผิดกฎหมายหรือสิ่งของอันตรายขึ้นรถ การสูบบุหรี่ในรถ: ' + TBC.th + '</li>' +
'<li>คนขับอาจปฏิเสธหรือยุติการเดินทาง หากพฤติกรรมของผู้โดยสารเป็นอันตรายต่อคนขับ ผู้โดยสารอื่น หรือตัวรถ โดยไม่มีการคืนเงิน</li>' +
'<li>อาจเรียกเก็บค่าทำความสะอาดหรือค่าซ่อมหากผู้โดยสารทำให้รถเสียหายหรือสกปรกมาก ' + TBC.th + '</li></ul>' +
'<h2>10. ความรับผิด</h2><ul>' +
'<li>รถของเรามีประกันภัยชั้นหนึ่ง ผู้โดยสารต้องดูแลทรัพย์สินของตนเอง กรุณาตรวจดูก่อนลงจากรถ</li>' +
'<li>เราวางแผนเวลารับโดยเผื่อเวลาอย่างเหมาะสม แต่ไม่รับผิดชอบความล่าช้าหรือการตกเครื่องที่เกิดจากเหตุนอกเหนือการควบคุม เช่น การจราจร สภาพอากาศ การปิดถนน อุบัติเหตุจากบุคคลภายนอก หรือข้อมูลที่ลูกค้าให้ไม่ถูกต้อง</li>' +
'<li>วงเงินความรับผิด (เช่น ไม่เกินราคาที่ชำระสำหรับการจอง) และข้อความเหตุสุดวิสัย: ' + TBC.th + ' — ให้ทนายความร่าง</li></ul>' +
'<h2>11. กฎหมายที่ใช้บังคับ</h2><p>ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย ' + TBC.th + '</p>' +
'<h2>12. ติดต่อ</h2><p>สอบถามเกี่ยวกับข้อกำหนดนี้: booking@okasto.com, LINE @okasto, WhatsApp +66 62 669 1009, โทร +66 92 748 4646 (24 ชม.) ดู<a href="privacy.html">นโยบายความเป็นส่วนตัว</a>ด้วย</p>' },
  zh: { title: "条款与条件", lead: "您通过 OKASTO 预订私人接送或包车时适用的条款。", draft: "草稿 — 发布前须由律师审核。标有“待确认”的内容仍需决定。",
    body:
'<p class="muted">草稿版本：2026 年 10 月 26 日</p>' +
'<h2>1. 关于我们</h2><p>本条款适用于与 Okasto Co., Ltd.（“OKASTO”或“我们”）的预订。地址：' + ADDR_ZH + '。邮箱 booking@okasto.com，电话 +66 92 748 4646（24 小时）。</p>' +
'<h2>2. 预订与确认</h2><ul>' +
'<li>您可以通过本网站（预订并付款）、LINE、WhatsApp、电子邮件或合作平台预订。通过合作平台的预订同时适用该平台的条款。</li>' +
'<li>只有在您收到 OKASTO 的确认邮件后，预订才有效。</li>' +
'<li>请提供正确的信息：姓名、电话、邮箱、航班号、上下车地址、日期时间、乘客人数和行李件数。因信息错误造成的问题，我们不承担责任。</li>' +
'<li>价格区域以外地址的价格为预估价，最终价格在付款前通过聊天确认。</li></ul>' +
'<h2>3. 价格与付款</h2><ul>' +
'<li>价格为泰铢净价，<strong>按车计价</strong>（非按人计价），含过路费、油费、里程费、司机费和一级保险。</li>' +
'<li>通过 Beam Checkout 在线付款（信用卡/借记卡、PromptPay 二维码、手机银行或电子钱包）。不接受现金。OKASTO 不会看到或保存您的银行卡信息。</li>' +
'<li>附加服务按说明收费：第二个起每个儿童座椅每次预订 ฿300；超出免费等候时间按小时收费（费率' + TBC.zh + '）。</li></ul>' +
'<h2>4. 等候时间与航班变动</h2><ul>' +
'<li>接机：免费等候 2 小时，从航班实际落地时间起算 ' + TBC.zh + '。</li>' +
'<li>送机及其他上车地点：15 分钟宽限期，之后按小时收取等候费。</li>' +
'<li>提供航班号后，航班延误、提前抵达或航空公司取消均不额外收费。</li></ul>' +
'<h2>5. 停靠、儿童座椅和特殊要求</h2><ul>' +
'<li>途中可免费停靠一次 15 分钟（洗手间、药店等）。额外停靠：' + TBC.zh + '。</li>' +
'<li>儿童座椅：第一个免费，之后每个每次预订 ฿300。请在预订时说明。</li></ul>' +
'<h2>6. 行李</h2><ul>' +
'<li>每辆车可放 2 件标准行李（24 英寸）。</li>' +
'<li>大于 24 英寸且小于 28 英寸的行李按 2 件计算；更大的行李按 3 件计算。</li>' +
'<li>特殊物品（包括轮椅、婴儿车、冲浪板和高尔夫球具）按 1 件超大行李计算。轿车无法容纳轮椅；冲浪板和自行车需预订商务车。</li>' +
'<li>如乘客或行李超出车辆容量，司机可拒绝服务，且不予退款。如不确定，请选择更大的车型。</li></ul>' +
'<h2>7. 变更与取消</h2><ul>' +
'<li>在接送时间前至少 24 小时通过邮件 booking@okasto.com 或电话 +66 92 748 4646 通知，可免费取消。</li>' +
'<li>现场取消或变更须通过电子邮件书面提出。</li>' +
'<li>取消仅在您收到 OKASTO 的确认邮件后方为有效。</li>' +
'<li>提前不足 24 小时取消将收取全额费用。</li>' +
'<li>免费取消的退款方式和时间：' + TBC.zh + '（通过 Beam 原路退回）。</li></ul>' +
'<h2>8. 未出现（No-show）</h2><p>如您在等候时间内未到达约定上车地点且我们无法联系到您，将视为未出现并收取全额费用。如有延误，请尽快联系我们。</p>' +
'<h2>9. 乘客行为</h2><ul>' +
'<li>乘客须系好安全带，遵守司机的安全指示和泰国法律。</li>' +
'<li>不得携带违法或危险物品。车内吸烟：' + TBC.zh + '。</li>' +
'<li>如乘客行为危及司机、其他乘客或车辆，司机可拒绝或终止行程，且不予退款。</li>' +
'<li>乘客造成车辆损坏或严重弄脏，可能需支付清洁或维修费用 ' + TBC.zh + '。</li></ul>' +
'<h2>10. 责任</h2><ul>' +
'<li>我们的车辆均投保一级保险。乘客须自行保管随身物品，下车前请检查。</li>' +
'<li>我们会合理预留接送时间，但对交通、天气、道路封闭、第三方事故或客户提供错误信息等不可控因素造成的延误或误机不承担责任。</li>' +
'<li>责任上限（例如不超过该预订的支付金额）及不可抗力条款：' + TBC.zh + ' — 由律师起草。</li></ul>' +
'<h2>11. 适用法律</h2><p>本条款受泰国法律管辖 ' + TBC.zh + '。</p>' +
'<h2>12. 联系方式</h2><p>如对本条款有疑问：booking@okasto.com、LINE @okasto、WhatsApp +66 62 669 1009、电话 +66 92 748 4646（24 小时）。另请参阅<a href="privacy.html">隐私政策</a>。</p>' }
},
/* ============================== PRIVACY (DRAFT, PDPA) ============================== */
privacy: {
  en: { title: "Privacy Policy", lead: "How OKASTO collects and uses your personal data, under Thailand's Personal Data Protection Act B.E. 2562 (PDPA).", draft: "DRAFT — for review by a lawyer before publication. Items marked “to be confirmed” still need a decision.",
    body:
'<p class="muted">Draft version: 26 October 2026</p>' +
'<h2>1. Data controller</h2><p>Okasto Co., Ltd., ' + ADDR + '. Email: booking@okasto.com. Data protection contact / DPO: ' + TBC.en + '.</p>' +
'<h2>2. Data we collect</h2><ul>' +
'<li><strong>Booking form:</strong> name, phone / WhatsApp number, email, flight number, pickup and drop-off places, date and time, number of passengers and large bags, vehicle class, chosen payment method and booking reference.</li>' +
'<li><strong>Messages:</strong> what you send us on LINE, WhatsApp, email or by phone (for example special requests such as child seats or wheelchairs).</li>' +
'<li><strong>Payment:</strong> payments are processed by Beam Checkout. We receive the payment status, amount and reference; we do not receive or store full card numbers.</li>' +
'<li><strong>Bookings via partners:</strong> if you book through a partner platform (for example Klook or Mozio), the partner passes us the details needed for your transfer.</li>' +
'<li><strong>On your device:</strong> the website saves your language choice in your browser (local storage). It does not use advertising or analytics cookies at present.</li></ul>' +
'<h2>3. Why we use it (purpose and legal basis)</h2><ul>' +
'<li>To arrange and carry out your transfer: quote, confirm, assign a driver, track your flight and contact you — <em>performance of a contract</em>.</li>' +
'<li>To take payment and handle refunds — <em>contract</em>.</li>' +
'<li>To keep accounting and tax records — <em>legal obligation</em>.</li>' +
'<li>For safety, preventing fraud and improving our service — <em>legitimate interests</em>.</li>' +
'<li>We do not send marketing messages without your consent.</li></ul>' +
'<h2>4. Who we share it with</h2><ul>' +
'<li><strong>Beam Checkout</strong> (payment provider), to process your payment.</li>' +
'<li><strong>Your driver</strong>: name, phone, flight, pickup and drop-off, time, passengers and luggage — only what is needed for the trip.</li>' +
'<li><strong>Messaging services you choose</strong> (LINE, WhatsApp) and our email provider, which carry the messages.</li>' +
'<li><strong>Address search:</strong> text you type in the pickup / drop-off boxes is sent to the Photon geocoder (photon.komoot.io, OpenStreetMap data) to suggest places.</li>' +
'<li><strong>Partner platforms</strong>, for bookings made through them; and <strong>authorities</strong>, when required by law.</li>' +
'<li>We do not sell your personal data.</li></ul>' +
'<h2>5. Transfers outside Thailand</h2><p>Some providers (for example messaging and email services) may process data outside Thailand. Safeguards: ' + TBC.en + '.</p>' +
'<h2>6. How long we keep it</h2><p>Booking data is kept as long as needed to provide the service and handle questions or claims, and as required by Thai accounting and tax law. Exact retention period: ' + TBC.en + '. After that it is deleted or anonymised.</p>' +
'<h2>7. Security</h2><p>Access to booking data is limited to staff and drivers who need it. Card payments are handled on Beam\'s secure payment page.</p>' +
'<h2>8. Your rights</h2><p>Under the PDPA you can ask to access or get a copy of your data, correct it, delete it, restrict or object to its use, move it to another service, and withdraw consent where we rely on consent. You can also complain to the Office of the Personal Data Protection Committee (PDPC). To use your rights, email booking@okasto.com. Response time: ' + TBC.en + '.</p>' +
'<h2>9. Changes</h2><p>We may update this policy. The version date at the top shows the latest change.</p>' +
'<h2>10. Contact</h2><p>booking@okasto.com · LINE @okasto · WhatsApp +66 62 669 1009 · +66 92 748 4646 (24/7). See also our <a href="terms.html">Terms &amp; Conditions</a>.</p>' },
  th: { title: "นโยบายความเป็นส่วนตัว", lead: "OKASTO เก็บและใช้ข้อมูลส่วนบุคคลของคุณอย่างไร ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)", draft: "ฉบับร่าง — ต้องให้ทนายความตรวจสอบก่อนเผยแพร่ หัวข้อที่ระบุว่า “รอยืนยัน” ยังต้องตัดสินใจ",
    body:
'<p class="muted">ฉบับร่าง: 26 ตุลาคม 2569</p>' +
'<h2>1. ผู้ควบคุมข้อมูลส่วนบุคคล</h2><p>Okasto Co., Ltd. ' + ADDR_TH + ' อีเมล booking@okasto.com ผู้ติดต่อด้านข้อมูลส่วนบุคคล / DPO: ' + TBC.th + '</p>' +
'<h2>2. ข้อมูลที่เราเก็บ</h2><ul>' +
'<li><strong>แบบฟอร์มจอง:</strong> ชื่อ เบอร์โทร / WhatsApp อีเมล หมายเลขเที่ยวบิน จุดรับและจุดส่ง วันและเวลา จำนวนผู้โดยสารและกระเป๋าใหญ่ ประเภทรถ วิธีชำระเงินที่เลือก และหมายเลขการจอง</li>' +
'<li><strong>ข้อความ:</strong> สิ่งที่คุณส่งถึงเราทาง LINE WhatsApp อีเมล หรือโทรศัพท์ (เช่น คำขอพิเศษอย่างคาร์ซีทหรือวีลแชร์)</li>' +
'<li><strong>การชำระเงิน:</strong> ดำเนินการโดย Beam Checkout เราได้รับสถานะการชำระ ยอดเงิน และเลขอ้างอิง เราไม่ได้รับและไม่เก็บเลขบัตรเต็ม</li>' +
'<li><strong>การจองผ่านพาร์ทเนอร์:</strong> หากคุณจองผ่านแพลตฟอร์มพาร์ทเนอร์ (เช่น Klook หรือ Mozio) พาร์ทเนอร์จะส่งข้อมูลที่จำเป็นสำหรับการรับส่งให้เรา</li>' +
'<li><strong>บนอุปกรณ์ของคุณ:</strong> เว็บไซต์บันทึกภาษาที่คุณเลือกไว้ในเบราว์เซอร์ (local storage) ปัจจุบันไม่ใช้คุกกี้โฆษณาหรือคุกกี้วิเคราะห์</li></ul>' +
'<h2>3. วัตถุประสงค์และฐานทางกฎหมาย</h2><ul>' +
'<li>เพื่อจัดการและให้บริการรับส่ง: เสนอราคา ยืนยัน จัดคนขับ ติดตามเที่ยวบิน และติดต่อคุณ — <em>การปฏิบัติตามสัญญา</em></li>' +
'<li>เพื่อรับชำระเงินและคืนเงิน — <em>สัญญา</em></li>' +
'<li>เพื่อเก็บบันทึกทางบัญชีและภาษี — <em>หน้าที่ตามกฎหมาย</em></li>' +
'<li>เพื่อความปลอดภัย ป้องกันการทุจริต และปรับปรุงบริการ — <em>ประโยชน์โดยชอบด้วยกฎหมาย</em></li>' +
'<li>เราจะไม่ส่งข้อความการตลาดโดยไม่ได้รับความยินยอม</li></ul>' +
'<h2>4. การเปิดเผยข้อมูล</h2><ul>' +
'<li><strong>Beam Checkout</strong> (ผู้ให้บริการรับชำระเงิน) เพื่อดำเนินการชำระเงิน</li>' +
'<li><strong>คนขับของคุณ</strong>: ชื่อ เบอร์โทร เที่ยวบิน จุดรับส่ง เวลา จำนวนผู้โดยสารและสัมภาระ — เฉพาะที่จำเป็นสำหรับการเดินทาง</li>' +
'<li><strong>บริการส่งข้อความที่คุณเลือก</strong> (LINE, WhatsApp) และผู้ให้บริการอีเมลของเรา</li>' +
'<li><strong>การค้นหาที่อยู่:</strong> ข้อความที่พิมพ์ในช่องจุดรับ/จุดส่งจะถูกส่งไปยังบริการ Photon (photon.komoot.io ข้อมูล OpenStreetMap) เพื่อแนะนำสถานที่</li>' +
'<li><strong>แพลตฟอร์มพาร์ทเนอร์</strong> สำหรับการจองที่ทำผ่านแพลตฟอร์มนั้น และ<strong>หน่วยงานรัฐ</strong> เมื่อกฎหมายกำหนด</li>' +
'<li>เราไม่ขายข้อมูลส่วนบุคคลของคุณ</li></ul>' +
'<h2>5. การส่งข้อมูลไปต่างประเทศ</h2><p>ผู้ให้บริการบางราย (เช่น บริการส่งข้อความและอีเมล) อาจประมวลผลข้อมูลนอกประเทศไทย มาตรการคุ้มครอง: ' + TBC.th + '</p>' +
'<h2>6. ระยะเวลาเก็บรักษา</h2><p>เราเก็บข้อมูลการจองเท่าที่จำเป็นต่อการให้บริการและการตอบข้อซักถามหรือข้อเรียกร้อง และตามที่กฎหมายบัญชีและภาษีของไทยกำหนด ระยะเวลาที่แน่นอน: ' + TBC.th + ' หลังจากนั้นจะลบหรือทำให้ไม่สามารถระบุตัวตนได้</p>' +
'<h2>7. ความปลอดภัย</h2><p>จำกัดการเข้าถึงข้อมูลการจองเฉพาะพนักงานและคนขับที่จำเป็น การชำระด้วยบัตรทำบนหน้าชำระเงินที่ปลอดภัยของ Beam</p>' +
'<h2>8. สิทธิของคุณ</h2><p>ตาม PDPA คุณมีสิทธิขอเข้าถึงหรือขอสำเนาข้อมูล แก้ไข ลบ ระงับหรือคัดค้านการใช้ ขอโอนย้ายข้อมูล และถอนความยินยอมในกรณีที่เราอาศัยความยินยอม รวมถึงร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.) ใช้สิทธิได้ทางอีเมล booking@okasto.com ระยะเวลาตอบกลับ: ' + TBC.th + '</p>' +
'<h2>9. การเปลี่ยนแปลงนโยบาย</h2><p>เราอาจปรับปรุงนโยบายนี้ วันที่ฉบับด้านบนแสดงการแก้ไขล่าสุด</p>' +
'<h2>10. ติดต่อ</h2><p>booking@okasto.com · LINE @okasto · WhatsApp +66 62 669 1009 · +66 92 748 4646 (24 ชม.) ดู<a href="terms.html">ข้อกำหนดและเงื่อนไข</a>ด้วย</p>' },
  zh: { title: "隐私政策", lead: "OKASTO 如何依据泰国《个人数据保护法》（PDPA，佛历 2562 年）收集和使用您的个人数据。", draft: "草稿 — 发布前须由律师审核。标有“待确认”的内容仍需决定。",
    body:
'<p class="muted">草稿版本：2026 年 10 月 26 日</p>' +
'<h2>1. 数据控制者</h2><p>Okasto Co., Ltd.，' + ADDR_ZH + '。邮箱：booking@okasto.com。数据保护联系人 / DPO：' + TBC.zh + '。</p>' +
'<h2>2. 我们收集的数据</h2><ul>' +
'<li><strong>预订表单：</strong>姓名、电话 / WhatsApp、邮箱、航班号、上下车地点、日期时间、乘客人数和大件行李数、车型、所选付款方式及预订编号。</li>' +
'<li><strong>消息：</strong>您通过 LINE、WhatsApp、邮件或电话发给我们的内容（例如儿童座椅、轮椅等特殊要求）。</li>' +
'<li><strong>付款：</strong>由 Beam Checkout 处理。我们收到付款状态、金额和参考号，不会收到或保存完整卡号。</li>' +
'<li><strong>通过合作伙伴预订：</strong>如您通过合作平台（例如 Klook 或 Mozio）预订，合作伙伴会向我们提供接送所需的信息。</li>' +
'<li><strong>您的设备：</strong>网站会在浏览器中保存您选择的语言（local storage）。目前不使用广告或分析类 Cookie。</li></ul>' +
'<h2>3. 使用目的与法律依据</h2><ul>' +
'<li>安排和提供接送服务：报价、确认、分配司机、跟踪航班并与您联系 — <em>履行合同</em>。</li>' +
'<li>收款和退款 — <em>合同</em>。</li>' +
'<li>保存会计和税务记录 — <em>法定义务</em>。</li>' +
'<li>安全、防欺诈和改进服务 — <em>合法利益</em>。</li>' +
'<li>未经您同意，我们不会发送营销信息。</li></ul>' +
'<h2>4. 数据共享</h2><ul>' +
'<li><strong>Beam Checkout</strong>（支付服务商），用于处理付款。</li>' +
'<li><strong>您的司机</strong>：姓名、电话、航班、上下车地点、时间、乘客和行李 — 仅限行程所需。</li>' +
'<li><strong>您选择的通讯服务</strong>（LINE、WhatsApp）及我们的邮件服务商。</li>' +
'<li><strong>地址搜索：</strong>您在上车/下车框中输入的文字会发送到 Photon 地理编码服务（photon.komoot.io，OpenStreetMap 数据）以推荐地点。</li>' +
'<li>通过其预订的<strong>合作平台</strong>；以及法律要求时的<strong>政府机关</strong>。</li>' +
'<li>我们不会出售您的个人数据。</li></ul>' +
'<h2>5. 跨境传输</h2><p>部分服务商（例如通讯和邮件服务）可能在泰国境外处理数据。保护措施：' + TBC.zh + '。</p>' +
'<h2>6. 保存期限</h2><p>预订数据在提供服务、处理咨询或索赔所需期间以及泰国会计和税法要求的期间内保存。具体期限：' + TBC.zh + '。之后将删除或匿名化。</p>' +
'<h2>7. 安全</h2><p>仅限需要的员工和司机访问预订数据。银行卡付款在 Beam 的安全付款页面完成。</p>' +
'<h2>8. 您的权利</h2><p>根据 PDPA，您可以要求访问或获取数据副本、更正、删除、限制或反对使用、数据可携，以及在基于同意的情况下撤回同意。您也可以向泰国个人数据保护委员会办公室（PDPC）投诉。行使权利请发邮件至 booking@okasto.com。答复时限：' + TBC.zh + '。</p>' +
'<h2>9. 政策变更</h2><p>我们可能更新本政策，顶部的版本日期为最近一次修改。</p>' +
'<h2>10. 联系方式</h2><p>booking@okasto.com · LINE @okasto · WhatsApp +66 62 669 1009 · +66 92 748 4646（24 小时）。另请参阅<a href="terms.html">条款与条件</a>。</p>' }
}
};
window.OKASTO_PARTNERS = PARTNERS;
})();
