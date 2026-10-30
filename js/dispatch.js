/* OKASTO dispatch demo UI. Thai first. Example data only.
   Driver screens never render the customer price. */
(function () {
  "use strict";
  var VIEW = document.body.getAttribute("data-view") || "hub";
  var WHO = "okasto.dispatch.who";
  var AUTH = "okasto.dispatch.authed";
  var API = null;
  var app = document.getElementById("app");
  var ui = { board: "all", q: "", zone: "", vehicle: "", tier: "", people: "all", pq: "", month: "", jobId: null, driverId: null, confirm: "" };
  var uploads = {};
  var TH_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  var EN_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var TH_DAY = { Sun: "อา.", Mon: "จ.", Tue: "อ.", Wed: "พ.", Thu: "พฤ.", Fri: "ศ.", Sat: "ส." };
  var VEH = { Sedan: ["รถเก๋ง", "Sedan"], SUV: ["SUV", "SUV"], Van: ["รถตู้", "Van"] };
  var ZONE = { Bangkok: ["กรุงเทพฯ", "Bangkok"], Pattaya: ["พัทยา", "Pattaya"], Phuket: ["ภูเก็ต", "Phuket"] };
  var TYPE = { regular: ["ประจำ", "Regular"], freelance: ["ฟรีแลนซ์", "Freelance"] };
  var TIER = {
    hold: ["ยังไม่ปล่อย", "Not released"],
    regular: ["รอบทีมประจำ", "Regular window"],
    freelance: ["เปิดฟรีแลนซ์", "Freelancers"],
    all: ["เปิดทุกคน", "Everyone"],
    assigned: ["มีคนรับแล้ว", "Assigned"],
    cancelled: ["ยกเลิก", "Cancelled"]
  };
  var STATUS = {
    open: ["รอรับ", "Open"],
    assigned: ["รอออกเดินทาง", "Accepted"],
    enroute: ["กำลังไป", "On the way"],
    arrived: ["ถึงจุดรับ", "At pickup"],
    picked: ["รับลูกค้าแล้ว", "Passenger on board"],
    done: ["ส่งเสร็จ", "Done"],
    cancelled: ["ยกเลิก", "Cancelled"]
  };
  var FLOW = [
    ["enroute", "กำลังไป", "On the way"],
    ["arrived", "ถึงจุดรับ", "At pickup"],
    ["picked", "รับลูกค้าแล้ว", "Passenger on board"],
    ["done", "ส่งเสร็จ", "Drop-off done"]
  ];
  var REASON = {
    taken: ["มีคนรับงานนี้ไปแล้ว", "Someone already took this job"],
    cap: ["รับงานค้างได้สูงสุด 3 งาน", "Maximum 3 open jobs"],
    busy: ["มีคนกำลังกดรับ ลองอีกครั้ง", "Someone else is accepting. Try again"],
    retry: ["ลองอีกครั้ง", "Try again"],
    "regular-only": ["ช่วงนี้รับได้เฉพาะทีมประจำ", "Only the regular team can take this"],
    "freelance-only": ["รอบนี้เปิดให้ฟรีแลนซ์", "This round is open to freelancers"],
    "not-urgent": ["ยังไม่ด่วน — รับลูกค้าเกิน 3 ชั่วโมง", "Pickup is more than 3 hours away"],
    docs: ["เอกสารยังไม่ครบ จึงอนุมัติไม่ได้", "Documents are incomplete"],
    mismatch: ["รถหรือโซนไม่ตรงกับงาน", "Vehicle or zone does not match"],
    "already-window": ["อยู่ในรอบทีมประจำอยู่แล้ว", "Already in the regular window"],
    "already-open": ["เปิดให้ทุกคนแล้ว", "Already open to everyone"],
    "not-mine": ["งานนี้ไม่ใช่ของคุณ", "This job is not yours"],
    "too-late": ["รับลูกค้าแล้ว ยกเลิกในแอปไม่ได้", "Cannot cancel after pickup"],
    closed: ["สถานะนี้ทำแบบนั้นไม่ได้", "That action is not available"],
    hold: ["งานนี้ยังไม่ถูกปล่อย", "This job has not been released"],
    pending: ["บัญชียังรออนุมัติ", "Account is waiting for approval"],
    suspended: ["บัญชีถูกระงับ", "Account is suspended"],
    "bad-bonus": ["โบนัสต้องอยู่ระหว่าง 50 ถึง 2,000 บาท", "Bonus must be between 50 and 2,000"],
    incomplete: ["กรอกข้อมูลและแนบเอกสาร 3 อย่างให้ครบ", "Complete the form and the three documents"],
    missing: ["ไม่พบรายการ", "Not found"],
    same: ["คนขับคนเดิม", "Same driver"],
    vehicle: ["ประเภทรถไม่ตรง", "Vehicle type does not match"],
    zone: ["โซนไม่ตรง", "Zone does not match"],
    "window-ended": ["รอบทีมประจำหมดเวลาแล้ว", "The regular window has ended"],
    cancelled: ["งานนี้ถูกยกเลิก", "This job was cancelled"]
  };
  var TAG = {
    R01: "เห็นรอบทีมประจำและงานด่วน",
    R02: "รถตู้พัทยา",
    R03: "SUV ภูเก็ต",
    F01: "อนุมัติแล้ว · กรุงเทพฯ",
    F02: "งานค้าง 2 จาก 3",
    F04: "ยกเลิกไปแล้ว 2 ครั้ง",
    F05: "ลองกดรับงานเดียวกันกับมานะ",
    F29: "ถูกระงับ เพราะยกเลิกบ่อย",
    F41: "รออนุมัติ · เอกสารครบ",
    F42: "รออนุมัติ · ยังไม่มีรูปรถ"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function bi(th, en) { return '<span class="l-th">' + esc(th) + '</span><span class="en">' + esc(en) + '</span>'; }
  function baht(n) { return "฿" + Math.round(Number(n) || 0).toLocaleString("en-US"); }
  function pair(map, key) { return map[key] || [key, key]; }
  function hashPath() { return (location.hash || "").replace(/^#\/?/, ""); }
  function nameTh(d) { return d.firstTh + " " + d.lastTh; }
  function nameEn(d) { return d.firstEn + " " + d.lastEn; }
  function fmtWhen(iso) {
    var p = API.bkkParts(iso);
    var mon = Number(p.month) - 1;
    return {
      th: (TH_DAY[p.weekday] || "") + " " + Number(p.day) + " " + TH_MON[mon] + " · " + p.hour + ":" + p.minute,
      en: p.weekday + " " + Number(p.day) + " " + EN_MON[mon] + " · " + p.hour + ":" + p.minute
    };
  }
  function countdown(iso) {
    if (!iso) return "";
    var ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return "หมดเวลา";
    var s = Math.ceil(ms / 1000);
    var m = Math.floor(s / 60);
    var ss = s % 60;
    if (m >= 60) return Math.floor(m / 60) + " ชม. " + (m % 60) + " นาที";
    return m + ":" + (ss < 10 ? "0" : "") + ss;
  }
  function toast(th, en) {
    ui.toast = bi(th, en || "");
    var old = document.querySelector(".d-toast");
    if (old) old.remove();
    var el = document.createElement("div");
    el.className = "d-toast";
    el.innerHTML = ui.toast;
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 2800);
  }
  function flash(result, okTh, okEn) {
    if (!result || result.ok === false) {
      var r = REASON[result && result.code] || ["ทำไม่ได้", "That did not work"];
      toast(r[0], r[1]);
      return false;
    }
    if (okTh) toast(okTh, okEn || "");
    return true;
  }
  function strip() {
    return '<div class="d-strip">ข้อมูลตัวอย่าง · เดโมในเบราว์เซอร์นี้ ไม่ได้เชื่อมระบบจริง และคนขับไม่เห็นราคาลูกค้า<span class="en">Example data · this browser only. No real backend. Drivers never see the customer price.</span></div>';
  }
  function logo() {
    return '<img class="d-logo" src="../img/logo-horizontal.png" alt="OKASTO">';
  }
  function btn(th, en, act, id, cls) {
    return '<button type="button" class="' + (cls || "btn btn-primary") + '" title="' + esc(en) + '" data-act="' + esc(act) + '"' + (id ? ' data-id="' + esc(id) + '"' : "") + ">" + esc(th) + "</button>";
  }
  function star(n) {
    if (n == null) return '<span class="d-sub">ยังไม่มี</span>';
    return '<span class="stars" aria-label="' + n + '">★ ' + Number(n).toFixed(1) + "</span>";
  }
  function svg(inner) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg>";
  }
  function routeHtml(job) {
    return '<div class="d-route"><div><i class="d-dot"></i><div><b>' + esc(job.pickupTh) + "</b><small>" + esc(job.pickupEn) + '</small></div></div><div><i class="d-dot"></i><div><b>' + esc(job.dropTh) + "</b><small>" + esc(job.dropEn) + "</small></div></div></div>";
  }
  function badges(job, pay) {
    var html = '<div class="d-badges">';
    var tier = pair(TIER, job.tier);
    var cls = job.tier === "regular" ? "b-reg" : job.tier === "freelance" ? "b-free" : job.tier === "all" ? "b-all" : "b-reg";
    if (job.tier === "regular" || job.tier === "freelance" || job.tier === "all") html += '<span class="d-badge ' + cls + '">' + esc(tier[0]) + " <small>" + esc(tier[1]) + "</small></span>";
    if (job.tier === "regular" && job.windowEndsAt) html += '<span class="d-badge b-time" data-cd="' + esc(job.windowEndsAt) + '">เหลือ ' + esc(countdown(job.windowEndsAt)) + "</span>";
    if (job.urgent || job.tier === "all") html += '<span class="d-badge b-all">ด่วน <small>Urgent</small></span>';
    if ((pay && pay.bonus) || job.bonus) html += '<span class="d-badge b-bonus">โบนัส ' + baht((pay && pay.bonus) || job.bonus) + "</span>";
    return html + "</div>";
  }
  function payBox(pay) {
    var extra = pay.bonus ? "<em>" + baht(pay.base) + " + โบนัส " + baht(pay.bonus) + "</em>" : "";
    return '<div class="d-pay"><span>ค่าตอบแทนของคุณ<small class="en">Your payout</small></span><div><strong>' + baht(pay.total) + "</strong><div>" + extra + "</div></div></div>";
  }

  function render() {
    if (!API || !app) return;
    var focusId = document.activeElement && document.activeElement.id;
    var pos = document.activeElement && document.activeElement.selectionStart;
    if (VIEW === "hub") app.innerHTML = renderHub();
    else if (VIEW === "driver") renderDriver();
    else if (VIEW === "signup") renderSignup();
    else if (VIEW === "admin") renderAdmin();
    if (focusId) {
      var el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (pos != null && el.setSelectionRange) { try { el.setSelectionRange(pos, pos); } catch (e) { /* number inputs */ } }
      }
    }
  }

  function personCard(d, cls) {
    var meta = pair(TYPE, d.type)[0] + " · " + pair(ZONE, d.zone)[0] + " · " + pair(VEH, d.vehicle)[0];
    return '<button type="button" class="d-role ' + (cls || "") + '" data-act="enter" data-id="' + esc(d.id) + '"><span class="tag">' + esc(TAG[d.id] || meta) + "</span><strong>" + esc(nameTh(d)) + "</strong><small>" + esc(nameEn(d)) + " · " + esc(meta) + "</small></button>";
  }
  function renderHub() {
    var state = API.get();
    var featured = (window.OKASTO_DISPATCH.featured || []).map(function (id) { return API.byId(state.drivers, id); }).filter(Boolean);
    var regs = featured.filter(function (d) { return d.type === "regular"; });
    var frees = featured.filter(function (d) { return d.type === "freelance" && d.status === "active"; });
    var blocked = featured.filter(function (d) { return d.status !== "active"; });
    var opts = state.drivers.map(function (d) {
      return '<option value="' + esc(d.id) + '">' + esc(d.id + " · " + nameTh(d) + " · " + pair(TYPE, d.type)[0] + " · " + pair(ZONE, d.zone)[0] + " · " + pair(VEH, d.vehicle)[0] + " · " + d.status) + "</option>";
    }).join("");
    return strip() + '<header class="d-top">' + logo() + '<span class="d-pill">เดโมจัดงานคนขับ</span></header><main class="d-wrap"><section class="d-hero"><h1>' + bi("จัดงานคนขับ", "Driver dispatch") + '</h1><p>' + bi("ทีมประจำได้ก่อน ในรอบเวลาที่กำหนด ถ้ายังไม่มีคนรับ งานเปิดให้ฟรีแลนซ์ที่ประเภทรถและโซนตรงกัน คนแรกที่กดรับ งานล็อกทันที", "Regular drivers get a priority window. After that, matching freelancers can take it. The first Accept locks the job.") + '</p></section><ol class="d-how"><li><span>01</span><b>' + bi("มอบหมายหรือปล่อยรอบ", "Assign or release") + '</b></li><li><span>02</span><b>' + bi("ทีมประจำรับภายใน 30 นาที", "Regular team, 30 min") + '</b></li><li><span>03</span><b>' + bi("หมดเวลาแล้วเปิดฟรีแลนซ์", "Then matching freelancers") + '</b></li><li><span>04</span><b>' + bi("ด่วนไม่ถึง 3 ชม. เปิดทุกคน / โบนัส", "Under 3 hours: everyone + bonus") + '</b></li></ol>' +
      '<section class="d-sec"><a class="d-admin-card" href="admin.html#/jobs"><div><h2 style="margin:0">' + bi("โต๊ะแอดมิน", "Dispatch desk") + '</h2><p class="d-note">' + bi("ตารางงาน มอบหมาย ปล่อยรอบ เปิดทุกคน โบนัส อนุมัติคนขับ สรุปจ่ายรายเดือน", "Jobs, assign, release, open to all, bonus, approvals, monthly payouts") + '</p></div><span class="btn btn-primary">เปิดโต๊ะจัดงาน</span></a></section>' +
      '<section class="d-sec"><h2>' + bi("เข้าเป็นคนขับประจำ", "Enter as a regular driver") + '</h2><div class="d-grid">' + regs.map(function (d) { return personCard(d); }).join("") + '</div></section>' +
      '<section class="d-sec"><h2>' + bi("เข้าเป็นฟรีแลนซ์", "Enter as a freelancer") + '</h2><div class="d-grid">' + frees.map(function (d) { return personCard(d); }).join("") + blocked.map(function (d) { return personCard(d, d.status === "suspended" ? "sus" : "wait"); }).join("") + '</div><p class="d-note">' + esc(state.settings.fleetNoteTh) + '<span class="en">' + esc(state.settings.fleetNoteEn) + '</span></p></section>' +
      '<section class="d-sec"><h2>' + bi("สมัครฟรีแลนซ์", "Freelancer sign-up") + '</h2><a class="d-admin-card" href="signup.html"><div><strong>' + bi("ส่งใบขับขี่ ทะเบียนรถ และรูปรถ", "Licence, registration and car photo") + '</strong><p class="d-note">' + bi("สถานะรออนุมัติ จะยังไม่เห็นงานจนกว่าแอดมินจะกดอนุมัติ", "Pending until an admin approves. No jobs before that.") + '</p></div><span class="btn btn-outline">เปิดฟอร์มสมัคร</span></a></section>' +
      '<section class="d-sec"><h2>' + bi("คนขับตัวอย่างคนอื่น", "Any example driver") + '</h2><div class="d-row"><select id="anyDriver">' + opts + '</select>' + btn("เข้าแอปคนขับ", "Open the driver app", "enter-select", "", "btn btn-outline") + '</div></section>' +
      '<div class="d-row">' + btn("รีเซ็ตข้อมูลตัวอย่าง", "Reset example data", "reset", "", "btn btn-outline") + '<span class="d-note">เปิดสองแท็บพร้อมกันได้ สถานะใช้ร่วมกันในเบราว์เซอร์นี้</span></div></main>';
  }

  function loginHtml(state, id) {
    var d = id ? API.byId(state.drivers, id) : null;
    var picker = "";
    if (!d) {
      var opts = state.drivers.map(function (x) {
        return '<option value="' + esc(x.id) + '">' + esc(nameTh(x) + " · " + pair(TYPE, x.type)[0]) + "</option>";
      }).join("");
      picker = '<label class="d-form" style="width:100%;max-width:320px;text-align:left">เลือกบัญชีตัวอย่าง<select id="pickWho">' + opts + "</select></label>";
    }
    var initial = d ? d.firstTh.charAt(0) : "O";
    var title = d ? nameTh(d) : "เลือกบัญชีตัวอย่าง";
    var sub = d ? pair(TYPE, d.type)[0] + " · " + pair(ZONE, d.zone)[0] + " · " + pair(VEH, d.vehicle)[0] : "Example account";
    return '<div class="d-phone"><div class="d-line-login">' + logo() + '<div class="d-ava">' + esc(initial) + "</div><h1>" + esc(title) + "</h1><p>" + esc(sub) + "</p>" + picker +
      '<button type="button" class="d-line-btn" data-act="line-login">เข้าสู่ระบบด้วย LINE</button><p class="d-note">จำลองหน้าเข้าสู่ระบบเท่านั้น ไม่ได้เชื่อมต่อ LINE จริง<span class="en">Mock LINE login. Not connected to LINE.</span></p><a href="index.html">เลือกบทบาทอื่น</a></div></div>';
  }
  function tabs(active, unread) {
    function tab(id, label, icon) {
      var badge = id === "line" && unread ? '<i style="position:absolute;top:-4px;right:18px;background:var(--brand-red);color:#fff;border-radius:99px;font-style:normal;font-size:.65rem;padding:0 4px">' + unread + "</i>" : "";
      return '<button type="button" class="' + (active === id ? "on" : "") + '" data-act="tab" data-id="' + id + '" style="position:relative">' + icon + badge + esc(label) + "</button>";
    }
    return '<nav class="d-tabs">' +
      tab("board", "งาน", svg('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>')) +
      tab("mine", "งานของฉัน", svg('<path d="M4 7h16v12H4z"/><path d="M8 7V5h8v2"/>')) +
      tab("earn", "รายได้", svg('<path d="M5 7h14v11H5z"/><path d="M8 7V6a4 4 0 0 1 8 0v1"/><path d="M12 11v4"/>')) +
      tab("line", "ไลน์", svg('<path d="M5 6h14v9H8l-3 3z"/>')) +
      "</nav>";
  }
  function phone(driver, state, body, tab) {
    var unread = API.unread(state, driver.id);
    var warn = "";
    if (driver.type === "freelance" && driver.status === "active" && driver.cancellations === state.settings.cancelSuspendAt - 1) {
      warn = '<div class="d-warn">ยกเลิกอีก 1 ครั้ง ระบบจะระงับบัญชีอัตโนมัติ (ตัวอย่างเกณฑ์ ' + state.settings.cancelSuspendAt + ' ครั้ง)</div>';
    }
    var chip = '<p class="d-id">' + esc(pair(TYPE, driver.type)[0] + " · " + pair(ZONE, driver.zone)[0] + " · " + pair(VEH, driver.vehicle)[0]) + "</p>";
    return '<div class="d-phone"><header class="d-appbar"><img class="d-logo-sm" src="../img/logo-wordmark.png" alt="OKASTO"><div class="who"><b>' + esc(nameTh(driver)) + '</b></div><a class="d-mini" href="index.html">สลับ</a><button type="button" class="d-bell" data-act="tab" data-id="line" aria-label="การแจ้งเตือน LINE">' + svg('<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 18a2 2 0 0 0 4 0"/>') + (unread ? "<i>" + unread + "</i>" : "") + "</button></header><main class=\"d-main\">" + chip + warn + body + "</main>" + tabs(tab, unread) + "</div>";
  }
  function blockedHtml(driver) {
    if (driver.status === "pending") {
      var docs = driver.docs || {};
      function row(ok, th) { return '<div class="d-check"><i>' + (ok ? "✓" : "!") + "</i><div>" + esc(th) + (ok ? "" : " · ยังไม่มี") + "</div></div>"; }
      return '<h1>' + bi("รอการอนุมัติ", "Waiting for approval") + "</h1><p>" + bi("ฟรีแลนซ์ต้องได้รับอนุมัติก่อน จึงจะเห็นงาน แอดมินตรวจใบขับขี่ ทะเบียนรถ และรูปรถ", "Freelancers see jobs only after approval of the licence, registration and car photo.") + "</p><div class=\"d-block\">" +
        row(docs.license && docs.license.ok, "ใบขับขี่") + row(docs.registration && docs.registration.ok, "ทะเบียนรถ") + row(docs.carPhoto && docs.carPhoto.ok, "รูปรถ") + "</div><p class=\"d-note\">รหัสตัวอย่าง " + esc(driver.id) + "</p>";
    }
    return '<h1>' + bi("บัญชีถูกระงับชั่วคราว", "Account suspended") + "</h1><p>" + bi("ยกเลิกบ่อยเกินเกณฑ์ตัวอย่าง (" + (driver.cancellations || 0) + " ครั้ง) จึงรับงานใหม่ไม่ได้ งานที่รับไว้แล้วยังทำให้จบได้ที่แท็บงานของฉัน", "Too many cancellations (" + (driver.cancellations || 0) + "). New jobs are hidden. Jobs already accepted can still be finished.") + "</p>" + btn("ดูงานที่รับไว้", "My accepted jobs", "tab", "mine", "btn btn-outline");
  }
  function jobCard(state, driver, job) {
    var dto = API.driverDTO(state, driver, job);
    var when = fmtWhen(dto.pickupAt);
    var urgent = dto.urgent || dto.tier === "all";
    return '<button type="button" class="d-card' + (urgent ? " urgent" : "") + '" data-act="open" data-id="' + esc(dto.id) + '">' + badges(dto, dto.pay) +
      '<div class="d-when">' + esc(when.th) + '<span class="en">' + esc(when.en) + "</span></div>" + routeHtml(dto) +
      '<div class="d-meta"><span>' + esc(dto.flight) + "</span><span>" + esc(pair(VEH, dto.vehicle)[0]) + "</span><span>" + dto.pax + " ผู้โดยสาร</span><span>" + dto.bags + " กระเป๋า</span></div>" + payBox(dto.pay) + "</button>";
  }
  function boardHtml(state, driver) {
    if (driver.status !== "active") return blockedHtml(driver);
    var jobs = API.visibleJobs(state, driver).filter(function (j) {
      if (ui.board === "window") return j.tier === "regular";
      if (ui.board === "urgent") return API.isUrgent(state, j) || j.tier === "all" || j.bonus > 0;
      if (ui.board === "bonus") return j.bonus > 0;
      return true;
    });
    var chips = [["all", "ทั้งหมด"], ["window", "รอบทีมประจำ"], ["urgent", "ด่วน"], ["bonus", "มีโบนัส"]].map(function (c) {
      return '<button type="button" class="' + (ui.board === c[0] ? "on" : "") + '" data-act="board-filter" data-id="' + c[0] + '">' + esc(c[1]) + "</button>";
    }).join("");
    var list = jobs.length ? jobs.map(function (j) { return jobCard(state, driver, j); }).join("") : '<div class="d-empty">' + bi("ยังไม่มีงานที่ตรงกับรถและโซนของคุณ", "No jobs match your vehicle and zone") + "</div>";
    var cap = driver.type === "freelance" ? '<p class="d-note">งานค้าง ' + API.openCount(state, driver.id) + " / " + state.settings.maxOpenJobs + " · เห็นเฉพาะค่าตอบแทน ไม่เห็นราคาลูกค้า</p>" : '<p class="d-note">เห็นเฉพาะค่าตอบแทนของคุณ ไม่เห็นราคาที่ลูกค้าจ่าย</p>';
    return '<div class="d-h"><h1>' + bi("งานที่รับได้", "Jobs you can take") + "</h1></div>" + cap + '<div class="d-filters">' + chips + "</div>" + list;
  }
  function detailHtml(state, driver, jobId) {
    var job = API.byId(state.jobs, jobId);
    if (!job) return '<p>ไม่พบงาน</p>';
    var dto = API.driverDTO(state, driver, job);
    var reason = API.blockReason(state, driver, job);
    var when = fmtWhen(dto.pickupAt);
    var action = "";
    if (reason === "mine") action = btn("ไปที่งานของฉัน", "My jobs", "tab", "mine", "btn btn-primary btn-block");
    else if (!reason && driver.status === "active") action = '<div class="d-pay"><span>คุณจะได้รับ</span><strong>' + baht(dto.pay.total) + "</strong></div>" + btn("รับงาน", "Accept", "accept", dto.id, "btn btn-primary btn-block");
    else action = '<div class="d-warn">' + bi.apply(null, REASON[reason] || ["รับงานนี้ไม่ได้", "You cannot take this job"]) + "</div>";
    return btn("กลับ", "Back", "tab", "board", "d-back") + badges(dto, dto.pay) + '<div class="d-when">' + esc(when.th) + '<span class="en">' + esc(when.en) + "</span></div>" + routeHtml(dto) +
      '<div class="d-block"><div>' + bi("เที่ยวบิน " + dto.flight, "Flight " + dto.flight) + "</div><div>" + bi(pair(VEH, dto.vehicle)[0] + " · " + dto.pax + " ผู้โดยสาร · " + dto.bags + " กระเป๋า", pair(VEH, dto.vehicle)[1] + " · " + dto.pax + " pax · " + dto.bags + " bags") + "</div><div style=\"margin-top:6px\">" + bi("ผู้โดยสาร " + dto.paxTh, "Passenger " + dto.paxEn) + "</div><p class=\"d-note\">" + esc(dto.noteTh) + '<span class="en">' + esc(dto.noteEn) + "</span></p></div>" +
      '<div class="d-sticky">' + action + '<p class="d-note">ราคาที่ลูกค้าจ่ายไม่แสดงในแอปคนขับ</p></div>';
  }
  function stepper(status) {
    var order = { assigned: -1, enroute: 0, arrived: 1, picked: 2, done: 3 };
    var at = order[status];
    if (at == null) at = -1;
    return '<ol class="d-flow">' + FLOW.map(function (step, i) {
      var cls = i < at ? "done" : i === at ? "done" : i === at + 1 ? "now" : "";
      if (status === "done") cls = "done";
      return '<li class="' + cls + '"><span class="n">' + (i < at || status === "done" || (i === at && status !== "assigned") ? "✓" : i + 1) + "</span><div><b>" + esc(step[1]) + "</b><span class=\"en\">" + esc(step[2]) + "</span></div></li>";
    }).join("") + "</ol>";
  }
  function mineHtml(state, driver) {
    var mine = API.myJobs(state, driver.id);
    var open = mine.filter(function (j) { return j.status !== "done"; });
    var done = mine.filter(function (j) { return j.status === "done"; });
    function card(job) {
      var dto = API.driverDTO(state, driver, job);
      var when = fmtWhen(dto.pickupAt);
      var next = { assigned: FLOW[0], enroute: FLOW[1], arrived: FLOW[2], picked: FLOW[3] }[job.status];
      var controls = "";
      if (next && job.status !== "done") {
        controls = btn(next[1], next[2], "advance", job.id, "btn btn-primary btn-block");
        if (job.status === "assigned" || job.status === "enroute" || job.status === "arrived") {
          controls += '<div style="height:8px"></div>' + btn("ยกเลิกงานนี้", "Cancel this job", "driver-cancel", job.id, "btn btn-outline btn-danger btn-block");
        }
      }
      return '<article class="d-card" style="cursor:default"><div class="d-when">' + esc(when.th) + " · " + esc(job.id) + "</div>" + routeHtml(dto) + stepper(job.status) + payBox(dto.pay) + controls + "</article>";
    }
    var body = open.length ? open.map(card).join("") : '<div class="d-empty">' + bi("ยังไม่มีงานที่รับไว้", "No accepted jobs yet") + "</div>";
    var hist = done.length ? '<h2 style="margin-top:16px">' + bi("ส่งแล้วเดือนนี้และก่อนหน้า", "Completed") + "</h2>" + done.slice(0, 6).map(function (j) {
      var dto = API.driverDTO(state, driver, j);
      return '<article class="d-card" style="cursor:default"><b>' + esc(j.id) + "</b> " + esc(fmtWhen(j.pickupAt).th) + payBox(dto.pay) + "</article>";
    }).join("") : "";
    return '<div class="d-h"><h1>' + bi("งานของฉัน", "My jobs") + "</h1></div><p class=\"d-note\">กำลังไป → ถึงจุดรับ → รับลูกค้าแล้ว → ส่งเสร็จ</p>" + body + hist;
  }
  function earnHtml(state, driver) {
    if (!ui.month) ui.month = API.monthKey(new Date().toISOString());
    var sum = API.earnings(state, driver.id, ui.month);
    var rate = state.rates[driver.type][driver.vehicle];
    var rows = sum.rows.map(function (r) {
      return "<tr><td>" + esc(fmtWhen(r.pickupAt).th) + "<div class=\"d-sub\">" + esc(r.pickupTh) + " → " + esc(r.dropTh) + "</div></td><td>" + baht(r.pay.base) + (r.pay.bonus ? "<div class=\"d-sub\">+" + baht(r.pay.bonus) + "</div>" : "") + "</td></tr>";
    }).join("");
    var zones = window.OKASTO_DISPATCH_CORE.ZONES.map(function (z) {
      return "<tr><td>" + esc(pair(ZONE, z)[0]) + "</td><td>" + baht(rate[z]) + "</td></tr>";
    }).join("");
    return '<div class="d-h"><h1>' + bi("รายได้", "Earnings") + "</h1></div><div class=\"d-earn\"><span>" + esc(ui.month) + " · " + esc(pair(TYPE, driver.type)[0]) + "</span><strong>" + baht(sum.total) + "</strong><span class=\"en\">" + sum.count + " jobs · payout only</span></div>" +
      '<p class="d-warn">คุณเห็นเฉพาะค่าตอบแทนของตัวเอง ไม่เห็นราคาที่ลูกค้าจ่าย</p>' +
      '<label class="d-form">เดือน<input id="earnMonth" type="month" value="' + esc(ui.month) + '"></label>' +
      '<div class="d-table-wrap" style="margin-top:10px"><table class="d-rate"><tbody>' + (rows || '<tr><td>ยังไม่มีงานที่ส่งเสร็จในเดือนนี้</td></tr>') + "</tbody></table></div>" +
      '<h2 style="margin-top:16px">' + bi("อัตราของคุณ · " + pair(VEH, driver.vehicle)[0], "Your rate") + '</h2><table class="d-rate"><tbody>' + zones + "</tbody></table><p class=\"d-note\">เรทประจำกับเรทฟรีแลนซ์คนละชุด ตัวเลขเป็นตัวอย่าง</p>";
  }
  function lineHtml(state, driver) {
    var notes = state.notices.filter(function (n) { return n.driverId === driver.id; });
    var bubbles = notes.map(function (n) {
      var t = fmtWhen(n.at || n.createdAt || new Date().toISOString());
      return '<button type="button" class="d-bubble" data-act="open-note" data-id="' + esc(n.jobId || "") + '"><b>' + esc(n.titleTh) + '</b><span class="en">' + esc(n.titleEn) + "</span><div>" + esc(n.bodyTh) + '</div><span class="en">' + esc(n.bodyEn) + "</span><time>" + esc(t.th) + "</time></button>";
    }).join("") || '<div class="d-bubble">ยังไม่มีการแจ้งเตือน</div>';
    return '<div class="d-chat"><div class="d-linehead"><div class="d-ava" style="width:40px;height:40px;font-size:1rem;background:#fff;color:#06C755">O</div><div><b>OKASTO จัดงาน</b><small>บัญชีทางการ · จำลอง</small></div></div>' + bubbles + '<p class="d-note" style="color:#fff;padding:0 14px">ข้อความเหล่านี้จำลองในหน้าเว็บ ไม่ได้ส่งเข้า LINE จริง</p></div>';
  }
  function renderDriver() {
    var state = API.get();
    var q = new URLSearchParams(location.search);
    if (!sessionStorage.getItem(WHO) && q.get("as")) sessionStorage.setItem(WHO, q.get("as"));
    var id = sessionStorage.getItem(WHO);
    if (sessionStorage.getItem(AUTH) !== id || !id) {
      app.innerHTML = strip() + loginHtml(state, id);
      return;
    }
    var driver = API.byId(state.drivers, id);
    if (!driver) { app.innerHTML = strip() + loginHtml(state, null); return; }
    var h = hashPath();
    var screen = "board";
    var jobId = "";
    if (h.indexOf("job/") === 0) { screen = "job"; jobId = decodeURIComponent(h.slice(4)); }
    else if (h === "mine" || h === "earn" || h === "line" || h === "board") screen = h;
    if (screen === "line" && API.unread(state, driver.id)) {
      API.markRead(driver.id);
      state = API.get();
    }
    var body = screen === "job" ? detailHtml(state, driver, jobId) : screen === "mine" ? mineHtml(state, driver) : screen === "earn" ? earnHtml(state, driver) : screen === "line" ? lineHtml(state, driver) : boardHtml(state, driver);
    app.innerHTML = strip() + phone(driver, state, body, screen === "job" ? "board" : screen);
  }

  function renderSignup() {
    var state = API.get();
    var id = sessionStorage.getItem("okasto.dispatch.signup");
    var d = id ? API.byId(state.drivers, id) : null;
    var inner;
    if (d) {
      inner = '<div class="d-line-login" style="text-align:left;justify-items:stretch"><h1>' + bi("ส่งคำขอแล้ว", "Application sent") + "</h1>" + blockedHtml(d) + '<a class="btn btn-primary" href="driver.html?as=' + esc(d.id) + '&login=1#/board">เปิดแอปในชื่อนี้</a><p class="d-note">ไปที่โต๊ะแอดมิน แท็บคนขับ แล้วกดอนุมัติ งานจะปรากฏในแอป</p>' + btn("สมัครอีกใบ", "New application", "signup-again", "", "btn btn-outline") + "</div>";
    } else {
      var zones = window.OKASTO_DISPATCH_CORE.ZONES.map(function (z) { return '<option value="' + z + '">' + esc(pair(ZONE, z)[0] + " · " + z) + "</option>"; }).join("");
      var vehs = window.OKASTO_DISPATCH_CORE.VEHICLES.map(function (v) { return '<option value="' + v + '">' + esc(pair(VEH, v)[0]) + "</option>"; }).join("");
      function drop(key, th, en) {
        var u = uploads[key];
        var preview = u && u.preview ? '<img alt="" src="' + u.preview + '">' : "";
        return '<label class="d-drop">' + esc(th) + '<span class="en">' + esc(en) + '</span><input type="file" accept="image/*" data-file="' + key + '">' + preview + (u ? '<small>แนบแล้ว: ' + esc(u.name) + "</small>" : "") + "</label>";
      }
      inner = '<div class="d-main"><a href="index.html">← เดโม</a><h1>' + bi("สมัครฟรีแลนซ์", "Freelancer sign-up") + '</h1><p class="d-note">' + bi("ต้องมีใบขับขี่ ทะเบียนรถ และรูปรถ แอดมินอนุมัติก่อนจึงจะเห็นงาน", "Licence, vehicle registration and a car photo. An admin must approve you.") + '</p><form class="d-form" data-form="signup"><label>ชื่อ<input name="firstTh" required placeholder="ชื่อจริง"></label><label>นามสกุล<input name="lastTh" required></label><label>ชื่อภาษาอังกฤษ<input name="firstEn" placeholder="Example"></label><label>เบอร์โทร (ตัวอย่าง)<input name="phone" required placeholder="080-000-0000" inputmode="tel"></label><label>LINE ID<input name="lineName" required placeholder="name.example"></label><label>โซนที่รับงาน<select name="zone">' + zones + '</select></label><label>ประเภทรถ<select name="vehicle">' + vehs + '</select></label><label>ทะเบียนรถ<input name="plate" required placeholder="ตย 1234"></label>' +
        drop("license", "ใบขับขี่", "Driving licence") + drop("registration", "เล่มทะเบียนรถ", "Vehicle registration") + drop("carPhoto", "รูปรถ", "Photo of the car") +
        '<button class="btn btn-primary btn-block" type="submit">ส่งเอกสาร</button><p class="d-note">ไฟล์อยู่แค่ในเบราว์เซอร์นี้ ไม่ได้อัปโหลดขึ้นเซิร์ฟเวอร์</p></form></div>';
    }
    app.innerHTML = strip() + '<div class="d-phone">' + inner + "</div>";
  }

  function syncAdminHash() {
    var h = hashPath();
    var tab = ui.tab || "jobs";
    if (h.indexOf("drivers") === 0) {
      tab = "drivers";
      ui.people = h.split("/")[1] || ui.people || "all";
    } else if (h === "payouts" || h === "rates" || h === "jobs") tab = h;
    if (tab !== ui.tab) {
      ui.jobId = null;
      ui.driverId = null;
      ui.confirm = "";
    }
    ui.tab = tab;
  }
  function stat(n, th) { return '<div class="d-stat"><b>' + n + "</b><span>" + esc(th) + "</span></div>"; }
  function renderAdmin() {
    syncAdminHash();
    var state = API.get();
    if (!ui.month) ui.month = API.monthKey(new Date().toISOString());
    var jobs = state.jobs;
    var open = jobs.filter(function (j) { return j.status === "open"; });
    var stats = '<div class="d-stats">' +
      stat(open.filter(function (j) { return j.tier === "hold"; }).length, "ยังไม่ปล่อย") +
      stat(open.filter(function (j) { return j.tier === "regular"; }).length, "รอบทีมประจำ") +
      stat(open.filter(function (j) { return j.tier === "freelance"; }).length, "เปิดฟรีแลนซ์") +
      stat(open.filter(function (j) { return API.isUrgent(state, j); }).length, "ด่วนยังไม่มีคน") +
      stat(state.drivers.filter(function (d) { return d.type === "regular" && d.status === "active"; }).length, "คนขับประจำ") +
      stat(state.drivers.filter(function (d) { return d.status === "pending"; }).length, "รออนุมัติ") +
      "</div>";
    var tabs = '<div class="d-tabs2">' +
      ["jobs", "งาน", "drivers", "คนขับ", "payouts", "จ่ายรายเดือน", "rates", "เรทตัวอย่าง"].reduce(function (html, item, i, arr) {
        if (i % 2) return html;
        var id = arr[i];
        var hash = id === "drivers" ? "#/drivers" + (ui.people !== "all" ? "/" + ui.people : "") : "#/" + id;
        return html + '<button type="button" class="' + (ui.tab === id ? "on" : "") + '" data-act="admin-tab" data-id="' + id + '">' + esc(arr[i + 1]) + "</button>";
      }, "") + "</div>";
    var body = ui.tab === "drivers" ? driversTable(state) : ui.tab === "payouts" ? payouts(state) : ui.tab === "rates" ? ratesTable(state) : jobsTable(state);
    var sheet = "";
    if (ui.jobId) sheet = jobSheet(state, ui.jobId);
    if (ui.driverId) sheet = driverSheet(state, ui.driverId);
    var latest = state.audit && state.audit[0] ? '<p class="d-latest">' + esc(state.audit[0].th) + "</p>" : "";
    app.innerHTML = strip() + '<header class="d-top">' + logo() + '<div><b>โต๊ะจัดงาน</b><div class="d-sub">Dispatch desk · example</div></div><span class="d-pill">noindex</span><a href="index.html">สลับบทบาท</a>' + btn("รีเซ็ตตัวอย่าง", "Reset", "reset", "", "btn btn-outline btn-sm") + "</header><main class=\"d-desk\"><h1>" + bi("งานและคนขับ", "Jobs and drivers") + "</h1><p class=\"d-note\">" + esc(state.settings.fleetNoteTh) + "</p>" + latest + stats + tabs + body + audit(state) + "</main>" + sheet;
  }
  function jobsTable(state) {
    var zones = '<option value="">ทุกโซน</option>' + window.OKASTO_DISPATCH_CORE.ZONES.map(function (z) { return '<option' + (ui.zone === z ? " selected" : "") + ' value="' + z + '">' + esc(pair(ZONE, z)[0]) + "</option>"; }).join("");
    var vehs = '<option value="">ทุกประเภทรถ</option>' + window.OKASTO_DISPATCH_CORE.VEHICLES.map(function (v) { return '<option' + (ui.vehicle === v ? " selected" : "") + ' value="' + v + '">' + esc(pair(VEH, v)[0]) + "</option>"; }).join("");
    var tiers = '<option value="">ทุกชั้น</option>' + ["hold", "regular", "freelance", "all", "assigned", "cancelled"].map(function (t) { return '<option' + (ui.tier === t ? " selected" : "") + ' value="' + t + '">' + esc(pair(TIER, t)[0]) + "</option>"; }).join("");
    var rows = state.jobs.filter(function (j) {
      if (ui.zone && j.zone !== ui.zone) return false;
      if (ui.vehicle && j.vehicle !== ui.vehicle) return false;
      if (ui.tier && j.tier !== ui.tier) return false;
      if (ui.q) {
        var blob = (j.id + " " + j.flight + " " + j.pickupTh + " " + j.dropTh + " " + (j.assigneeId || "")).toLowerCase();
        if (blob.indexOf(ui.q.toLowerCase()) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      function bucket(j) {
        if (j.status === "open") return 0;
        if (j.status === "done") return 2;
        if (j.status === "cancelled") return 3;
        return 1;
      }
      var d = bucket(a) - bucket(b);
      if (d) return d;
      if (a.status === "open" && b.status === "open") {
        var ua = API.isUrgent(state, a) ? 0 : 1;
        var ub = API.isUrgent(state, b) ? 0 : 1;
        if (ua !== ub) return ua - ub;
      }
      var ta = new Date(a.pickupAt).getTime();
      var tb = new Date(b.pickupAt).getTime();
      return bucket(a) === 2 ? tb - ta : ta - tb;
    });
    var body = rows.map(function (j) {
      var d = j.assigneeId ? API.byId(state.drivers, j.assigneeId) : null;
      var when = fmtWhen(j.pickupAt);
      var cd = j.tier === "regular" && j.windowEndsAt ? '<div class="d-sub" data-cd="' + esc(j.windowEndsAt) + '">เหลือ ' + esc(countdown(j.windowEndsAt)) + "</div>" : "";
      var urgent = API.isUrgent(state, j);
      return '<tr class="' + (urgent ? "hot" : "") + '"><td><button type="button" class="linkish" data-act="open-job" data-id="' + esc(j.id) + '">' + esc(j.id) + "</button><div class=\"d-sub\">" + esc(when.th) + "</div></td><td><div class=\"d-k\">" + esc(j.pickupTh) + " → " + esc(j.dropTh) + "</div><div class=\"d-sub\">" + esc(j.flight) + " · " + j.pax + " คน · " + j.bags + " ใบ</div></td><td>" + esc(pair(VEH, j.vehicle)[0]) + "<div class=\"d-sub\">" + esc(pair(ZONE, j.zone)[0]) + "</div></td><td>" + esc(pair(STATUS, j.status)[0]) + "<div class=\"d-sub\">" + esc(pair(TIER, j.tier)[0]) + cd + (urgent ? " · ด่วน" : "") + "</div></td><td>" + (d ? esc(nameTh(d)) : "—") + "</td><td>" + (j.payoutTotal != null ? baht(j.payoutTotal) : "—") + (j.bonus ? '<div class="d-sub">โบนัส ' + baht(j.bonus) + "</div>" : "") + "</td><td class=\"d-sub\">" + baht(j.customerPrice) + "</td></tr>";
    }).join("");
    return '<div class="d-tools"><input id="qJobs" placeholder="ค้นรหัส / เที่ยวบิน / สถานที่" value="' + esc(ui.q) + '"><select id="fZone">' + zones + '</select><select id="fVeh">' + vehs + '</select><select id="fTier">' + tiers + '</select><span class="d-note">คอลัมน์ราคาลูกค้ามีเฉพาะหลังบ้าน</span></div><div class="d-table-wrap"><table class="d-table"><thead><tr><th>งาน</th><th>รับ → ส่ง</th><th>รถ</th><th>สถานะ</th><th>คนขับ</th><th>ค่าคนขับ</th><th>ราคาลูกค้า</th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }
  function jobSheet(state, id) {
    var job = API.byId(state.jobs, id);
    if (!job) return "";
    var when = fmtWhen(job.pickupAt);
    var regs = state.drivers.filter(function (d) {
      return d.type === "regular" && d.status === "active" && d.zone === job.zone && d.vehicle === job.vehicle && d.id !== job.assigneeId;
    });
    var options = regs.map(function (d) {
      return '<option value="' + esc(d.id) + '">' + esc(nameTh(d) + " · ★" + d.rating + " · ค้าง " + API.openCount(state, d.id)) + "</option>";
    }).join("");
    var urgent = API.isUrgent(state, job);
    var assignForm = options ? '<form data-form="assign" data-id="' + esc(job.id) + '"><label class="d-form">คนขับประจำที่รถและโซนตรง<select name="driver">' + options + '</select></label><button class="btn btn-primary btn-block" type="submit">' + (job.assigneeId ? "ย้ายให้คนขับประจำคนนี้" : "มอบหมายให้คนขับประจำ") + "</button></form>" : '<p class="d-note">ไม่มีคนขับประจำที่ว่างและตรงกับรถ/โซนนี้</p>';
    var pool = "";
    if (!job.assigneeId && job.status !== "cancelled" && job.status !== "done") {
      pool += btn("ปล่อยให้ทีมประจำ 30 นาที", "Release to regulars", "release", job.id, "btn btn-outline btn-block");
      pool += btn("เปิดให้ทุกคน", "Open to everyone", "open-all", job.id, "btn btn-outline btn-block") + '<p class="d-note">' + (urgent ? "รับภายใน 3 ชั่วโมง เปิดได้" : "ปุ่มเปิดทุกคนใช้ได้เมื่อเหลือไม่เกิน 3 ชั่วโมง") + "</p>";
      pool += '<form data-form="bonus" data-id="' + esc(job.id) + '" class="d-row"><input name="amount" type="number" min="50" max="2000" step="50" value="200" style="width:120px"><button class="btn btn-outline" type="submit">เพิ่มโบนัส</button></form>';
      pool += btn("จำลองหมดเวลารอบทีมประจำ", "End the window now", "end-window", job.id, "btn btn-outline btn-block");
    }
    if (job.status !== "done" && job.status !== "cancelled") {
      pool += ui.confirm === "cancel:" + job.id
        ? btn("ยืนยันยกเลิกงาน", "Confirm cancel", "cancel-yes", job.id, "btn btn-danger btn-block")
        : btn("ยกเลิกงาน", "Cancel job", "cancel-ask", job.id, "btn btn-danger btn-block");
    }
    var quotes = window.OKASTO_DISPATCH_CORE.VEHICLES ? "" : "";
    var regPay = state.rates.regular[job.vehicle][job.zone] + (job.bonus || 0);
    var freePay = state.rates.freelance[job.vehicle][job.zone] + (job.bonus || 0);
    return '<div class="d-sheet-back"><aside class="d-sheet"><button type="button" class="d-back" data-act="close-sheet">ปิด</button><h2>' + esc(job.id) + "</h2><p>" + esc(when.th) + "</p>" + routeHtml(job) +
      '<p>' + esc(pair(VEH, job.vehicle)[0] + " · " + pair(ZONE, job.zone)[0] + " · " + job.flight + " · " + job.pax + " คน · " + job.bags + " ใบ") + "</p><p>" + bi(pair(STATUS, job.status)[0] + " · " + pair(TIER, job.tier)[0], pair(STATUS, job.status)[1]) + "</p>" +
      '<div class="d-price-admin"><div>ค่าคนขับประจำ ' + baht(regPay) + "</div><div>ค่าฟรีแลนซ์ " + baht(freePay) + '</div><div class="cust">ราคาลูกค้า ' + baht(job.customerPrice) + " · ไม่ส่งเข้าแอปคนขับ</div>" + (job.bonus ? "<div>โบนัสปัจจุบัน " + baht(job.bonus) + "</div>" : "") + "</div>" +
      (job.assigneeId ? "<p>คนขับปัจจุบัน <b>" + esc(nameTh(API.byId(state.drivers, job.assigneeId) || { firstTh: job.assigneeId, lastTh: "" })) + "</b></p>" : "") +
      '<div class="d-actions">' + assignForm + pool + "</div></aside></div>";
  }
  function driversTable(state) {
    var chips = [["all", "ทั้งหมด"], ["regular", "ประจำ"], ["freelance", "ฟรีแลนซ์"], ["pending", "รออนุมัติ"], ["suspended", "ระงับ"]].map(function (c) {
      return '<button type="button" class="' + (ui.people === c[0] ? "on" : "") + '" data-act="people" data-id="' + c[0] + '">' + esc(c[1]) + "</button>";
    }).join("");
    var rows = state.drivers.filter(function (d) {
      if (ui.people === "regular" || ui.people === "freelance") { if (d.type !== ui.people) return false; }
      else if (ui.people === "pending" || ui.people === "suspended") { if (d.status !== ui.people) return false; }
      if (ui.pq) {
        var blob = (d.id + " " + nameTh(d) + " " + nameEn(d) + " " + d.plate).toLowerCase();
        if (blob.indexOf(ui.pq.toLowerCase()) < 0) return false;
      }
      return true;
    });
    var body = rows.map(function (d) {
      var docs = API.docsOk(d) ? "ครบ" : "ไม่ครบ";
      var act = d.status === "pending"
        ? btn(API.docsOk(d) ? "อนุมัติ" : "เอกสารไม่ครบ", "Approve", "approve", d.id, API.docsOk(d) ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm")
        : btn("ดู", "View", "open-driver", d.id, "btn btn-outline btn-sm");
      return "<tr><td><button type=\"button\" class=\"linkish\" data-act=\"open-driver\" data-id=\"" + esc(d.id) + "\">" + esc(nameTh(d)) + "</button><div class=\"d-sub\">" + esc(nameEn(d)) + " · " + esc(d.id) + " · " + esc(d.plate) + "</div></td><td>" + esc(pair(TYPE, d.type)[0]) + "</td><td>" + esc(pair(ZONE, d.zone)[0]) + "<div class=\"d-sub\">" + esc(pair(VEH, d.vehicle)[0]) + "</div></td><td>" + star(d.rating) + "</td><td>" + (d.cancellations || 0) + "</td><td>" + API.openCount(state, d.id) + "</td><td>" + docs + "</td><td>" + esc(d.status === "active" ? "ใช้งาน" : d.status === "pending" ? "รออนุมัติ" : "ระงับ") + "</td><td>" + act + "</td></tr>";
    }).join("");
    return '<div class="d-tools"><input id="qPeople" placeholder="ค้นชื่อ / รหัส / ทะเบียน" value="' + esc(ui.pq) + '"></div><div class="d-filters">' + chips + '</div><div class="d-table-wrap"><table class="d-table"><thead><tr><th>คนขับ</th><th>ประเภท</th><th>โซน / รถ</th><th>คะแนน</th><th>ยกเลิก</th><th>งานค้าง</th><th>เอกสาร</th><th>สถานะ</th><th></th></tr></thead><tbody>' + body + "</tbody></table></div>";
  }
  function driverSheet(state, id) {
    var d = API.byId(state.drivers, id);
    if (!d) return "";
    var docs = d.docs || {};
    function file(key, th) {
      var f = docs[key] || {};
      var img = f.preview ? '<img alt="" src="' + f.preview + '" style="width:100%;max-height:140px;object-fit:cover;border-radius:10px">' : "";
      return '<div class="d-block"><b>' + esc(th) + "</b><div class=\"d-sub\">" + (f.ok ? "มีไฟล์" : "ยังไม่มี") + (f.example ? " · ไฟล์ตัวอย่าง" : "") + " " + esc(f.name || "") + "</div>" + img + "</div>";
    }
    var actions = "";
    if (d.status === "pending") actions += btn("อนุมัติ", "Approve", "approve", d.id, "btn btn-primary btn-block");
    if (d.status === "active") actions += btn("ระงับ", "Suspend", "suspend", d.id, "btn btn-danger btn-block");
    if (d.status === "suspended") actions += btn("เปิดใช้อีกครั้ง", "Reinstate", "reinstate", d.id, "btn btn-primary btn-block");
    return '<div class="d-sheet-back"><aside class="d-sheet"><button type="button" class="d-back" data-act="close-sheet">ปิด</button><h2>' + esc(nameTh(d)) + '</h2><p class="d-note">' + esc(nameEn(d) + " · " + d.id + " · " + d.phone + " · LINE " + d.lineName) + "</p><p>" + esc(pair(TYPE, d.type)[0] + " · " + pair(ZONE, d.zone)[0] + " · " + pair(VEH, d.vehicle)[0]) + " · " + star(d.rating) + " · ยกเลิก " + (d.cancellations || 0) + "</p>" +
      file("license", "ใบขับขี่") + file("registration", "ทะเบียนรถ") + file("carPhoto", "รูปรถ") + '<div class="d-actions">' + actions + "</div></aside></div>";
  }
  function payouts(state) {
    var rows = API.payoutSummary(state, ui.month);
    var reg = 0, free = 0, cust = 0, n = 0;
    var body = rows.map(function (r) {
      var total = r.base + r.bonus;
      if (r.driver.type === "regular") reg += total; else free += total;
      cust += r.customer;
      n += r.count;
      return "<tr><td>" + esc(nameTh(r.driver)) + "<div class=\"d-sub\">" + esc(r.driver.id) + "</div></td><td>" + esc(pair(TYPE, r.driver.type)[0]) + "</td><td>" + r.count + "</td><td>" + baht(r.base) + "</td><td>" + baht(r.bonus) + "</td><td class=\"d-k\">" + baht(total) + "</td></tr>";
    }).join("");
    return '<div class="d-tools"><label>เดือน <input id="payMonth" type="month" value="' + esc(ui.month) + '"></label><span class="d-note">ยอดคือค่าตอบแทนคนขับ ราคาลูกค้าอยู่การ์ดขวาและไม่ถูกส่งให้คนขับ</span></div><div class="d-stats">' +
      stat(baht(reg), "จ่ายทีมประจำ") + stat(baht(free), "จ่ายฟรีแลนซ์") + stat(baht(reg + free), "จ่ายรวม") + stat(String(n), "งานที่ส่งเสร็จ") + stat(baht(cust), "ราคาลูกค้า (หลังบ้าน)") + stat(baht(cust - reg - free), "ส่วนต่างตัวอย่าง") +
      '</div><div class="d-table-wrap"><table class="d-table"><thead><tr><th>คนขับ</th><th>ประเภท</th><th>งาน</th><th>ค่าตอบแทน</th><th>โบนัส</th><th>รวม</th></tr></thead><tbody>' + (body || '<tr><td colspan="6">ไม่มีงานที่ส่งเสร็จในเดือนนี้</td></tr>') + "</tbody></table></div>";
  }
  function ratesTable(state) {
    var head = "<tr><th>โซน</th><th>รถ</th><th>ประจำ</th><th>ฟรีแลนซ์</th><th>ราคาลูกค้า</th></tr>";
    var body = "";
    window.OKASTO_DISPATCH_CORE.ZONES.forEach(function (z) {
      window.OKASTO_DISPATCH_CORE.VEHICLES.forEach(function (v) {
        body += "<tr><td>" + esc(pair(ZONE, z)[0]) + "</td><td>" + esc(pair(VEH, v)[0]) + "</td><td>" + baht(state.rates.regular[v][z]) + "</td><td>" + baht(state.rates.freelance[v][z]) + "</td><td>" + baht(state.customerRates[v][z]) + "</td></tr>";
      });
    });
    return '<p class="d-warn">เรทคนละชุดระหว่างประจำกับฟรีแลนซ์ ราคาลูกค้าอยู่เฉพาะตารางนี้และโต๊ะแอดมิน แอปคนขับใช้คอลัมน์ค่าตอบแทนเท่านั้น ตัวเลขทั้งหมดเป็นตัวอย่าง</p><div class="d-table-wrap"><table class="d-table"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }
  function audit(state) {
    var items = (state.audit || []).slice(0, 8).map(function (a) {
      var t = a.at ? fmtWhen(a.at).th : "";
      return "<li><time>" + esc(t) + "</time>" + esc(a.th) + "</li>";
    }).join("");
    return '<section class="d-audit"><h2>' + bi("ความเคลื่อนไหวล่าสุด", "Recent activity") + "</h2><ul>" + items + "</ul></section>";
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }
  function onClick(e) {
    if (e.target.classList && e.target.classList.contains("d-sheet-back")) {
      ui.jobId = null;
      ui.driverId = null;
      ui.confirm = "";
      render();
      return;
    }
    var t = e.target.closest("[data-act]");
    if (!t || !app || (!app.contains(t) && !t.closest(".d-sheet-back"))) return;
    var act = t.getAttribute("data-act");
    var id = t.getAttribute("data-id") || "";
    if (act === "enter") { location.href = "driver.html?as=" + encodeURIComponent(id) + "&login=1#/board"; return; }
    if (act === "enter-select") {
      var sel = document.getElementById("anyDriver");
      if (sel) location.href = "driver.html?as=" + encodeURIComponent(sel.value) + "&login=1#/board";
      return;
    }
    if (act === "reset") { API.reset(); ui.jobId = null; ui.driverId = null; toast("รีเซ็ตข้อมูลตัวอย่างแล้ว", "Example data reset"); render(); return; }
    if (act === "line-login") {
      var who = sessionStorage.getItem(WHO);
      var pick = document.getElementById("pickWho");
      if (pick) who = pick.value;
      if (!who) { toast("เลือกบัญชีตัวอย่างก่อน", "Choose an example account"); return; }
      sessionStorage.setItem(WHO, who);
      sessionStorage.setItem(AUTH, who);
      if (!location.hash || location.hash === "#/" || location.hash === "#/login") location.hash = "#/board";
      toast("เข้าสู่ระบบจำลองแล้ว", "Mock sign-in complete");
      render();
      return;
    }
    if (act === "tab") { go("#/" + id); return; }
    if (act === "board-filter") { ui.board = id; render(); return; }
    if (act === "open") { go("#/job/" + encodeURIComponent(id)); return; }
    if (act === "open-note") { if (id) go("#/job/" + encodeURIComponent(id)); return; }
    if (act === "accept") {
      var whoId = sessionStorage.getItem(WHO);
      var res = API.accept(id, whoId);
      if (flash(res, "รับงานแล้ว งานถูกล็อก", "Accepted. The job is locked.")) go("#/mine");
      else render();
      return;
    }
    if (act === "advance") {
      var step = API.advance(id, sessionStorage.getItem(WHO));
      var label = { enroute: "กำลังไป", arrived: "ถึงจุดรับแล้ว", picked: "รับลูกค้าแล้ว", done: "ส่งเสร็จ" }[step && step.status] || "อัปเดตแล้ว";
      flash(step, label, "Status updated");
      render();
      return;
    }
    if (act === "driver-cancel") {
      var c = API.driverCancel(id, sessionStorage.getItem(WHO));
      if (c && c.suspended) {
        flash(c, "ยกเลิกแล้ว และบัญชีถูกระงับ", "Cancelled, and the account was suspended");
        go("#/board");
      } else {
        flash(c, "ยกเลิกงานแล้ว งานกลับเข้าคิว", "Cancelled. The job is back in the pool.");
        render();
      }
      return;
    }
    if (act === "admin-tab") {
      ui.jobId = null; ui.driverId = null;
      go(id === "drivers" ? "#/drivers" : "#/" + id);
      return;
    }
    if (act === "people") { ui.people = id; ui.driverId = null; go("#/drivers" + (id === "all" ? "" : "/" + id)); return; }
    if (act === "open-job") { ui.jobId = id; ui.driverId = null; ui.confirm = ""; render(); return; }
    if (act === "open-driver") { ui.driverId = id; ui.jobId = null; render(); return; }
    if (act === "close-sheet") { ui.jobId = null; ui.driverId = null; ui.confirm = ""; render(); return; }
    if (act === "release") { flash(API.release(id), "ปล่อยให้ทีมประจำ 30 นาที", "Released to the regular team"); render(); return; }
    if (act === "open-all") { flash(API.openAll(id), "เปิดให้ทุกคนแล้ว", "Open to everyone"); render(); return; }
    if (act === "end-window") { flash(API.forceWindowEnd(id), "หมดเวลารอบทีมประจำ เปิดให้ฟรีแลนซ์แล้ว", "Window ended. Open to freelancers."); render(); return; }
    if (act === "cancel-ask") { ui.confirm = "cancel:" + id; render(); return; }
    if (act === "cancel-yes") { flash(API.adminCancel(id), "ยกเลิกงานแล้ว", "Job cancelled"); ui.confirm = ""; render(); return; }
    if (act === "approve") { flash(API.approve(id), "อนุมัติแล้ว คนขับเห็นงานที่ตรงกัน", "Approved. Matching jobs are visible."); render(); return; }
    if (act === "suspend") { flash(API.suspend(id), "ระงับการรับงานใหม่แล้ว", "Suspended"); render(); return; }
    if (act === "reinstate") { flash(API.reinstate(id), "เปิดใช้บัญชีแล้ว", "Reinstated"); render(); return; }
    if (act === "signup-again") { sessionStorage.removeItem("okasto.dispatch.signup"); uploads = {}; render(); }
  }
  function onSubmit(e) {
    var form = e.target;
    if (!form || !form.getAttribute || !form.getAttribute("data-form")) return;
    e.preventDefault();
    var kind = form.getAttribute("data-form");
    var id = form.getAttribute("data-id");
    if (kind === "assign") {
      var driverId = form.driver.value;
      var job = API.get().jobs.filter(function (j) { return j.id === id; })[0];
      var res = job && job.assigneeId ? API.reassign(id, driverId) : API.assign(id, driverId);
      flash(res, "อัปเดตคนขับแล้ว", "Driver updated");
      render();
      return;
    }
    if (kind === "bonus") {
      flash(API.addBonus(id, form.amount.value), "เพิ่มโบนัสแล้ว", "Bonus added");
      render();
      return;
    }
    if (kind === "signup") {
      var data = {
        firstTh: form.firstTh.value, lastTh: form.lastTh.value, firstEn: form.firstEn.value || form.firstTh.value,
        lastEn: "Example", phone: form.phone.value, lineName: form.lineName.value,
        zone: form.zone.value, vehicle: form.vehicle.value, plate: form.plate.value,
        docs: {
          license: uploads.license, registration: uploads.registration, carPhoto: uploads.carPhoto
        }
      };
      var made = API.signup(data);
      if (!flash(made, "ส่งคำขอแล้ว รออนุมัติ", "Submitted. Waiting for approval")) { render(); return; }
      sessionStorage.setItem("okasto.dispatch.signup", made.id);
      sessionStorage.setItem(WHO, made.id);
      render();
    }
  }
  function onChange(e) {
    var t = e.target;
    if (!t || !t.id && !t.getAttribute("data-file")) {
      if (t && t.getAttribute && t.getAttribute("data-file")) return;
    }
    if (t.id === "qJobs") { ui.q = t.value; render(); }
    else if (t.id === "fZone") { ui.zone = t.value; render(); }
    else if (t.id === "fVeh") { ui.vehicle = t.value; render(); }
    else if (t.id === "fTier") { ui.tier = t.value; render(); }
    else if (t.id === "qPeople") { ui.pq = t.value; render(); }
    else if (t.id === "payMonth" || t.id === "earnMonth") { ui.month = t.value; render(); }
    else if (t.getAttribute && t.getAttribute("data-file")) readFile(t);
  }
  function showUpload(input, file) {
    var label = input && input.closest ? input.closest("label") : null;
    if (!label) return;
    var img = label.querySelector("img");
    if (file.preview) {
      if (!img) { img = document.createElement("img"); img.alt = ""; label.appendChild(img); }
      img.src = file.preview;
    }
    var note = label.querySelector("small");
    if (!note) { note = document.createElement("small"); label.appendChild(note); }
    note.textContent = "แนบแล้ว: " + file.name;
  }
  function readFile(input) {
    var key = input.getAttribute("data-file");
    var file = input.files && input.files[0];
    if (!file) return;
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      var max = 480;
      var scale = Math.min(1, max / Math.max(img.width, img.height));
      var w = Math.max(1, Math.round(img.width * scale));
      var h = Math.max(1, Math.round(img.height * scale));
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      uploads[key] = { ok: true, name: file.name, preview: canvas.toDataURL("image/jpeg", 0.72) };
      showUpload(input, uploads[key]);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      uploads[key] = { ok: true, name: file.name, preview: null };
      showUpload(input, uploads[key]);
    };
    img.src = url;
  }

  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);
  document.addEventListener("change", onChange);
  document.addEventListener("input", function (e) {
    if (e.target && (e.target.id === "qJobs" || e.target.id === "qPeople")) onChange(e);
  });
  window.addEventListener("hashchange", render);
  window.addEventListener("storage", function (e) {
    if (API && e.key === window.OKASTO_DISPATCH_CORE.KEY) render();
  });

  function boot(catalog) {
    API = window.OKASTO_DISPATCH_CORE.create(localStorage, catalog);
    var q = new URLSearchParams(location.search);
    if (VIEW === "driver") {
      if (q.get("as")) sessionStorage.setItem(WHO, q.get("as"));
      if (q.get("login") === "1") sessionStorage.removeItem(AUTH);
    }
    API.get();
    render();
    setInterval(function () {
      document.querySelectorAll("[data-cd]").forEach(function (el) {
        var left = countdown(el.getAttribute("data-cd"));
        var prefix = el.textContent.indexOf("เหลือ") === 0 ? "เหลือ " : "";
        var text = prefix ? "เหลือ " + left : left;
        if (el.textContent !== text) el.textContent = text;
      });
      if (!API) return;
      var before = localStorage.getItem(window.OKASTO_DISPATCH_CORE.KEY);
      API.get();
      var after = localStorage.getItem(window.OKASTO_DISPATCH_CORE.KEY);
      if (before && after && before !== after) render();
    }, 1000);
  }
  function loadCatalog(cb) {
    var fb = window.OKASTO_DISPATCH;
    if (location.protocol === "file:") { cb(fb); return; }
    var tag = document.querySelector("script[src*='dispatch-data.js']");
    var prefix = tag ? tag.getAttribute("src").replace(/js\/dispatch-data\.js.*$/, "") : "../";
    fetch(prefix + "data/dispatch.json", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("missing");
      return r.json();
    }).then(function (json) {
      if (!json || !json.example) throw new Error("shape");
      cb(json);
    }).catch(function () { cb(fb); });
  }
  loadCatalog(boot);
})();
