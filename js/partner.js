/* OKASTO partner booking demo.
   Renders /p/<partnerId>/ (booking, sent, statement) from data/partners.json,
   falling back to js/partners-data.js when the page is opened as a file.
   Submit is simulated in the browser. Nothing is emailed and Beam is not called. */
(function () {
  var STORE = "okasto.partnerBookings.v1";
  var LANG_KEY = "okasto.partnerLang";
  var DATA, PARTNER, PREFIX, VIEW, LANG, PENDING;
  var TH_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  var EN_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var TYPES = {
    agency: { en: "Agency", th: "เอเจนซี", zh: "旅行社" },
    hotel: { en: "Hotel", th: "โรงแรม", zh: "酒店" }
  };
  var PAY = {
    credit: {
      th: "จองตอนนี้ ชำระสิ้นเดือน (เครดิต)",
      en: "Book now, settle at month end (credit)",
      zh: "先预订，月底结算（挂账）",
      noteTh: "ไม่มีการชำระเงินตอนจอง รายการนี้เข้าใบแจ้งหนี้สิ้นเดือนตามราคาสัญญา",
      noteEn: "No payment at booking. This trip is added to the monthly invoice at the contract price.",
      noteZh: "预订时不付款。按合同价计入月底账单。"
    },
    kickback: {
      th: "ชำระตอนนี้ผ่าน OKASTO (Beam) รับค่าคอมมิชชันสิ้นเดือน",
      en: "Pay now via OKASTO payment (Beam), kickback at month end",
      zh: "现在通过 OKASTO（Beam）付款，月底返还佣金",
      noteTh: "ลูกค้าหรือพาร์ทเนอร์ชำระราคาเว็บไซต์ออนไลน์ ส่วนต่างจากราคาสัญญาเป็นค่าคอมมิชชัน จ่ายคืนสิ้นเดือน",
      noteEn: "The customer or partner pays the public website price online. The difference from the contract price is the partner's commission, paid back at month end.",
      noteZh: "按网站公开价在线支付。公开价与合同价的差额作为佣金，月底返还。"
    }
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function bi(th, en, zh) {
    return '<span class="l-zh">' + esc(zh || en) + '</span><span class="l-th">' + esc(th) + '</span><span class="en l-en">' + esc(en) + '</span>';
  }
  function para(th, en, zh) {
    return '<span class="l-zh">' + esc(zh || en) + '</span><span class="l-th">' + esc(th) + '</span><span class="l-en"> ' + esc(en) + '</span>';
  }
  function ico(id) {
    return '<svg class="ico" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }
  function baht(n) {
    return "฿" + Math.round(Number(n) || 0).toLocaleString("en-US");
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? { y: +m[1], mo: +m[2], d: +m[3] } : null;
  }
  function fmtDate(s) {
    var p = parseDate(s);
    if (!p) return "—";
    return p.d + " " + TH_MON[p.mo - 1] + " " + p.y + " · " + p.d + " " + EN_MON[p.mo - 1] + " " + p.y;
  }
  function fmtWhen(date, time) {
    var p = parseDate(date);
    if (!p) return "—";
    var th = p.d + " " + TH_MON[p.mo - 1] + " " + p.y + (time ? ", " + time : "");
    var en = p.d + " " + EN_MON[p.mo - 1] + " " + p.y + (time ? ", " + time : "");
    return bi(th, en, en);
  }
  function fmtDateEn(s) {
    var p = parseDate(s);
    return p ? p.d + " " + EN_MON[p.mo - 1] + " " + p.y : (s || "—");
  }
  function fmtMonth(ym) {
    var m = /^(\d{4})-(\d{2})$/.exec(ym || "");
    if (!m) return ym || "";
    return TH_MON[+m[2] - 1] + " " + m[1] + " · " + EN_MON[+m[2] - 1] + " " + m[1];
  }
  function mailWhen(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    try {
      return d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return d.toUTCString();
    }
  }
  function assetPrefix() {
    var s = document.querySelector("script[src*='partners-data.js']");
    return s ? s.getAttribute("src").replace(/js\/partners-data\.js.*$/, "") : "";
  }
  function routeById(id) {
    var list = (DATA && DATA.routes) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function vehById(id) {
    var list = (DATA && DATA.vehicles) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function partnerRoutes(p) {
    var order = p.routeOrder || Object.keys(p.rates || {});
    var out = [];
    order.forEach(function (id) {
      var r = routeById(id);
      if (r && p.rates && p.rates[id]) out.push(r);
    });
    return out;
  }
  function priceOf(table, routeId, vehId) {
    if (!table || !table[routeId] || table[routeId][vehId] == null || table[routeId][vehId] === "") return null;
    return Number(table[routeId][vehId]);
  }
  function typeBadge(type) {
    var t = TYPES[type] || TYPES.agency;
    var cls = type === "hotel" ? "hotel" : "agency";
    return '<span class="ptype ' + cls + '"><span class="tb-th">' + esc(t.en) + " · " + esc(t.th) + '</span><span class="tb-en">' + esc(t.en) + '</span><span class="tb-zh">' + esc(t.zh) + " · " + esc(t.en) + "</span></span>";
  }
  function typeLabel(type) {
    var t = TYPES[type] || TYPES.agency;
    return t.en + " · " + t.th;
  }
  function payLabel(id) {
    var p = PAY[id] || PAY.kickback;
    return p.en + " · " + p.th;
  }
  function routeCell(r) {
    return '<span class="rt-th">' + esc(r.nameTh) + '</span><span class="rt-en">' + esc(r.nameEn) + '</span><span class="rt-zh">' + esc(r.nameZh) + '</span><small><span class="rt-th">' + esc(r.nameEn) + '</span><span class="rt-en">' + esc(r.nameTh) + '</span><span class="rt-zh">' + esc(r.nameEn) + "</span></small>";
  }
  function routeShort(r) {
    if (!r) return "—";
    return '<span class="rt-th">' + esc(r.shortTh) + '</span><span class="rt-en">' + esc(r.shortEn) + '</span><span class="rt-zh">' + esc(r.shortZh || r.shortEn) + "</span>";
  }
  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function stashBooking(b) {
    try {
      var all = readStore();
      var list = Array.isArray(all[b.partnerId]) ? all[b.partnerId] : [];
      list = list.filter(function (x) { return x.ref !== b.ref; });
      list.unshift(b);
      all[b.partnerId] = list.slice(0, 40);
      localStorage.setItem(STORE, JSON.stringify(all));
    } catch (e) { /* file:// may block storage; the URL hash still carries the booking */ }
    try { sessionStorage.setItem("okasto.booking." + b.ref, JSON.stringify(b)); } catch (e2) {}
  }
  function bookingFromHash(ref) {
    if (!location.hash || location.hash.length < 2) return null;
    try {
      var b = JSON.parse(decodeURIComponent(location.hash.slice(1)));
      if (b && b.ref === ref) return b;
    } catch (e) {}
    return null;
  }
  function findBooking(partner, ref) {
    if (!ref) return null;
    var saved = readStore()[partner.id] || [];
    for (var i = 0; i < saved.length; i++) if (saved[i].ref === ref) return saved[i];
    try {
      var raw = sessionStorage.getItem("okasto.booking." + ref);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var hashed = bookingFromHash(ref);
    if (hashed) return hashed;
    var hist = partner.history || [];
    for (var j = 0; j < hist.length; j++) {
      if (hist[j].ref === ref) return Object.assign({ example: true, partnerId: partner.id, partnerName: partner.name, partnerType: partner.type }, hist[j]);
    }
    return null;
  }
  function makeRef() {
    var a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "OK-P-";
    for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }
  function resolveId() {
    var q = new URLSearchParams(location.search).get("id");
    if (q) return q.trim();
    if (document.body.dataset.partner) return document.body.dataset.partner.trim();
    var m = (location.pathname || "").match(/\/p\/([A-Za-z0-9_-]+)(?:\/|$)/);
    if (m && m[1] !== "index") return m[1];
    return "";
  }
  function emailTo() {
    return (DATA && DATA.bookingEmail) || "bookings@okasto.com";
  }

  function sprite() {
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
      '<symbol id="i-shield" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></g></symbol>' +
      '<symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></symbol>' +
      '<symbol id="i-globe" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></g></symbol>' +
      '<symbol id="i-user" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></g></symbol>' +
      '<symbol id="i-bag" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V4h6v3"/></g></symbol>' +
      '<symbol id="i-phone" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2C10.7 21 3 13.3 3 5a2 2 0 0 1 2-2z"/></symbol>' +
      '<symbol id="i-mail" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></g></symbol>' +
      '<symbol id="i-pin" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></g></symbol>' +
      '<symbol id="i-card" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/></g></symbol>' +
      '<symbol id="i-wallet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="3.5" y="8" width="17" height="12" rx="2.5"/><path d="M20.5 12h-4a2 2 0 0 0 0 4h4"/></g></symbol>' +
      '<symbol id="i-handshake" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 11l4-4 3 1.5L12 7l3.5 1.5 2-1.5 4 4"/><path d="M6.5 7.5v6l4 3.5c.8.6 1.8.6 2.4-.1l4.6-4.4V7.5"/><path d="M10 12l2 1.7"/></g></symbol>' +
      "</svg>";
  }
  function setLang(lang) {
    if (["th", "en", "zh"].indexOf(lang) < 0) lang = "th";
    LANG = lang;
    document.body.dataset.lang = lang;
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
      if (b.getAttribute("data-lang") === lang) b.setAttribute("aria-pressed", "true");
      else b.setAttribute("aria-pressed", "false");
    });
  }
  function bindChrome() {
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang")); });
    });
  }
  function header() {
    var active = function (code) { return LANG === code ? " active" : ""; };
    return '<header class="site-header" id="top"><div class="container header-inner">' +
      '<a href="' + PREFIX + 'index.html" class="logo" aria-label="OKASTO home"><picture>' +
      '<source media="(max-width: 560px)" srcset="' + PREFIX + 'img/logo-wordmark.png">' +
      '<img src="' + PREFIX + 'img/logo-horizontal.png" width="346" height="36" alt="OKASTO"></picture></a>' +
      '<span class="partner-chip">' + ico("i-handshake") + "<span>Partner booking</span></span>" +
      '<div class="header-actions"><div class="lang-switch" role="group" aria-label="Language">' +
      ico("i-globe") +
      '<button type="button" data-lang="th" class="' + active("th") + '" aria-pressed="' + (LANG === "th") + '">ไทย</button>' +
      '<button type="button" data-lang="en" class="' + active("en") + '" aria-pressed="' + (LANG === "en") + '">EN</button>' +
      '<button type="button" data-lang="zh" class="' + active("zh") + '" aria-pressed="' + (LANG === "zh") + '">中文</button>' +
      "</div></div></div></header>";
  }
  function footer(partner) {
    var who = partner ? partner.name : "OKASTO demo";
    var book = VIEW === "index" ? (DATA.partners[0] ? DATA.partners[0].id + "/index.html" : "#") : "index.html";
    var stmt = VIEW === "index" ? (DATA.partners[0] ? DATA.partners[0].id + "/statement.html" : "#") : "statement.html";
    var priv = partner
      ? para("ลิงก์นี้ใช้เฉพาะ " + partner.name + " กรุณาอย่าส่งต่อ", "This link is for " + partner.name + " only. Please do not share it.", "此链接仅供 " + partner.name + " 使用，请勿转发。")
      : para("หน้านี้เป็นดัชนีตัวอย่างของลิงก์ส่วนตัว ไม่ได้อยู่ในเมนูหลัก", "This is an example index of private links. It is not in the main menu.", "此页是专属链接的示例目录，不在主菜单中。");
    return '<footer class="site-footer"><div class="container footer-grid"><div>' +
      '<a href="' + PREFIX + 'index.html" class="footer-logo" aria-label="OKASTO home"><img src="' + PREFIX + 'img/logo-stacked-520.png" width="520" height="635" alt="OKASTO"></a>' +
      "<p>" + para("บริการรถรับส่งสนามบินส่วนตัวและเช่ารถพร้อมคนขับ ในกรุงเทพฯ พัทยา หัวหิน และภูเก็ต", "Private airport transfers in Bangkok, Pattaya and Phuket.", "曼谷、芭堤雅与普吉的私人机场接送。") + "</p>" +
      '<p class="company"><strong>Okasto Co., Ltd.</strong></p></div><div>' +
      "<h4>" + bi("ติดต่อทีมจอง", "Booking team", "预订团队") + "</h4><ul class=\"contact-list\">" +
      "<li>" + ico("i-mail") + '<a href="mailto:' + emailTo() + '">' + esc(emailTo()) + "</a></li>" +
      "<li>" + ico("i-phone") + '<a href="tel:+66927484646">+66 92 748 4646 (24h)</a></li>' +
      "<li>" + ico("i-pin") + "<span>Bang Bua Thong, Nonthaburi</span></li></ul></div><div>" +
      "<h4>" + bi("สำหรับพาร์ทเนอร์", "For partners", "合作方") + "</h4><ul class=\"link-list\">" +
      '<li><a href="' + book + '">' + bi("จองงาน", "New booking", "新预订") + "</a></li>" +
      '<li><a href="' + stmt + '">' + bi("ใบแจ้งยอดเดือน", "Monthly statement", "月结单") + "</a></li>" +
      '<li><a href="' + PREFIX + 'terms.html">' + bi("เงื่อนไขพาร์ทเนอร์", "Partner terms", "合作条款") + "</a></li>" +
      '<li><a href="' + PREFIX + 'privacy.html">' + bi("ความเป็นส่วนตัว", "Privacy", "隐私") + "</a></li></ul></div><div>" +
      "<h4>" + bi("ลิงก์ส่วนตัว", "Private link", "专属链接") + '</h4><p class="small-muted">' + priv + "</p></div></div>" +
      '<div class="container footer-bottom"><span>© 2026 Okasto Co., Ltd. ' + bi("สงวนลิขสิทธิ์", "All rights reserved", "版权所有") + "</span>" +
      '<span class="demo-note">MOCKUP — ' + bi("ราคาและข้อมูลทั้งหมดเป็นตัวอย่าง", "All prices and data are examples.", "价格与数据均为示例。") + "</span></div></footer>";
  }
  function banner(partner) {
    var lim = "";
    if (partner.creditEnabled && partner.creditLimit != null) {
      lim = '<p class="pb-limit"><span class="credit-limit">วงเงินเครดิตตัวอย่าง · Example credit limit ' + baht(partner.creditLimit) + "</span></p>";
    }
    return '<section class="partner-hero"><div class="container"><div class="pbanner">' +
      '<div class="pb-ico">' + ico("i-handshake") + "</div><div class=\"pb-text\">" +
      '<p class="pb-kicker">' + bi("การจองสำหรับพาร์ทเนอร์", "Partner booking for", "合作方预订") + "</p>" +
      "<h1>" + esc(partner.name) + " " + typeBadge(partner.type) + ' <span class="pid">Partner ID <b>' + esc(partner.id) + "</b></span></h1>" +
      '<p class="pb-note">' + ico("i-shield") + "<span>" + para(
        "ราคาในหน้านี้เป็นราคาตามสัญญาของคุณ (ราคาพาร์ทเนอร์) ไม่ต้องล็อกอิน",
        "The rates on this page are your contract rates — no login needed.",
        "本页为您的合同价，无需登录。") + "</span></p>" + lim + "</div>" +
      '<div class="pb-link"><span>' + bi("ลิงก์ส่วนตัว", "Private link", "专属链接") + "</span>" +
      "<code>okasto.com/p/" + esc(partner.id) + "</code>" +
      '<a href="statement.html">' + bi("ใบแจ้งยอดประจำเดือน", "Monthly statement", "月结单") + "</a></div>" +
      "</div></div></section>";
  }
  function strip() {
    return '<div class="mock-strip">MOCKUP / ตัวอย่างดีไซน์เท่านั้น · Preview only · ข้อมูลทั้งหมดเป็นข้อมูลสมมติ (fake example data)</div>';
  }
  function paint(title, main, extra) {
    document.title = title;
    document.getElementById("partner-root").innerHTML = sprite() + strip() + header() + "<main>" + main + "</main>" + footer(PARTNER) + (extra || "");
    bindChrome();
  }

  function rateTable(partner) {
    var cols = 1 + DATA.vehicles.length;
    var body = "";
    var last = "";
    partnerRoutes(partner).forEach(function (r) {
      var key = r.regionEn;
      if (key !== last) {
        last = key;
        body += '<tr><td class="r-region" colspan="' + cols + '"><span class="rt-th">' + esc(r.regionTh + " · " + r.regionEn) + '</span><span class="rt-en">' + esc(r.regionEn) + '</span><span class="rt-zh">' + esc((r.regionZh || r.regionEn)) + "</span></td></tr>";
      }
      body += '<tr data-route="' + esc(r.id) + '"><td class="r-name">' + routeCell(r) + "</td>";
      DATA.vehicles.forEach(function (v) {
        var n = partner.rates[r.id][v.id];
        body += '<td class="p">' + (n == null ? "—" : baht(n)) + "</td>";
      });
      body += "</tr>";
    });
    var heads = DATA.vehicles.map(function (v) {
      return "<th>" + esc(v.nameTh) + " <small>" + esc(v.nameEn) + " · " + v.pax + " pax</small></th>";
    }).join("");
    return '<div class="pcard"><div class="pcard-head"><h2>' + bi("ราคาตามสัญญา", "Contract rates", "合同价") + "</h2>" +
      '<span class="ex-tag">' + bi("ราคาตัวอย่าง", "EXAMPLE PRICES", "示例价格") + "</span></div>" +
      '<p class="pcard-sub">' + para("ราคาต่อคัน (บาท) รวมค่าทางด่วน ค่าน้ำมัน และป้ายชื่อรับที่สนามบิน", "Per vehicle (THB), incl. tolls, fuel and name-sign pickup.", "每车价格（泰铢），含过路费、油费与举牌接机。") + "</p>" +
      '<div class="table-wrap"><table class="price-table ptable"><thead><tr><th>' + bi("เส้นทาง", "Route", "路线") + "</th>" + heads + "</tr></thead><tbody id=\"rateBody\">" + body + "</tbody></table></div>" +
      '<p class="fine">* ' + para("ตัวเลขทั้งหมดเป็นราคาสมมติสำหรับดีไซน์ ไม่ใช่ราคาจริง", "All figures are made-up example prices, not real rates.", "所有数字均为虚构示例，不是真实价格。") + "</p></div>";
  }
  function vehicleCards(sample) {
    return DATA.vehicles.map(function (v) {
      var sel = v.id === sample.vehicleId;
      return '<label class="pveh' + (sel ? " selected" : "") + '"><input type="radio" name="vehicle" value="' + esc(v.id) + '"' + (sel ? " checked" : "") + ">" +
        '<span class="pveh-img"><img src="' + PREFIX + esc(v.photo) + '" alt="' + esc(v.nameEn) + ' — left-facing front three-quarter view"></span>' +
        '<span class="pveh-body"><span class="v-name">' + esc(v.nameTh) + " <small>" + esc(v.nameEn) + "</small></span>" +
        '<span class="v-meta"><span>' + ico("i-user") + v.pax + "</span><span>" + ico("i-bag") + v.bags + '</span></span>' +
        '<span class="v-price">—</span></span></label>';
    }).join("");
  }
  function payFields(partner, sample) {
    var allowCredit = !!partner.creditEnabled;
    var chosen = sample.payment === "credit" && allowCredit ? "credit" : (allowCredit && sample.payment !== "kickback" ? "credit" : "kickback");
    if (!allowCredit) chosen = "kickback";
    function opt(id, icon) {
      var p = PAY[id];
      var limit = id === "credit" && partner.creditLimit != null
        ? '<span class="credit-limit">วงเงินเครดิตตัวอย่าง · Example credit limit ' + baht(partner.creditLimit) + "</span>" : "";
      return '<label class="payopt"><input type="radio" name="payment" value="' + id + '"' + (chosen === id ? " checked" : "") + ">" +
        '<span class="pay-ico">' + ico(icon) + '</span><span><strong>' + bi(p.th, p.en, p.zh) + "</strong>" +
        "<p>" + para(p.noteTh, p.noteEn, p.noteZh) + "</p>" + limit + '<span class="co-radio" aria-hidden="true"></span></span></label>';
    }
    var radios = (allowCredit ? opt("credit", "i-wallet") : "") + opt("kickback", "i-card");
    var off = allowCredit ? "" : '<p class="fine">' + para("พาร์ทเนอร์นี้ไม่ได้เปิดเครดิต จึงมีเฉพาะการชำระผ่าน Beam", "Credit is not enabled for this partner, so only Beam payment is offered.", "此合作方未开通挂账，只能通过 Beam 付款。") + "</p>";
    return '<div class="fsec"><span class="fsec-n">5</span><h3>' + bi("การชำระเงิน", "Payment", "付款方式") + "</h3></div>" +
      '<fieldset class="pay-field"><legend class="sr-only">' + bi("การชำระเงิน", "Payment", "付款方式") + "</legend>" +
      '<div class="pay-list">' + radios + "</div>" + off + "</fieldset>";
  }

  function renderBook() {
    var s = PARTNER.sample || {};
    var routes = partnerRoutes(PARTNER);
    var routeId = s.routeId && PARTNER.rates[s.routeId] ? s.routeId : (routes[0] ? routes[0].id : "");
    var options = routes.map(function (r) {
      return '<option value="' + esc(r.id) + '"' + (r.id === routeId ? " selected" : "") + ">" + esc(r.nameTh) + " (" + esc(r.nameEn) + ")</option>";
    }).join("");
    var sample = {
      vehicleId: s.vehicleId || "van",
      payment: s.payment || "credit",
      date: s.date || "2026-10-30",
      time: s.time || "10:30",
      flight: s.flight || "",
      name: s.name || "",
      phone: s.phone || "",
      pax: s.pax || 1,
      bags: s.bags || 0,
      notes: s.notes || "",
      partnerRef: s.partnerRef || ""
    };
    var main = banner(PARTNER) + '<section class="pwrap"><form class="container pgrid" id="bookForm" novalidate>' +
      '<div class="pcol-main">' + rateTable(PARTNER) +
      '<div class="pcard pform"><div class="pcard-head"><h2>' + bi("รายละเอียดการจอง", "Booking details", "预订详情") + "</h2>" +
      '<span class="ex-tag soft">' + bi("ตัวอย่างข้อมูล", "Sample input", "示例内容") + "</span></div>" +
      '<div class="fsec"><span class="fsec-n">1</span><h3>' + bi("เส้นทางและรถ", "Route & vehicle", "路线与车型") + "</h3></div>" +
      '<label class="field"><span>' + bi("เส้นทาง", "Route", "路线") + '</span><select name="route" id="route">' + options + "</select></label>" +
      '<div class="field"><span>' + bi("ประเภทรถ", "Vehicle", "车型") + '</span><div class="pveh-grid" id="vehGrid">' + vehicleCards(sample) + "</div></div>" +
      '<div class="fsec"><span class="fsec-n">2</span><h3>' + bi("เที่ยวบินและเวลา", "Flight & pickup time", "航班与接送时间") + "</h3></div>" +
      '<div class="g3"><label class="field"><span>' + bi("วันที่", "Date", "日期") + '</span><input name="date" type="date" value="' + esc(sample.date) + '" required></label>' +
      '<label class="field"><span>' + bi("เวลารับ", "Pickup time", "接送时间") + '</span><input name="time" type="time" value="' + esc(sample.time) + '" required></label>' +
      '<label class="field"><span>' + bi("เที่ยวบิน", "Flight no.", "航班号") + '</span><input name="flight" value="' + esc(sample.flight) + '" autocomplete="off"></label></div>' +
      '<div class="fsec"><span class="fsec-n">3</span><h3>' + bi("ข้อมูลผู้โดยสาร", "Passenger", "乘客") + "</h3></div>" +
      '<div class="g2 g2-stack"><label class="field"><span>' + bi("ชื่อผู้โดยสาร", "Passenger name", "乘客姓名") + '</span><input name="pname" value="' + esc(sample.name) + '" autocomplete="name" required></label>' +
      '<label class="field"><span>' + bi("โทร / WhatsApp", "Phone / WhatsApp", "电话 / WhatsApp") + '</span><input name="phone" value="' + esc(sample.phone) + '" autocomplete="tel" inputmode="tel" required></label></div>' +
      '<div class="g2"><div class="field"><span>' + bi("ผู้โดยสาร", "Passengers", "乘客人数") + '</span><div class="stepper"><button type="button" data-step="-1" aria-label="-">−</button><input name="pax" inputmode="numeric" min="1" max="16" value="' + esc(sample.pax) + '"><button type="button" data-step="1" aria-label="+">+</button></div></div>' +
      '<div class="field"><span>' + bi("กระเป๋า", "Luggage", "行李") + '</span><div class="stepper"><button type="button" data-step="-1" aria-label="-">−</button><input name="bags" inputmode="numeric" min="0" max="16" value="' + esc(sample.bags) + '"><button type="button" data-step="1" aria-label="+">+</button></div></div></div>' +
      '<label class="field"><span>' + bi("หมายเหตุ", "Notes", "备注") + '</span><textarea name="notes" rows="3">' + esc(sample.notes) + "</textarea></label>" +
      '<p class="cap-warn" id="capWarn" hidden>' + para("จำนวนผู้โดยสารเกินความจุของรถคันนี้", "More passengers than this vehicle holds.", "乘客人数超过该车型座位。") + "</p>" +
      '<div class="fsec"><span class="fsec-n">4</span><h3>' + bi("ข้อมูลพาร์ทเนอร์", "Partner reference", "合作方单号") + "</h3></div>" +
      '<label class="field"><span>' + bi("เลขอ้างอิงของคุณ", "Your reference no.", "您的单号") + '</span><input name="pref" value="' + esc(sample.partnerRef) + '" autocomplete="off"></label>' +
      payFields(PARTNER, sample) +
      '<p class="form-error" id="formError" hidden></p></div></div>' +
      '<aside class="pcol-side"><div class="pcard psum"><h2>' + bi("สรุปการจอง", "Summary", "汇总") + "</h2>" +
      '<div class="psum-car"><img id="sumPhoto" alt="" src="' + PREFIX + 'img/photos/fleet-van.jpg"><div><b id="sumVeh">—</b><small id="sumCap"></small></div></div>' +
      '<dl class="psum-list"><div><dt>' + bi("เส้นทาง", "Route", "路线") + '</dt><dd id="sumRoute">—</dd></div>' +
      '<div><dt>' + bi("วันเวลา", "When", "时间") + '</dt><dd id="sumWhen">—</dd></div>' +
      '<div><dt>' + bi("เที่ยวบิน", "Flight", "航班") + '</dt><dd id="sumFlight">—</dd></div>' +
      '<div><dt>' + bi("ผู้โดยสาร", "Pax / bags", "乘客 / 行李") + '</dt><dd id="sumPax">—</dd></div>' +
      '<div><dt>' + bi("อ้างอิง", "Your ref", "单号") + '</dt><dd id="sumRef">—</dd></div>' +
      '<div><dt>' + bi("การชำระ", "Payment", "付款") + '</dt><dd id="sumMethod">—</dd></div></dl>' +
      '<div id="sumPay"></div>' +
      '<button class="btn btn-primary btn-block btn-confirm" id="confirmBtn" type="submit">' + ico("i-check") + '<span id="confirmLabel"></span></button>' +
      '<p class="psum-note">' + ico("i-mail") + "<span>" + para(
        "เมื่อกดยืนยัน ระบบจะจำลองการส่งอีเมลถึงทีมจอง OKASTO (" + emailTo() + ") — ยังไม่ส่งจริง และไม่แจ้งทาง LINE",
        "Confirm simulates an email to the OKASTO booking team (" + emailTo() + "). Nothing is sent yet, and this is not a LINE notification.",
        "确认后会模拟发送邮件至 " + emailTo() + "。目前不会真正发送，也不是 LINE 通知。") + "</span></p></div></aside></form></section>";
    paint((LANG === "en" ? "Booking — " : "จองงาน — ") + PARTNER.name + " · OKASTO", main, beamModal());
    document.getElementById("bookForm").addEventListener("submit", onSubmit);
    document.getElementById("bookForm").addEventListener("input", sync);
    document.getElementById("bookForm").addEventListener("change", sync);
    document.getElementById("bookForm").addEventListener("click", onFormClick);
    document.getElementById("beamBack").addEventListener("click", closeBeam);
    document.getElementById("beamGo").addEventListener("click", function () { if (PENDING) finish(PENDING); });
    document.addEventListener("keydown", onKey);
    sync();
  }
  function onKey(e) {
    if (e.key === "Escape") closeBeam();
  }
  function onFormClick(e) {
    var row = e.target.closest ? e.target.closest("tr[data-route]") : null;
    var form = document.getElementById("bookForm");
    if (row) {
      form.elements.route.value = row.getAttribute("data-route");
      sync();
      return;
    }
    var step = e.target.closest ? e.target.closest("[data-step]") : null;
    if (!step) return;
    var input = step.parentNode.querySelector("input");
    var n = Number(input.value || 0) + Number(step.getAttribute("data-step"));
    var min = Number(input.getAttribute("min") || 0);
    var max = Number(input.getAttribute("max") || 20);
    if (n < min) n = min;
    if (n > max) n = max;
    input.value = String(n);
    sync();
  }
  function choice() {
    var form = document.getElementById("bookForm");
    var routeId = form.elements.route.value;
    var vehicleId = form.elements.vehicle ? form.elements.vehicle.value : "";
    var payment = form.elements.payment ? form.elements.payment.value : "";
    var contract = priceOf(PARTNER.rates, routeId, vehicleId);
    var pub = priceOf(PARTNER.publicRates, routeId, vehicleId);
    return {
      routeId: routeId,
      vehicleId: vehicleId,
      payment: payment,
      contract: contract,
      publicPrice: pub,
      commission: contract != null && pub != null ? Math.max(0, pub - contract) : 0,
      date: form.elements.date.value,
      time: form.elements.time.value,
      flight: form.elements.flight.value.trim(),
      name: form.elements.pname.value.trim(),
      phone: form.elements.phone.value.trim(),
      pax: Number(form.elements.pax.value || 0),
      bags: Number(form.elements.bags.value || 0),
      notes: form.elements.notes.value.trim(),
      partnerRef: form.elements.pref.value.trim()
    };
  }
  function sync() {
    var c = choice();
    if (c.contract == null) {
      var first = document.querySelector("#vehGrid input:not(:disabled)");
      var current = document.querySelector('#vehGrid input[value="' + c.vehicleId + '"]');
      if (first && (!current || current.disabled || c.contract == null)) {
        var enabled = null;
        document.querySelectorAll("#vehGrid input").forEach(function (input) {
          var price = priceOf(PARTNER.rates, c.routeId, input.value);
          input.disabled = price == null;
          if (price != null && !enabled) enabled = input;
        });
        if (enabled && !enabled.checked) { enabled.checked = true; c = choice(); }
      }
    }
    document.querySelectorAll("#vehGrid .pveh").forEach(function (lab) {
      var input = lab.querySelector("input");
      var price = priceOf(PARTNER.rates, c.routeId, input.value);
      input.disabled = price == null;
      lab.classList.toggle("is-off", price == null);
      lab.classList.toggle("selected", input.checked && price != null);
      lab.querySelector(".v-price").textContent = price == null ? "—" : baht(price);
    });
    document.querySelectorAll("#rateBody tr[data-route]").forEach(function (tr) {
      tr.classList.toggle("hl", tr.getAttribute("data-route") === c.routeId);
    });
    var route = routeById(c.routeId);
    var veh = vehById(c.vehicleId);
    var photo = document.getElementById("sumPhoto");
    if (veh) {
      photo.src = PREFIX + veh.photo;
      photo.alt = veh.nameEn;
      document.getElementById("sumVeh").textContent = veh.nameTh === veh.nameEn ? veh.nameEn : (veh.nameTh + " · " + veh.nameEn);
      document.getElementById("sumCap").innerHTML = bi("สูงสุด " + veh.pax + " คน · " + veh.bags + " ใบ", "up to " + veh.pax + " pax, " + veh.bags + " bags", "最多 " + veh.pax + " 人 · " + veh.bags + " 件");
    }
    document.getElementById("sumRoute").innerHTML = routeShort(route);
    document.getElementById("sumWhen").innerHTML = fmtWhen(c.date, c.time);
    document.getElementById("sumFlight").textContent = c.flight || "—";
    document.getElementById("sumPax").textContent = (c.pax || 0) + " / " + (c.bags || 0);
    document.getElementById("sumRef").textContent = c.partnerRef || "—";
    var method = PAY[c.payment] || PAY.kickback;
    document.getElementById("sumMethod").innerHTML = bi(c.payment === "credit" ? "เครดิตสิ้นเดือน" : "Beam · คอมมิชชัน", c.payment === "credit" ? "Credit, month end" : "Beam · kickback", c.payment === "credit" ? "月底挂账" : "Beam · 佣金");
    var payBox = document.getElementById("sumPay");
    if (c.payment === "kickback") {
      payBox.innerHTML = '<div class="psum-split"><div><span>' + bi("ราคาเว็บไซต์", "Public price", "网站公开价") + "</span><b>" + baht(c.publicPrice) + "</b></div>" +
        "<div><span>" + bi("ราคาตามสัญญา", "Contract price", "合同价") + "</span><b>" + baht(c.contract) + "</b></div>" +
        '<div class="kick"><span>' + bi("ค่าคอมมิชชันสิ้นเดือน", "Kickback at month end", "月底佣金") + "</span><b>" + baht(c.commission) + "</b></div></div>" +
        '<div class="psum-price"><span>' + bi("ชำระตอนนี้ผ่าน Beam", "Pay now via Beam", "现在通过 Beam 支付") + "</span><strong>" + baht(c.publicPrice) + "</strong>" +
        '<small class="auto">' + ico("i-check") + bi("ราคาเว็บไซต์ (ตัวอย่าง)", "Public website price (example)", "网站公开价（示例）") + "</small>" +
        "<small>" + para("ตัวแทน Beam ยังไม่เชื่อมต่อ ไม่มีการเรียกเก็บเงิน", "Beam placeholder — no charge is made.", "Beam 尚未接通，不会扣款。") + "</small></div>";
    } else {
      payBox.innerHTML = '<div class="psum-price"><span>' + bi("ราคาตามสัญญา", "Contract price", "合同价") + "</span><strong>" + baht(c.contract) + "</strong>" +
        '<small class="auto">' + ico("i-check") + bi("เติมอัตโนมัติจากสัญญา", "Auto-filled from contract", "按合同价自动填入") + "</small>" +
        "<small>" + para("เข้าใบแจ้งหนี้สิ้นเดือน · ยอดชำระตอนนี้ ฿0", "On the month-end invoice · due now ฿0", "计入月底账单 · 现在应付 ฿0") + "</small>" +
        "<small>" + bi("ราคาตัวอย่าง", "Example price", "示例价格") + "</small></div>";
    }
    document.getElementById("confirmLabel").innerHTML = c.payment === "kickback"
      ? bi("ไปหน้าชำระ Beam", "Continue to Beam payment", "前往 Beam 付款")
      : bi("ยืนยันการจอง", "Confirm booking", "确认预订");
    var warn = document.getElementById("capWarn");
    if (warn) warn.hidden = !(veh && c.pax > veh.pax);
    void method;
  }
  function validate(c) {
    var form = document.getElementById("bookForm");
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    var ok = true;
    function bad(el) { ok = false; if (el) el.classList.add("invalid"); }
    if (!c.name) bad(form.elements.pname);
    if (!c.phone || c.phone.replace(/\D/g, "").length < 8) bad(form.elements.phone);
    if (!c.date) bad(form.elements.date);
    if (!c.time) bad(form.elements.time);
    if (!c.payment) bad(form.querySelector(".pay-list"));
    var veh = vehById(c.vehicleId);
    if (!veh || c.contract == null) ok = false;
    if (veh && c.pax > veh.pax) ok = false;
    if (c.pax < 1) { ok = false; bad(form.elements.pax); }
    var err = document.getElementById("formError");
    err.hidden = ok;
    if (!ok) {
      err.innerHTML = para("กรุณาตรวจสอบข้อมูลที่ทำเครื่องหมายไว้ และจำนวนผู้โดยสารต้องไม่เกินความจุรถ", "Please check the highlighted fields. Passengers cannot exceed the vehicle.", "请检查标出的栏目，乘客人数不能超过车型座位。");
      var inv = form.querySelector(".invalid");
      if (inv && inv.focus) inv.focus();
    }
    return ok;
  }
  function toBooking(c) {
    return {
      ref: makeRef(),
      partnerId: PARTNER.id,
      partnerName: PARTNER.name,
      partnerType: PARTNER.type,
      routeId: c.routeId,
      vehicleId: c.vehicleId,
      date: c.date,
      time: c.time,
      flight: c.flight,
      name: c.name,
      phone: c.phone,
      pax: c.pax,
      bags: c.bags,
      notes: c.notes,
      partnerRef: c.partnerRef,
      payment: c.payment,
      contract: c.contract,
      publicPrice: c.publicPrice,
      commission: c.payment === "kickback" ? c.commission : 0,
      createdAt: new Date().toISOString(),
      example: false,
      local: true
    };
  }
  function onSubmit(e) {
    e.preventDefault();
    var c = choice();
    if (!validate(c)) return;
    var booking = toBooking(c);
    if (booking.payment === "kickback") openBeam(booking);
    else finish(booking);
  }
  function beamModal() {
    return '<div class="pmodal" id="beamModal" hidden role="dialog" aria-modal="true" aria-labelledby="beamTitle">' +
      '<div class="pmodal-card"><p class="ex-tag">' + bi("ตัวอย่าง", "PLACEHOLDER", "示例") + "</p>" +
      "<h2 id=\"beamTitle\">" + bi("การชำระเงิน OKASTO (Beam)", "OKASTO payment (Beam)", "OKASTO 付款（Beam）") + "</h2>" +
      "<p>" + para("นี่คือหน้าแทนของ Beam ยังไม่เชื่อมต่อระบบจริง และไม่มีการเรียกเก็บเงิน", "This stands in for Beam. It is not connected, and nothing is charged.", "这是 Beam 的占位页，尚未接通，也不会扣款。") + "</p>" +
      '<p class="pmodal-amt" id="beamAmt">—</p>' +
      "<p>" + bi("ค่าคอมมิชชันสิ้นเดือน", "Kickback at month end", "月底佣金") + ' <strong id="beamKick">—</strong></p>' +
      '<div class="pmodal-actions"><button type="button" class="btn btn-primary" id="beamGo">' + bi("จำลองการชำระเงิน", "Simulate payment", "模拟付款") + "</button>" +
      '<button type="button" class="btn btn-outline" id="beamBack">' + bi("กลับไปแก้ไข", "Back", "返回") + "</button></div></div></div>";
  }
  function openBeam(b) {
    PENDING = b;
    document.getElementById("beamAmt").textContent = baht(b.publicPrice);
    document.getElementById("beamKick").textContent = baht(b.commission);
    document.getElementById("beamModal").hidden = false;
    document.getElementById("beamGo").focus();
  }
  function closeBeam() {
    var m = document.getElementById("beamModal");
    if (m) m.hidden = true;
    PENDING = null;
  }
  function finish(b) {
    stashBooking(b);
    location.href = "sent.html?ref=" + encodeURIComponent(b.ref) + "#" + encodeURIComponent(JSON.stringify(b));
  }

  function renderSent() {
    var ref = new URLSearchParams(location.search).get("ref") || "";
    var b = findBooking(PARTNER, ref);
    if (!b) {
      paint("OKASTO", banner(PARTNER) + '<section class="pwrap"><div class="container"><div class="pcard empty"><h2>' +
        bi("ยังไม่มีรายการนี้", "No booking to show", "没有可显示的预订") + "</h2><p>" +
        para("เปิดหน้านี้หลังจากกดยืนยันการจอง หรือเลือกรายการตัวอย่างจากใบแจ้งยอด", "Open this page after confirming a booking, or pick an example from the statement.", "请在确认预订后打开此页，或从月结单选择示例。") +
        '</p><p><a class="btn btn-primary" href="index.html">' + bi("กลับไปจอง", "Back to booking", "返回预订") + "</a></p></div></div></section>");
      return;
    }
    if (b.local) stashBooking(b);
    var route = routeById(b.routeId);
    var veh = vehById(b.vehicleId);
    var kick = b.payment === "kickback";
    var payName = payLabel(b.payment);
    var rows = "";
    function row(th, td, cls) {
      rows += '<tr class="' + (cls || "") + '"><th>' + esc(th) + "</th><td>" + td + "</td></tr>";
    }
    row("Booking ref", "<b>" + esc(b.ref) + "</b>");
    row("Partner", esc(b.partnerName || PARTNER.name) + " (Partner ID " + esc(PARTNER.id) + ")");
    row("Partner type", esc(typeLabel(b.partnerType || PARTNER.type)));
    row("Partner ref", esc(b.partnerRef || "—"));
    row("Route", esc(route ? route.emailEn : b.routeId));
    row("Pickup", esc(fmtDateEn(b.date) + ", " + (b.time || "") + (b.flight ? " · Flight " + b.flight : "")));
    row("Vehicle", esc((veh ? veh.nameEn : b.vehicleId) + (veh ? " (" + veh.nameTh + ")" : "")));
    row("Passenger", esc(b.name || "—"));
    row("Phone / WhatsApp", esc(b.phone || "—"));
    row("Pax / luggage", esc((b.pax || 0) + " pax · " + (b.bags || 0) + " bags"));
    row("Notes", esc(b.notes || "—"));
    row("Payment method", esc(PAY[b.payment].en) + "<br>" + esc(PAY[b.payment].th));
    if (kick) {
      row("Public price (Beam)", "<b>" + baht(b.publicPrice) + "</b> (example, simulated — not collected)");
      row("Contract price", baht(b.contract) + " (example)");
      row("Commission (kickback at month end)", "<b>" + baht(b.commission) + "</b> (example)", "kick");
    } else {
      row("Contract price", "<b>" + baht(b.contract) + "</b> (example)", "tot");
      row("Due now", "฿0 — on the month-end invoice");
    }
    var sumExtra = kick
      ? '<div><dt>' + bi("ราคาเว็บไซต์", "Public price", "公开价") + "</dt><dd>" + baht(b.publicPrice) + " <small>(example)</small></dd></div>" +
        '<div><dt>' + bi("ราคาตามสัญญา", "Contract price", "合同价") + "</dt><dd>" + baht(b.contract) + "</dd></div>" +
        '<div class="tot"><dt>' + bi("ค่าคอมมิชชัน", "Kickback", "佣金") + "</dt><dd>" + baht(b.commission) + " <small>(example)</small></dd></div>"
      : '<div class="tot"><dt>' + bi("ราคาตามสัญญา", "Contract price", "合同价") + "</dt><dd>" + baht(b.contract) + " <small>(example)</small></dd></div>" +
        "<div><dt>" + bi("ยอดชำระตอนนี้", "Due now", "现在应付") + "</dt><dd>฿0</dd></div>";
    var sim = kick
      ? '<p class="sim-note">' + para("การชำระ Beam ถูกจำลองไว้ ไม่มีการเรียกเก็บเงิน และอีเมลด้านขวาไม่ได้ถูกส่งจริง", "Beam payment was simulated. Nothing was charged, and the email on the right was not actually sent.", "Beam 付款为模拟。没有扣款，右侧邮件也未真正发送。") + "</p>"
      : '<p class="sim-note">' + para("อีเมลด้านขวาเป็นตัวอย่าง สาธิตสิ่งที่ทีมจองจะได้รับ ยังไม่ได้ส่งจริง และไม่ได้แจ้งทาง LINE", "The email on the right is an example of what the booking team would receive. It was not sent, and this is not a LINE notification.", "右侧邮件是预订团队将收到的示例。尚未真正发送，也不是 LINE 通知。") + "</p>";
    var subject = "[Partner Booking] " + (b.partnerName || PARTNER.name) + " – " + (route ? route.shortEn : "") + " – " + fmtDateEn(b.date) + " " + (b.time || "") + " – Ref " + b.ref;
    var when = b.createdAt ? mailWhen(b.createdAt) : ("Example · " + fmtDateEn(b.date));
    var main = banner(PARTNER) + '<section class="pwrap"><div class="container sgrid"><div class="pcard sent">' +
      '<div class="co-done-ico">' + ico("i-check") + "</div><h2>" + bi("ส่งการจองแล้ว", "Booking sent", "预订已发送") + "</h2>" +
      sim +
      '<p class="pcard-sub">' + para(
        "ขอบคุณค่ะ รายละเอียดถูกจัดเป็นอีเมลถึงทีมจอง OKASTO แล้ว (ตัวอย่าง) ทีมงานจะยืนยันกลับภายใน 30 นาทีเมื่อระบบจริงพร้อม",
        "Thank you. The details are shown as an email to the OKASTO booking team (example). Once sending is connected, the team confirms within 30 minutes.",
        "谢谢。详情以发给 OKASTO 预订团队的邮件示例显示。接通后团队会在 30 分钟内确认。") + "</p>" +
      '<div class="co-ref-big"><span>' + bi("หมายเลขการจอง", "Booking ref", "预订号") + "</span><strong>" + esc(b.ref) + "</strong></div>" +
      '<dl class="psum-list"><div><dt>' + bi("พาร์ทเนอร์", "Partner", "合作方") + "</dt><dd>" + esc(PARTNER.name) + " (" + esc(PARTNER.id) + ")</dd></div>" +
      "<div><dt>" + bi("ประเภท", "Type", "类型") + "</dt><dd>" + esc(typeLabel(PARTNER.type)) + "</dd></div>" +
      "<div><dt>" + bi("การชำระ", "Payment", "付款") + "</dt><dd>" + esc(kick ? "Beam · kickback" : "เครดิตสิ้นเดือน") + "<small>" + esc(PAY[b.payment].en) + "</small></dd></div>" +
      "<div><dt>" + bi("อ้างอิงของคุณ", "Your ref", "您的单号") + "</dt><dd>" + esc(b.partnerRef || "—") + "</dd></div>" +
      "<div><dt>" + bi("เส้นทาง", "Route", "路线") + "</dt><dd>" + (route ? esc(route.nameTh) : "—") + "</dd></div>" +
      "<div><dt>" + bi("วันเวลา", "When", "时间") + "</dt><dd>" + esc(fmtDateEn(b.date) + ", " + (b.time || "") + (b.flight ? " · " + b.flight : "")) + "</dd></div>" +
      "<div><dt>" + bi("รถ", "Vehicle", "车型") + "</dt><dd>" + esc((veh ? veh.nameTh + " · " + veh.nameEn : "") + " — " + (b.pax || 0) + " pax, " + (b.bags || 0) + " bags") + "</dd></div>" +
      "<div><dt>" + bi("ผู้โดยสาร", "Passenger", "乘客") + "</dt><dd>" + esc((b.name || "—") + " · " + (b.phone || "")) + "</dd></div>" +
      sumExtra + "</dl><ol class=\"co-next\"><li>" + para("ทีมจองได้รับอีเมลและตรวจสอบรถว่าง", "The booking team receives the email and checks availability.", "预订团队收到邮件并确认车辆。") + "</li>" +
      "<li>" + para("คุณจะได้รับอีเมลยืนยันพร้อมชื่อคนขับ", "You get a confirmation email with driver details.", "您会收到含司机信息的确认邮件。") + "</li></ol>" +
      '<div class="sent-actions"><a class="btn btn-primary" href="index.html">' + bi("จองงานใหม่", "New booking", "新预订") + '</a>' +
      '<button type="button" class="btn btn-outline" id="printBtn">' + bi("พิมพ์ / บันทึก", "Print", "打印") + "</button>" +
      '<a class="btn btn-outline" href="statement.html">' + bi("ใบแจ้งยอด", "Statement", "月结单") + "</a></div></div>" +
      '<div class="email-wrap"><div class="ex-banner">' + para("ตัวอย่าง — อีเมลที่ทีมจอง OKASTO จะได้รับ", "EXAMPLE — The email the OKASTO booking team receives", "示例 — OKASTO 预订团队将收到的邮件") + "</div>" +
      '<div class="mail"><div class="mail-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="mail-app">Inbox — ' + esc(emailTo()) + "</span></div>" +
      '<div class="mail-head"><h3>' + esc(subject) + '</h3><div class="mail-from"><span class="av">OK</span><div><b>OKASTO Booking System</b> <span class="addr">&lt;noreply@okasto.com&gt;</span><br>' +
      '<span class="to">To: ' + esc(emailTo()) + '</span></div><span class="when">' + esc(when) + "</span></div></div>" +
      '<div class="mail-body"><p>' + para("มีการจองใหม่จากพาร์ทเนอร์", "New partner booking received.", "收到新的合作方预订。") + "</p>" +
      '<table class="mail-tbl">' + rows + "</table>" +
      '<div class="mail-btns"><span class="btn btn-primary btn-sm">Confirm &amp; assign driver</span><span class="btn btn-outline btn-sm">Open in admin</span></div>' +
      '<p class="mail-sig">— Demo only, composed in the browser from okasto.com/p/' + esc(PARTNER.id) + ". This message was not sent. Email delivery, the booking backend and Beam are not connected. Please do not reply to noreply@okasto.com.</p></div></div>" +
      '<p class="fine fine-center">' + para("ตัวอย่างประกอบดีไซน์ ข้อมูลสมมติทั้งหมด", "Illustrative mock, all data is fake.", "设计示例，数据均为虚构。") + "</p></div></div></section>";
    paint(biPlain("ส่งการจองแล้ว", "Booking sent") + " " + b.ref + " — OKASTO", main);
    document.getElementById("printBtn").addEventListener("click", function () { window.print(); });
  }
  function biPlain(th, en) {
    return LANG === "en" ? en : th;
  }

  function monthBuckets(partner) {
    var month = (DATA && DATA.statementMonth) || "2026-10";
    var saved = (readStore()[partner.id] || []).map(function (b) {
      return Object.assign({ local: true, example: false }, b);
    });
    var seen = {};
    saved.forEach(function (b) { seen[b.ref] = 1; });
    var seeds = (partner.history || []).filter(function (b) { return !seen[b.ref]; }).map(function (b) {
      return Object.assign({ example: true, local: false, partnerId: partner.id }, b);
    });
    var all = saved.concat(seeds);
    function sort(list) {
      return list.slice().sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date)) || String(b.ref).localeCompare(String(a.ref));
      });
    }
    return {
      month: month,
      rows: sort(all.filter(function (b) { return String(b.date || "").indexOf(month) === 0; })),
      outside: sort(all.filter(function (b) { return String(b.date || "").indexOf(month) !== 0; }))
    };
  }
  function sumTotals(rows) {
    var owed = 0, kick = 0;
    rows.forEach(function (b) {
      if (b.payment === "credit") owed += Number(b.contract) || 0;
      else kick += Number(b.commission) || 0;
    });
    return { owed: owed, kick: kick };
  }
  function stmtRow(b) {
    var route = routeById(b.routeId);
    var veh = vehById(b.vehicleId);
    var kick = b.payment === "kickback";
    var tag = b.local
      ? '<span class="pill local">' + bi("เบราว์เซอร์นี้", "This browser", "本浏览器") + "</span>"
      : '<span class="pill">' + bi("ตัวอย่าง", "Example", "示例") + "</span>";
    var when = fmtWhen(b.date, b.time);
    var amts = kick
      ? "<div>" + bi("ราคาเว็บ", "Public", "公开价") + " <b>" + baht(b.publicPrice) + "</b></div><div class=\"kick\">" + bi("คอมมิชชัน", "Kickback", "佣金") + " <b>" + baht(b.commission) + "</b></div>"
      : "<div>" + bi("สัญญา", "Contract", "合同价") + " <b>" + baht(b.contract) + "</b></div><div>" + bi("ค้างชำระ", "Owed", "应付") + " <b>" + baht(b.contract) + "</b></div>";
    return '<div class="stmt-row"><div><span class="stmt-ref">' + esc(b.ref) + "</span><small>" + when + "</small>" + tag + "</div>" +
      "<div><b>" + (route ? routeShort(route) : esc(b.routeId)) + '</b><small class="stmt-sub">' + esc((veh ? veh.nameEn : "") + " · " + (b.name || "")) + "</small></div>" +
      '<div><span class="pay-pill' + (kick ? " kick" : "") + '">' + esc(kick ? "Beam · kickback" : "Credit") + '</span><small class="stmt-sub">' + esc(b.partnerRef || "") + "</small></div>" +
      '<div class="stmt-amts">' + amts + "</div></div>";
  }
  function renderStatement() {
    var bucket = monthBuckets(PARTNER);
    var tot = sumTotals(bucket.rows);
    var head = '<div class="stmt-row head"><div>' + bi("รายการ", "Booking", "预订") + "</div><div>" + bi("เที่ยว", "Trip", "行程") + "</div><div>" + bi("การชำระ", "Payment", "付款") + "</div><div>" + bi("จำนวน", "Amounts", "金额") + "</div></div>";
    var list = bucket.rows.length ? bucket.rows.map(stmtRow).join("") : '<p class="fine">' + para("ไม่มีรายการในเดือนนี้", "No bookings in this month.", "本月没有预订。") + "</p>";
    var outside = "";
    if (bucket.outside.length) {
      outside = "<h3>" + bi("นอกเดือนตัวอย่าง", "Outside the example month", "示例月份之外") + "</h3>" +
        '<div class="stmt-list">' + bucket.outside.map(stmtRow).join("") + "</div>" +
        '<p class="fine">' + para("ยอดรวมด้านบนนับเฉพาะเดือนที่ระบุ", "The totals above include only the labelled month.", "上方合计只含所标月份。") + "</p>";
    }
    var main = banner(PARTNER) + '<section class="pwrap"><div class="container"><div class="pcard">' +
      '<div class="stmt-head"><div><h2>' + bi("ใบแจ้งยอดประจำเดือน", "Monthly partner statement", "合作方月结单") + "</h2>" +
      '<p class="pcard-sub">' + esc(fmtMonth(bucket.month)) + " · " + esc(PARTNER.name) + " · " + esc(typeLabel(PARTNER.type)) + "</p></div>" +
      '<span class="ex-tag">' + bi("ข้อมูลตัวอย่าง", "EXAMPLE", "示例") + "</span></div>" +
      '<div class="stmt-totals"><div class="stmt-tot"><span>' + bi("ยอดที่ต้องชำระ (เครดิต)", "Total owed (credit)", "应付合计（挂账）") + "</span><strong>" + baht(tot.owed) + "</strong><small>" +
      para("ผลรวมราคาสัญญาของรายการเครดิตในเดือนนี้", "Contract prices of credit bookings this month.", "本月挂账预订的合同价合计。") + "</small></div>" +
      '<div class="stmt-tot kick"><span>' + bi("ค่าคอมมิชชันที่ต้องจ่ายคืน", "Total kickback due", "应返佣金") + "</span><strong>" + baht(tot.kick) + "</strong><small>" +
      para("ส่วนต่างราคาเว็บไซต์กับราคาสัญญา ของรายการที่ชำระผ่าน Beam", "Public price minus contract price, on Beam-paid bookings.", "已通过 Beam 支付的预订：公开价减去合同价。") + "</small></div></div>" +
      '<div class="stmt-list">' + head + list + "</div>" + outside +
      '<p class="fine">' + para(
        "ตัวเลขเป็นตัวอย่าง การจองที่ยืนยันในเบราว์เซอร์นี้จะถูกเพิ่มในเดือนของวันที่รับ (ถ้าพื้นที่เก็บข้อมูลของเบราว์เซอร์ใช้ได้) ยังไม่มีใบแจ้งหนี้จริง",
        "Figures are examples. A booking you confirm in this browser is added on its pickup month when browser storage is available. There is no real invoice yet.",
        "数字均为示例。在此浏览器确认的预订会按接送日期计入该月（若浏览器允许存储）。尚无真实账单。") + "</p>" +
      '<p style="margin:14px 0 0"><a class="btn btn-primary" href="index.html">' + bi("จองงานใหม่", "New booking", "新预订") + "</a></p></div></div></section>";
    paint(biPlain("ใบแจ้งยอด", "Statement") + " — " + PARTNER.name + " · OKASTO", main);
  }

  function renderIndex() {
    var cards = (DATA.partners || []).map(function (p) {
      var credit = p.creditEnabled
        ? bi("เครดิตเปิดอยู่", "Credit enabled", "已开通挂账") + (p.creditLimit != null ? " · " + baht(p.creditLimit) : "")
        : bi("ไม่ได้เปิดเครดิต", "Credit off", "未开通挂账");
      return '<article class="plink"><h2>' + esc(p.name) + " " + typeBadge(p.type) + ' <span class="pid">Partner ID <b>' + esc(p.id) + "</b></span></h2>" +
        "<p>" + credit + "</p><p class=\"small-muted\"><code>okasto.com/p/" + esc(p.id) + "</code></p>" +
        '<div class="plink-actions"><a class="btn btn-primary" href="' + esc(p.id) + '/index.html">' + bi("เปิดหน้าจอง", "Open booking", "打开预订") + "</a>" +
        '<a class="btn btn-outline" href="' + esc(p.id) + '/statement.html">' + bi("ใบแจ้งยอด", "Statement", "月结单") + "</a></div></article>";
    }).join("");
    var main = '<section class="partner-hero"><div class="container"><div class="pbanner"><div class="pb-ico">' + ico("i-handshake") + '</div><div class="pb-text">' +
      '<p class="pb-kicker">' + bi("ตัวอย่าง", "Preview", "示例") + "</p><h1>" + bi("ลิงก์จองสำหรับพาร์ทเนอร์", "Partner booking links", "合作方预订链接") + "</h1>" +
      '<p class="pb-note">' + ico("i-shield") + "<span>" + para(
        "แต่ละพาร์ทเนอร์มีลิงก์ส่วนตัว ตารางราคาสัญญา และประวัติของตัวเอง ไม่ต้องล็อกอิน ข้อมูลทั้งหมดเป็นตัวอย่าง",
        "Each partner has a private link, its own contract rates and its own history. No login. All data is an example.",
        "每位合作方有专属链接、自己的合同价和记录。无需登录。数据均为示例。") + "</span></p></div></div></div></section>" +
      '<section class="pwrap"><div class="container"><div class="plink-list">' + cards + "</div>" +
      '<p class="fine">' + para("หน้าเหล่านี้เป็น noindex และไม่ควรใส่ใน sitemap.xml ทีละพาร์ทเนอร์", "These pages are noindex and must not be listed per partner in sitemap.xml.", "这些页面为 noindex，不应按合作方列入 sitemap.xml。") + "</p></div></section>";
    PARTNER = null;
    paint("Partner booking links — OKASTO", main);
  }
  function renderMissing(id) {
    PARTNER = null;
    var main = '<section class="pwrap"><div class="container"><div class="pcard"><h2>' + bi("ไม่พบลิงก์พาร์ทเนอร์นี้", "This partner link was not found", "找不到此合作方链接") + "</h2>" +
      "<p>" + para("ไม่มีรหัสนี้ในข้อมูลตัวอย่าง", "That id is not in the example data.", "示例数据中没有这个编号。") + " <b>" + esc(id || "—") + "</b></p>" +
      '<p><a class="btn btn-primary" href="../index.html">' + bi("ดูลิงก์ตัวอย่าง", "Example links", "示例链接") + "</a></p></div></div></section>";
    paint("OKASTO", main);
  }

  function start() {
    try { LANG = localStorage.getItem(LANG_KEY) || "th"; } catch (e) { LANG = "th"; }
    if (["th", "en", "zh"].indexOf(LANG) < 0) LANG = "th";
    document.body.dataset.lang = LANG;
    document.documentElement.lang = LANG === "zh" ? "zh-Hans" : LANG;
    VIEW = document.body.dataset.view || "book";
    if (VIEW === "index") { renderIndex(); return; }
    var id = resolveId();
    PARTNER = null;
    (DATA.partners || []).forEach(function (p) { if (p.id === id) PARTNER = p; });
    if (!PARTNER) { renderMissing(id); return; }
    if (VIEW === "sent") renderSent();
    else if (VIEW === "statement") renderStatement();
    else renderBook();
  }
  function boot() {
    PREFIX = assetPrefix();
    var inline = window.OKASTO_PARTNERS || null;
    fetch(PREFIX + "data/partners.json", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("status");
      return r.json();
    }).then(function (json) { DATA = json; }).catch(function () { DATA = inline; }).then(function () {
      if (!DATA || !DATA.partners) {
        document.getElementById("partner-root").textContent = "Partner data is missing.";
        return;
      }
      start();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
