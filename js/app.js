/* OKASTO Private Transfer — front-end logic. No booking webhooks, no server-side code. Outside calls: the optional place-search lookup,
   and — only if payment.enabled + payment.checkoutApiEndpoint are set in config.js — one POST of the booking to YOUR payment endpoint. */
(function () {
  "use strict";
  var C = window.OKASTO_CONFIG, I = window.OKASTO_I18N;
  var P = window.OKASTO_PRICES;   // price data (data/prices.json; fallback js/prices-data.js)
  var LANGS = ["th", "en", "zh"];
  var lang = C.defaultLang;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function t(key, vars) {
    var s = (I[lang] && I[lang][key]) || I.en[key] || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function money(n) { return C.currencySymbol + Math.round(n).toLocaleString("en-US"); }
  function vehicle(id) { return P.vehicles.filter(function (v) { return v.id === id; })[0]; }
  var VIDX = {}, LOC = {};
  function indexData() {
    VIDX = {}; LOC = {};
    P.vehicles.forEach(function (v, i) { VIDX[v.id] = i; });
    P.locations.forEach(function (l) { LOC[l.id] = l; });
    // any destination/origin without a location entry still works (shown by its id)
    Object.keys(P.rates).forEach(function (o) {
      [o].concat(Object.keys(P.rates[o])).forEach(function (id) { if (!LOC[id]) LOC[id] = { id: id, type: "other", name: { en: id } }; });
    });
  }
  function loc(id) { var l = LOC[id], n = l && l.name; return (n && (n[lang] || n.en)) || id; }
  function area(id) { return (LOC[id] && LOC[id].area) || id; }

  /* ---------- Pricing: net rate -> displayed price ---------- */
  // displayed = round(rate * (1 + markupPercent/100)) to the nearest roundTo
  function displayPrice(rate) {
    if (rate == null) return null;
    var k = Number(P.roundTo) || 1, m = 1 + (Number(P.markupPercent) || 0) / 100;
    var raw = Math.round(rate * m * 100) / 100;           // avoid float noise (e.g. 1050*1.1)
    return Math.round(raw / k) * k;
  }

  /* ---------- Route list: explicit rate card + auto reverse ---------- */
  var ROUTES = [], RMAP = {};
  function buildRoutes() {
    ROUTES = []; RMAP = {};
    var explicit = [];
    Object.keys(P.rates).forEach(function (from) {
      Object.keys(P.rates[from]).forEach(function (to) {
        explicit.push({ from: from, to: to, prices: P.rates[from][to], reverse: false });
      });
    });
    explicit.forEach(function (r) { RMAP[r.from + "|" + r.to] = r; ROUTES.push(r); });
    if (!P.autoReverse) return;
    // Is there an explicit rate-card route from area(a) to area(b)?
    function listed(a, b) {
      return explicit.some(function (r) { return area(r.from) === area(a) && area(r.to) === area(b); });
    }
    explicit.forEach(function (r) {
      var nf = (LOC[r.to] && LOC[r.to].reverseAs) || r.to, nt = r.from;
      if (area(nf) === area(nt)) return;                    // e.g. Bangkok -> Bangkok
      if (listed(nf, nt)) return;                           // direction already in the rate card
      var key = nf + "|" + nt; if (RMAP[key]) return;       // de-duplicate (Pattaya N/C/S -> UTP)
      var rr = { from: nf, to: nt, prices: r.prices, reverse: true, of: r };
      RMAP[key] = rr; ROUTES.push(rr);
    });
  }
  function findRoute(a, b) { return RMAP[a + "|" + b] || null; }
  function rate(route, vid) { return route ? route.prices[VIDX[vid]] : null; }
  function offered(route, vid) { return rate(route, vid) != null; }
  function origins() {
    var seen = {}, out = [];
    ROUTES.forEach(function (r) { if (!seen[r.from]) { seen[r.from] = 1; out.push(r.from); } });
    return out;
  }
  function destinations(from) { return ROUTES.filter(function (r) { return r.from === from; }); }

  // cheapest vehicle offered on this route that fits the passengers
  function suggestVehicle(route, pax) {
    var fits = P.vehicles.filter(function (v) { return v.pax >= pax && (!route || offered(route, v.id)); });
    if (route) fits.sort(function (a, b) { return rate(route, a.id) - rate(route, b.id); });
    return fits[0] || null;
  }

  /* ---------- Vehicle illustrations (original inline SVG) ---------- */
  window.OKASTO_CAR_SVG = function (id) { return carSVG(id); };
  function carSVG(id) {
    var wheels = function (x1, x2, y) {
      return '<g><circle cx="' + x1 + '" cy="' + y + '" r="15" fill="#04306D"/><circle cx="' + x1 + '" cy="' + y + '" r="6" fill="#dcecff"/>' +
        '<circle cx="' + x2 + '" cy="' + y + '" r="15" fill="#04306D"/><circle cx="' + x2 + '" cy="' + y + '" r="6" fill="#dcecff"/></g>';
    };
    var shadow = '<ellipse cx="120" cy="118" rx="100" ry="6" fill="#04306D" opacity=".08"/>';
    var body;
    if (id === "economy" || id === "premium" || id === "sedan") body =
      '<path d="M22 98c0-12 6-18 18-20l30-4 26-20c6-4 12-6 20-6h40c8 0 14 2 20 8l20 18 26 4c10 2 16 8 16 20v6H22z" fill="#3AA0EE"/>' +
      '<path d="M84 74l18-15c4-3 8-4 13-4h18v19zM141 55h12c6 0 10 2 14 6l13 13h-39z" fill="#eaf5ff"/>' +
      '<rect x="22" y="94" width="196" height="8" rx="4" fill="#0B5CC4"/>' + wheels(64, 178, 104);
    else if (id === "suv" || id === "ev") body =
      '<path d="M20 100V76c0-6 4-10 10-11l34-4 22-20c4-3 9-5 15-5h60c7 0 12 3 16 8l16 18 18 3c7 1 11 6 11 13v22z" fill="#0B5CC4"/>' +
      '<path d="M78 62l16-15c3-3 6-4 10-4h22v19zM134 43h22c4 0 7 1 10 4l13 15h-45z" fill="#eaf5ff"/>' +
      '<rect x="90" y="30" width="72" height="5" rx="2.5" fill="#04306D"/>' +
      '<rect x="20" y="92" width="202" height="9" rx="4" fill="#0757b8"/>' + wheels(64, 180, 104);
    else if (id === "van") body =
      '<path d="M18 100V52c0-10 6-16 16-16h132c8 0 14 3 18 9l26 30c6 6 8 12 8 20v5z" fill="#3AA0EE"/>' +
      '<path d="M32 46h30v24H32zM70 46h30v24H70zM108 46h30v24h-30zM146 46h22c4 0 7 2 9 4l18 20h-49z" fill="#eaf5ff"/>' +
      '<rect x="18" y="80" width="200" height="6" fill="#0B5CC4"/>' + wheels(60, 178, 104);
    else body =
      '<path d="M18 100V56c0-12 8-20 20-20h126c10 0 16 4 22 10l24 28c6 6 8 12 8 20v6z" fill="#04306D"/>' +
      '<path d="M32 46h40v24H32zM80 46h40v24H80zM128 46h32c5 0 9 2 12 5l16 19h-60z" fill="#5fb6ff" opacity=".85"/>' +
      '<rect x="18" y="80" width="200" height="4" fill="#3AA0EE"/>' +
      '<path d="M200 66l6 6" stroke="#dcecff" stroke-width="3" stroke-linecap="round"/>' + wheels(60, 178, 104) +
      '<text x="36" y="96" font-family="Arial" font-weight="700" font-size="10" fill="#9fd0ff" letter-spacing="2">VIP</text>';
    if (id === "premium") body = body.replace('fill="#3AA0EE"', 'fill="#13315c"').replace('fill="#0B5CC4"/>', 'fill="#3AA0EE"/>');
    if (id === "ev") body = body.replace('fill="#0B5CC4"', 'fill="#3AA0EE"') +
      '<circle cx="122" cy="80" r="11" fill="#fff"/><path d="M124 71l-7 10h5l-2 8 7-10h-5z" fill="#0B5CC4"/>';
    return '<svg viewBox="0 0 240 125" role="img" aria-hidden="true">' + shadow + body + '</svg>';
  }

  /* ---------- Build UI parts ---------- */
  var sel = { pickup: $("#pickup"), dropoff: $("#dropoff") };
  var state = { vehicle: "economy", manualVehicle: false, tab: "BKK" };
  var TYPES = ["airport", "bangkok", "pattaya", "huahin", "phuket", "other"];

  function optGroups(ids, labelFn) {
    var html = "";
    TYPES.forEach(function (type) {
      var list = ids.filter(function (x) { var L = LOC[x.to || x.id || x]; return !!L && L.type === type; });
      if (!list.length) return;
      html += '<optgroup label="' + t("grp_" + type) + '">';
      list.forEach(function (x) { html += labelFn(x); });
      html += "</optgroup>";
    });
    return html;
  }
  function buildPickup() {
    var cur = sel.pickup.value;
    sel.pickup.innerHTML = '<option value="">' + t("bk_select") + "</option>" +
      optGroups(origins(), function (id) { return '<option value="' + id + '">' + loc(id) + "</option>"; });
    sel.pickup.value = cur;
  }
  function buildDropoff() {
    var cur = sel.dropoff.value, from = sel.pickup.value;
    var html = '<option value="">' + (from ? t("bk_select") : t("bk_select_origin_first")) + "</option>";
    if (from) html += optGroups(destinations(from), function (r) {
      return '<option value="' + r.to + '">' + loc(r.to) + (r.reverse ? " " + t("rev_tag") : "") + "</option>";
    });
    sel.dropoff.innerHTML = html;
    sel.dropoff.disabled = !from;
    sel.dropoff.value = from && findRoute(from, cur) ? cur : "";
  }
  function buildSelects() { buildPickup(); buildDropoff(); }

  function buildVehicles() {
    var box = $("#vehiclePick"), html = "";
    P.vehicles.forEach(function (v) {
      html += '<label class="veh-opt" data-v="' + v.id + '"><input type="radio" name="vehicle" value="' + v.id + '">' +
        '<span class="v-name">' + t("veh_" + v.id) + "</span>" +
        '<span class="v-meta"><span><svg class="ico"><use href="#i-user"/></svg>' + v.paxLabel + '</span><span><svg class="ico"><use href="#i-bag"/></svg>' + v.bags + "</span></span>" +
        '<span class="v-price" data-vprice="' + v.id + '"></span></label>';
    });
    box.innerHTML = html;
    var r = box.querySelector('input[value="' + state.vehicle + '"]'); if (r) r.checked = true;
  }

  function priceCell(p) {
    return p == null ? '<td class="p na" title="' + t("na") + '">' + t("na_short") + "</td>" : '<td class="p">' + money(displayPrice(p)) + "</td>";
  }
  function buildTabs() {
    var html = "";
    Object.keys(P.rates).forEach(function (o) {
      html += '<button type="button" role="tab" class="rt-tab' + (o === state.tab ? " active" : "") + '" data-tab="' + o + '" aria-selected="' + (o === state.tab) + '">' + loc(o) + "</button>";
    });
    $("#routeTabs").innerHTML = html;
  }
  function buildTable() {
    if (!P.rates[state.tab]) state.tab = Object.keys(P.rates)[0];
    var o = state.tab;
    buildTabs();
    $("#tableZoneNote").hidden = !Object.keys(P.rates[o]).concat([o]).some(function (id) { return id === "BKKZ1" || id === "BKKZ2"; });
    var head = "<thead><tr><th>" + t("th_dest") + "</th>";
    P.vehicles.forEach(function (v) { head += "<th>" + t("veh_" + v.id) + "<small>" + v.paxLabel + " " + t("unit_pax") + "</small></th>"; });
    head += "<th></th></tr></thead>";
    var body = '<tbody><tr><td class="r-region" colspan="' + (P.vehicles.length + 2) + '">' + t("from_label") + " " + loc(o) + "</td></tr>";
    Object.keys(P.rates[o]).forEach(function (to) {
      var p = P.rates[o][to];
      body += '<tr><td class="r-name">' + loc(to) + "</td>";
      p.forEach(function (x) { body += priceCell(x); });
      body += '<td><button type="button" class="book-link" data-from="' + o + '" data-to="' + to + '">' + t("bk_pay") + "</button></td></tr>";
    });
    $("#priceTable").innerHTML = head + body + "</tbody>";
  }

  function buildCharter() {
    var ch = P.charter || [];
    var cols = P.vehicles.map(function (v, i) { return i; }).filter(function (i) { return ch.some(function (c) { return c.perHour[i] != null; }); });
    var head = "<thead><tr><th>" + t("ch_th") + "</th>";
    cols.forEach(function (i) { var v = P.vehicles[i]; head += "<th>" + t("veh_" + v.id) + "<small>" + v.paxLabel + " " + t("unit_pax") + "</small></th>"; });
    head += "</tr></thead><tbody>";
    ch.forEach(function (c) {
      head += '<tr><td class="r-name">' + t("ch_" + c.id) + "<small>" + t(c.fuelIncluded ? "ch_fuel_in" : "ch_fuel_out") + "</small></td>";
      cols.forEach(function (i) { var p = c.perHour[i]; head += p == null ? '<td class="p na">' + t("na_short") + "</td>" : '<td class="p">' + money(displayPrice(p)) + "<small class=\"per\">/" + t("unit_hr") + "</small></td>"; });
      head += "</tr><tr class=\"min-row\"><td>" + t("ch_min") + "</td>";
      cols.forEach(function () { head += "<td>" + t("ch_hours", { n: c.minHours }) + "</td>"; });
      head += "</tr>";
    });
    $("#charterTable").innerHTML = head + "</tbody>";
  }

  function buildFleet() {
    var html = "";
    P.vehicles.forEach(function (v) {
      var prices = ROUTES.map(function (r) { return rate(r, v.id); }).filter(function (p) { return p != null; });
      var min = prices.length ? Math.min.apply(null, prices) : null;
      html += '<article class="fleet-card">' + '<div class="fleet-photo"><img src="img/photos/fleet-' + v.id + '.jpg" width="600" height="320" loading="lazy" decoding="async" alt="' + esc(t("veh_" + v.id) + " – " + t("vm_" + v.id)) + '" onerror="this.parentNode.className=\'fleet-art\';this.parentNode.innerHTML=window.OKASTO_CAR_SVG(\'' + v.id + '\')"></div>' + '<div class="fleet-body">' +
        "<h3>" + t("veh_" + v.id) + "</h3><p class=\"models\">" + t("vm_" + v.id) + "</p><p>" + t("vd_" + v.id) + "</p>" +
        '<div class="fleet-specs"><span><svg class="ico"><use href="#i-user"/></svg>' + v.paxLabel + " " + t("unit_pax") + '</span><span><svg class="ico"><use href="#i-bag"/></svg>' + t("unit_luggage", { bags: v.bags }) + "</span></div>" +
        (min != null ? '<div class="fleet-price">' + t("fleet_from") + " <strong>" + money(displayPrice(min)) + "</strong></div>" : "") +
        '<button type="button" class="btn btn-primary btn-sm fleet-book" data-v="' + v.id + '"><svg class="ico"><use href="#i-card"/></svg>' + t("fleet_book") + "</button>" +
        "</div></article>";
    });
    $("#fleetGrid").innerHTML = html;
  }

  function fillContacts() {
    var c = C.contact;
    $$(".js-line-link").forEach(function (a) { a.href = c.lineUrl; });
    $$(".js-line-id").forEach(function (e) { e.textContent = "LINE " + c.lineId + (c.lineIsPlaceholder ? " " + t("placeholder_tag") : ""); });
    $$(".js-wa-link").forEach(function (a) { a.href = "https://wa.me/" + c.whatsappNumber; });
    $$(".js-wa-display").forEach(function (e) { e.textContent = c.whatsappDisplay + (c.whatsappIsPlaceholder ? " " + t("placeholder_tag") : ""); });
    $$(".js-tel-link").forEach(function (a) { a.href = "tel:" + c.phoneTel; });
    $$(".js-mail-link").forEach(function (a) { a.href = "mailto:" + c.email; });
    $$(".js-phone").forEach(function (e) { e.textContent = c.phoneDisplay; });
    $$(".js-email").forEach(function (e) { e.textContent = c.email; });
    $$(".js-address").forEach(function (e) { e.textContent = c.address; });
    $$(".js-company").forEach(function (e) { e.textContent = c.company; });
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Language ---------- */
  function applyLang(l) {
    if (LANGS.indexOf(l) < 0) l = "en";
    lang = l;
    document.documentElement.lang = l === "zh" ? "zh-Hans" : l;
    document.title = t("meta_title");
    $$("[data-i18n]").forEach(function (el) {
      var key = (!payLive() && el.getAttribute("data-i18n-soon")) || el.getAttribute("data-i18n");
      el.textContent = t(key, { seat: money(P.extraBabySeat) });
    });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    $$("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.getAttribute("data-i18n-alt")); });
    $$("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    $$(".lang-switch button").forEach(function (b) {
      var on = b.getAttribute("data-lang") === l;
      b.classList.toggle("active", on); b.setAttribute("aria-pressed", on);
    });
    fillContacts(); buildSelects(); buildVehicles(); buildTable(); buildCharter(); buildFleet();
    relabelPlaces(); setMode(search.mode); update();
    if (booking && !$("#payModal").hidden) fillCheckout();
    try { localStorage.setItem("okasto_lang", l); } catch (e) {}
  }
  function initialLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem("okasto_lang"); if (LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var nav = (navigator.language || "").toLowerCase();
    if (nav.indexOf("th") === 0) return "th";
    if (nav.indexOf("zh") === 0) return "zh";
    return C.defaultLang;
  }

  /* ---------- Price calculation ---------- */
  function num(id, min) { var n = parseInt($("#" + id).value, 10); return isNaN(n) ? min : Math.max(min, n); }

  function calc() {
    var a = sel.pickup.value, b = sel.dropoff.value, v = vehicle(state.vehicle);
    var route = a && b ? findRoute(a, b) : null;
    var r = rate(route, v.id);
    return { route: route, vehicle: v, rate: r, price: displayPrice(r), offered: route ? r != null : null };
  }

  function update() {
    var pax = num("pax", 1), bags = num("luggage", 0);
    var a = sel.pickup.value, b = sel.dropoff.value;
    var route = a && b ? findRoute(a, b) : null;
    var v = vehicle(state.vehicle), sug = suggestVehicle(route, pax);
    var ok = function (x) { return x.pax >= pax && (!route || offered(route, x.id)); };
    // auto-switch if the chosen vehicle is not offered on the route, or (unless picked by hand) too small
    if (sug && (!(!route || offered(route, v.id)) || (!state.manualVehicle && !ok(v)))) {
      state.vehicle = sug.id; v = sug;
      var rb = $('input[name="vehicle"][value="' + sug.id + '"]'); if (rb) rb.checked = true;
    }
    var res = calc();

    $$(".veh-opt").forEach(function (o) {
      var vv = vehicle(o.getAttribute("data-v")), off = !route || offered(route, vv.id);
      o.classList.toggle("selected", vv.id === state.vehicle);
      o.classList.toggle("unavailable", !off);
      o.classList.toggle("too-small", off && vv.pax < pax);
      o.querySelector("input").disabled = !off;
      o.querySelector(".v-price").textContent = route ? (off ? money(displayPrice(rate(route, vv.id))) : t("na")) : "";
    });

    var pv = $("#priceValue"), meta = $("#priceMeta"), warn = $("#priceWarn");
    var sm = search.mode === "search";
    $("#lineLabel").textContent = t(sm && search.quote ? "quote_line" : "bk_submit_line");
    $("#waLabel").textContent = t(sm && search.quote ? "quote_wa" : "bk_submit_wa");
    $("#priceBox").classList.toggle("is-quote", sm && search.quote);
    if (sm && search.quote) {
      pv.textContent = t("quote_title"); pv.classList.add("quote");
      meta.textContent = t("quote_meta", { from: search.pickup.label, to: search.dropoff.label });
    } else if (sm && !route && !(search.pickup && search.dropoff)) {
      pv.textContent = "—"; pv.classList.remove("quote"); meta.textContent = t("bk_need_places");
    } else if (route && res.price != null) {
      pv.textContent = money(res.price); pv.classList.remove("quote");
      meta.textContent = route.reverse ? t("bk_reverse_meta", { from: loc(route.of.from), to: loc(route.of.to) }) : t("bk_meta");
    } else if (route) {
      pv.textContent = t("na"); pv.classList.add("quote"); meta.textContent = "";
    } else {
      pv.textContent = "—"; pv.classList.remove("quote"); meta.textContent = t("bk_no_route");
    }
    var zh = $("#zoneHelp"); if (zh) zh.hidden = !(a === "BKKZ1" || a === "BKKZ2" || b === "BKKZ1" || b === "BKKZ2");
    var warns = [];
    if (v.pax < pax) warns.push(t("bk_capacity_warn", { vehicle: t("veh_" + v.id), pax: v.paxLabel, suggest: sug ? t("veh_" + sug.id) : t("bk_two_cars") }));
    if (bags > v.bags) warns.push(t("bk_luggage_warn", { bags: v.bags }));
    warn.hidden = !warns.length; warn.textContent = warns.join(" ");
  }

  /* ---------- Booking message ---------- */
  function validate(forPay) {
    var miss = [], err = $("#formError");
    $$(".invalid").forEach(function (e) { e.classList.remove("invalid"); });
    var sm = search.mode === "search";
    if (sm) ["pickup", "dropoff"].forEach(function (end) { combos[end].commit(); });
    [[sm ? "pickupSearch" : "pickup", "bk_pickup"], [sm ? "dropoffSearch" : "dropoff", "bk_dropoff"], ["date", "bk_date"], ["time", "bk_time"]].forEach(function (f) {
      var el = $("#" + f[0]); if (!String(el.value).trim()) { miss.push(t(f[1])); el.classList.add("invalid"); }
    });
    if (forPay) [["name", "bk_name"], ["phone", "bk_phone"], ["email", "bk_email"]].forEach(function (f) {
      var el = $("#" + f[0]); if (!el.value.trim()) { miss.push(t(f[1])); el.classList.add("invalid"); }
    });
    if (forPay && miss.length) $("#moreDetails").open = true;
    if (miss.length) { err.textContent = t("bk_err_required", { fields: miss.join(", ") }); err.hidden = false; return false; }
    var em = $("#email").value.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { $("#email").classList.add("invalid"); $("#moreDetails").open = true; err.textContent = t("bk_err_email"); err.hidden = false; return false; }
    err.hidden = true; return true;
  }

  // kind: "ask" (inquiry, default) or "book" (Book & Pay fallback while online payment is off); ref = booking reference
  function buildMessage(kind, ref) {
    var book = kind === "book";
    var r = calc(), v = r.vehicle, lines = [book ? t("msg_book_header", { ref: ref }) : t("msg_header"), ""];
    if (book) lines.push("• " + t("msg_ref") + ": " + ref);
    if (search.mode === "search") {
      [["pickup", "msg_pickup"], ["dropoff", "msg_dropoff"]].forEach(function (f) {
        var pl = search[f[0]]; if (!pl) return;
        var zl = pl.zone ? loc(pl.zone) : t("msg_zone_out");
        lines.push("• " + t(f[1]) + ": " + pl.label + (pl.sub ? ", " + pl.sub : "") + (zl === pl.label ? "" : " [" + zl + "]"));
      });
      if (r.route) lines.push("• " + t("msg_priced_as") + ": " + loc(sel.pickup.value) + " → " + loc(sel.dropoff.value) + (r.route.reverse ? " " + t("rev_tag") : ""));
    } else {
      lines.push("• " + t("msg_route") + ": " + loc(sel.pickup.value) + " → " + loc(sel.dropoff.value) + (r.route && r.route.reverse ? " " + t("rev_tag") : ""));
    }
    lines.push("• " + t("msg_date") + ": " + $("#date").value + " " + $("#time").value);
    lines.push("• " + t("msg_pax") + ": " + num("pax", 1));
    lines.push("• " + t("msg_bags") + ": " + num("luggage", 0));
    lines.push("• " + t("msg_vehicle") + ": " + t("veh_" + v.id));
    [["flight", "msg_flight"], ["name", "msg_name"], ["phone", "msg_phone"], ["email", "msg_email"], ["notes", "msg_notes"]].forEach(function (f) {
      var val = $("#" + f[0]).value.trim(); if (val) lines.push("• " + t(f[1]) + ": " + val);
    });
    lines.push("• " + t("msg_price") + ": " + (r.route && r.price != null ? money(r.price) + " THB" : t("msg_quote")));
    var bm = book && booking && methodById(booking.method);
    if (bm) lines.push("• " + t("co_method") + ": " + mText(bm.label));
    if (book && booking && booking.policyAccepted) lines.push("• " + t("msg_policy"));
    lines.push("", t(book ? (bm ? "msg_book_footer" : "msg_book_footer_quote") : "msg_footer"));
    return lines.join("\n");
  }

  function toast(msg) {
    var el = $("#toast"); el.textContent = msg; el.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { el.hidden = true; }, 4000);
  }

  function openChannel(channel, kind, ref) {
    if (kind !== "book" && !validate()) return;
    var msg = buildMessage(kind, ref), url;
    if (channel === "wa") url = "https://wa.me/" + C.contact.whatsappNumber + "?text=" + encodeURIComponent(msg);
    else url = C.contact.lineMessageUrl.replace("{id}", C.contact.lineId).replace("{text}", encodeURIComponent(msg));
    // Copy as a fallback (LINE desktop sometimes ignores prefilled text)
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(msg).then(function () { toast(t("copied")); }, function () {});
    window.__okastoLastBooking = { channel: channel, kind: kind || "ask", url: url, message: msg }; // for testing/debug only
    window.open(url, "_blank", "noopener");
  }

  /* ---------- Book & Pay (Beam — see config.js "payment" and README) ---------- */
  // No secret keys here: the browser only ever sees a payment URL returned by YOUR server (or a fixed link).
  var PAY = C.payment || { enabled: false };
  function payLive() { return !!(PAY.enabled && (PAY.checkoutApiEndpoint || PAY.paymentLinkUrl)); }
  var booking = null, lastFocus = null;
  function newRef() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    var rnd = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "X");
    return (PAY.referencePrefix || "OK") + "-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + rnd;
  }
  function collectBooking() {
    var r = calc(), v = r.vehicle, sm = search.mode === "search";
    var place = function (end) {
      if (sm && search[end]) { var pl = search[end]; return { label: pl.label + (pl.sub ? ", " + pl.sub : ""), zone: pl.zone || null }; }
      var id = sel[end].value; return { label: id ? loc(id) : "", zone: id || null };
    };
    var priced = !!(r.route && r.price != null);
    var src = r.route ? (r.route.reverse ? r.route.of : r.route) : null;   // the rate-card row the price comes from
    return {
      reference: newRef(), lang: lang, currency: PAY.currency || "THB",
      amount: priced ? r.price : null,
      pickup: place("pickup"), dropoff: place("dropoff"),
      route: r.route ? { from: sel.pickup.value, to: sel.dropoff.value, rateFrom: src.from, rateTo: src.to, reverse: !!r.route.reverse } : null,
      date: $("#date").value, time: $("#time").value, flight: $("#flight").value.trim(),
      passengers: num("pax", 1), luggage: num("luggage", 0),
      vehicle: v.id, vehicleLabel: t("veh_" + v.id),
      name: $("#name").value.trim(), phone: $("#phone").value.trim(), email: $("#email").value.trim(), notes: $("#notes").value.trim()
    };
  }
  /* Checkout: step 1 Review & confirm -> step 2 Choose payment method -> step 3 Done.
     Online methods only (config.js payment.methods). While Beam isn't live, step 3 asks the customer to
     send the booking (with the chosen method) via LINE / WhatsApp; OKASTO replies with a Beam payment link. */
  var METHOD_ICONS = { card: "i-card", qr: "i-qr", bank: "i-bank", wallet: "i-wallet", calendar: "i-calendar" };
  function payMethods() {
    return (PAY.methods || []).filter(function (m) { return m && m.enabled && /^[a-z0-9_-]+$/i.test(m.id); });
  }
  function methodById(id) { return payMethods().filter(function (m) { return m.id === id; })[0] || null; }
  function mText(o) { return (o && (o[lang] || o.en)) || ""; }
  var coStep = 1;
  function fillCheckout() {
    var b = booking; if (!b) return;
    var rows = [
      ["msg_pickup", b.pickup.label], ["msg_dropoff", b.dropoff.label], ["msg_date", b.date + " " + b.time],
      ["msg_flight", b.flight], ["msg_pax", b.passengers], ["msg_bags", b.luggage], ["msg_vehicle", b.vehicleLabel]
    ], contact = [["msg_name", b.name], ["msg_phone", b.phone], ["msg_email", b.email], ["msg_notes", b.notes]];
    var dl = function (list) {
      return list.filter(function (x) { return String(x[1]).trim() !== ""; })
        .map(function (x) { return "<div><dt>" + esc(t(x[0])) + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("");
    };
    $("#paySummary").innerHTML = dl(rows);
    $("#payContact").innerHTML = dl(contact);
    // Order summary card
    $("#sumImg").src = "img/photos/fleet-" + b.vehicle + ".jpg";
    $("#sumImg").alt = b.vehicleLabel;
    $("#sumVehicle").textContent = b.vehicleLabel;
    $("#sumModels").textContent = t("vm_" + b.vehicle);
    $("#sumRoute").textContent = b.pickup.label + " → " + b.dropoff.label;
    $("#sumWhen").textContent = b.date + " · " + b.time + (b.flight ? " · " + b.flight : "");
    $("#sumPax").textContent = t("msg_pax") + ": " + b.passengers + " · " + t("msg_bags") + ": " + b.luggage;
    var m = methodById(b.method);
    $("#sumMethodRow").hidden = !m;
    $("#sumMethod").textContent = m ? t("co_method") + ": " + mText(m.label) : "";
    $("#payRef").textContent = t("msg_ref") + ": " + b.reference;
    $("#payTotal").textContent = b.amount != null ? money(b.amount) + " THB" : t("pay_quote");
    $("#payNet").hidden = b.amount == null;
    // Quote trips (no fixed price) skip the payment step
    var quote = b.amount == null;
    $("#payNotice").hidden = !quote;
    $("#payNoticeT").textContent = quote ? t("quote_title") : "";
    $("#payNoticeD").textContent = quote ? t("pay_quote_d") : "";
    $("#payNextLabel").textContent = t(quote ? "co_quote_next" : "co_next");
    // Step 2: methods as an accessible radio group
    var live = payLive();
    $("#payMethodsLead").textContent = t(live ? "co_pay_d_live" : "co_pay_d_soon");
    $("#payMethods").innerHTML = payMethods().map(function (pm) {
      return '<label class="co-method"><input type="radio" name="payMethod" value="' + esc(pm.id) + '"' + (b.method === pm.id ? " checked" : "") + ">" +
        '<span class="co-mico" aria-hidden="true"><svg class="ico"><use href="#' + (METHOD_ICONS[pm.icon] || "i-card") + '"/></svg></span>' +
        '<span class="co-mtext"><strong>' + esc(mText(pm.label)) + "</strong><span>" + esc(mText(pm.note)) + "</span></span>" +
        '<span class="co-radio" aria-hidden="true"></span></label>';
    }).join("");
    $("#payGoLabel").textContent = live ? t("co_pay_btn", { price: money(b.amount || 0) }) : t("co_confirm");
    $("#payGo use").setAttribute("href", live ? "#i-lock" : "#i-check");
    // Step 3
    $("#doneTitle").textContent = t(quote ? "co_done_t_quote" : "co_done_t");
    $("#doneLead").textContent = t(quote ? "co_done_d_quote" : "co_done_d");
    $("#doneRef").textContent = b.reference;
    var next = quote ? ["co_next1", "co_next2_quote", "co_next3"] : ["co_next1", "co_next2", "co_next3"];
    $("#doneNext").innerHTML = next.map(function (k) { return "<li>" + esc(t(k, { method: m ? mText(m.label) : "" })) + "</li>"; }).join("");
    // Footer: company info
    var ct = C.contact || {};
    $("#coFoot").innerHTML = esc(ct.company || "Okasto Co., Ltd.") + ", " + esc(ct.addressShort || "") +
      ' · <a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a>" +
      ' · <a href="tel:' + esc(ct.phoneTel || "") + '">' + esc(String(ct.phoneDisplay || "").replace(/\s*\(.*\)\s*$/, "")) + "</a> (" + esc(ct.supportHours || "24/7") + ")";
  }
  function showStep(n, focus) {
    coStep = n;
    [1, 2, 3].forEach(function (i) { $("#coStep" + i).hidden = i !== n; });
    $$("#coSteps li").forEach(function (li) {
      var i = +li.getAttribute("data-step");
      if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.classList.toggle("done", i < n || n === 3);
    });
    $(".co-body", $("#payModal")).scrollTop = 0;
    if (window.__okastoLastPayment) window.__okastoLastPayment.step = n;
    if (focus !== false) { var h = $("#coStep" + n + " h2"); if (h) h.focus(); }
  }
  function bookAndPay() {
    if (!validate(true)) { var bad = $(".invalid"); if (bad) bad.focus(); return; }
    booking = collectBooking();
    booking.method = null; booking.policyAccepted = false;
    $("#payAgree").checked = false;
    ["#agreeError", "#methodError", "#payError"].forEach(function (s) { $(s).hidden = true; });
    $(".co-agree").classList.remove("invalid"); $(".co-methods").classList.remove("invalid");
    $("#payGo").disabled = false;
    fillCheckout();
    var canPay = payLive() && booking.amount != null;
    window.__okastoLastPayment = { booking: booking, mode: canPay ? (PAY.checkoutApiEndpoint ? "api" : "link") : "fallback", step: 1 }; // testing/debug only
    lastFocus = document.activeElement;
    $("#payModal").hidden = false; document.body.classList.add("modal-open");
    showStep(1);
  }
  function checkoutNext() {
    if (!booking) return;
    if (!$("#payAgree").checked) {
      var e = $("#agreeError"); e.textContent = t("co_agree_err"); e.hidden = false;
      $(".co-agree").classList.add("invalid"); $("#payAgree").focus(); return;
    }
    $("#agreeError").hidden = true; $(".co-agree").classList.remove("invalid");
    booking.policyAccepted = true;
    if (booking.amount == null) { showStep(3); return; }   // quote: nothing to pay yet
    showStep(2);
  }
  function chosenMethod() { var r = $("#payMethods input[name=payMethod]:checked"); return r ? r.value : null; }
  function closePay() {
    $("#payModal").hidden = true; document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function payError() {
    var e = $("#payError"); e.textContent = t("pay_err"); e.hidden = false;
    $("#payGo").disabled = false; $("#payGoLabel").textContent = t("co_pay_btn", { price: money(booking.amount) });
  }
  function safeUrl(u) { return typeof u === "string" && /^https:\/\//i.test(u) ? u : null; }
  function goPay() {
    if (!booking) return;
    var id = chosenMethod();
    if (!id || !methodById(id)) {
      var e = $("#methodError"); e.textContent = t("co_pay_err"); e.hidden = false;
      $(".co-methods").classList.add("invalid");
      var first = $("#payMethods input"); if (first) first.focus();
      return;
    }
    $("#methodError").hidden = true; $(".co-methods").classList.remove("invalid");
    booking.method = id;
    if (window.__okastoLastPayment) window.__okastoLastPayment.method = id;
    fillCheckout();
    if (booking.amount == null || !payLive()) { showStep(3); return; }   // Beam not connected: send via LINE / WhatsApp
    var b = booking, go = $("#payGo");
    go.disabled = true; $("#payGoLabel").textContent = t("pay_redirecting");
    if (PAY.checkoutApiEndpoint) {
      var body = {}; Object.keys(b).forEach(function (k) { body[k] = b[k]; }); body.paymentMethod = id;
      fetch(PAY.checkoutApiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (d) { var u = safeUrl(d && (d.url || d.paymentUrl)); if (!u) throw new Error("No payment URL"); window.__okastoPayRedirect = u; location.assign(u); })
        .catch(function (e) { console.warn("OKASTO: payment endpoint failed", e); payError(); });
      return;
    }
    var u = safeUrl(PAY.paymentLinkUrl.replace("{amount}", encodeURIComponent(b.amount)).replace("{amount_satang}", encodeURIComponent(Math.round(b.amount * 100)))
      .replace("{reference}", encodeURIComponent(b.reference)).replace("{email}", encodeURIComponent(b.email)).replace("{method}", encodeURIComponent(id)));
    if (!u) { payError(); return; }
    window.__okastoPayRedirect = u; location.assign(u);
  }
  function trapFocus(e) {
    if (e.key !== "Tab" || $("#payModal").hidden) return;
    var f = $$("#payModal button, #payModal input, #payModal summary, #payModal a[href]").filter(function (x) { return x.offsetParent !== null && !x.disabled; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function paymentReturn() {
    var q = new URLSearchParams(location.search);
    if (q.get("payment") === "success") setTimeout(function () { toast(t("pay_done", { ref: q.get("ref") || "" })); }, 300);
  }

  function setRoute(from, to) {
    sel.pickup.value = from; buildDropoff();
    sel.dropoff.value = findRoute(from, to) ? to : "";
    update();
  }


  /* ---------- Place search (Pickup / Drop-off boxes) ---------- */
  // place = { label, sub, kind: airport|hotel|place|area|typed, zone: location id or null, lat, lon, source, names }
  var PL = window.OKASTO_PLACES, G = C.geocoder || { provider: "none" };
  var search = { mode: "search", pickup: null, dropoff: null, quote: false }, combos = {};
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function placeFromZone(id) {
    var l = LOC[id] || { name: { en: id } }, c = l.center || [];
    return { label: loc(id), names: l.name, kind: l.type === "airport" ? "airport" : "area", zone: id, lat: c[0], lon: c[1], source: "list" };
  }
  // price-list rows to try for a zone: itself, then its generic area rows (Bangkok Zone 1 -> Bangkok (all areas) ...)
  function zoneFallbacks(id) {
    if (!id) return [];
    var l = LOC[id] || {}, out = [id];
    if (l.reverseAs && out.indexOf(l.reverseAs) < 0) out.push(l.reverseAs);
    if (l.area) P.locations.forEach(function (x) { if (x.area === l.area && !x.center && out.indexOf(x.id) < 0) out.push(x.id); });
    if (l.area && out.indexOf(l.area) < 0) out.push(l.area);
    return out;
  }
  function resolvePair(a, b) {
    var A = zoneFallbacks(a), B = zoneFallbacks(b);
    for (var i = 0; i < A.length; i++) for (var j = 0; j < B.length; j++) if (A[i] !== B[j] && findRoute(A[i], B[j])) return [A[i], B[j]];
    return null;
  }
  function resolveSearch() {
    var a = search.pickup, b = search.dropoff;
    var pair = a && b && a.zone && b.zone ? resolvePair(a.zone, b.zone) : null;
    search.quote = !!(a && b && !pair);
    if (pair) setRoute(pair[0], pair[1]);
    else {
      sel.pickup.value = a && a.zone && origins().indexOf(a.zone) >= 0 ? a.zone : "";
      buildDropoff(); sel.dropoff.value = ""; update();
    }
    renderZones();
  }
  function renderZones() {
    ["pickup", "dropoff"].forEach(function (end) {
      var pl = search[end], el = $("#" + end + "Zone");
      if (!pl) { el.textContent = ""; el.className = "place-zone"; return; }
      el.textContent = pl.zone ? t("zone_in", { zone: loc(pl.zone) }) : t(pl.source === "typed" ? "zone_unknown" : "zone_out");
      el.className = "place-zone " + (pl.zone ? "ok" : "out");
    });
  }
  function relabelPlaces() {
    ["pickup", "dropoff"].forEach(function (end) {
      var pl = search[end]; if (!pl || !pl.names) return;
      pl.label = pl.names[lang] || pl.names.en; $("#" + end + "Search").value = pl.label;
    });
    renderZones();
    var p = PL.provider(G), at = $("#geoAttr");
    at.innerHTML = p === "photon" ? '<a href="https://photon.komoot.io" target="_blank" rel="noopener">' + esc(t("attr_photon")).replace("OpenStreetMap", '</a><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap') + "</a>"
      : p === "google" ? esc(t("attr_google")) : "";
  }
  function setMode(m) {
    search.mode = m;
    $("#bookingForm").classList.toggle("list-mode", m === "list");
    $("#modeToggle").textContent = t(m === "list" ? "bk_search_mode" : "bk_list");
  }
  function Combo(end) {
    var inp = $("#" + end + "Search"), list = $("#" + end + "List"), items = [], active = -1, timer = null, ctrl = null, seq = 0;
    var other = end === "pickup" ? "dropoff" : "pickup";
    function bias() { var o = search[other]; return o && o.lat != null ? [o.lat, o.lon] : [13.75, 100.55]; }
    function open(on) { list.hidden = !on; inp.setAttribute("aria-expanded", on ? "true" : "false"); }
    function highlight() {
      $$(".combo-opt", list).forEach(function (li, i) { li.classList.toggle("active", i === active); li.setAttribute("aria-selected", i === active); });
      inp.setAttribute("aria-activedescendant", active >= 0 ? end + "-opt-" + active : "");
    }
    function render(q, remote, loading) {
      q = q.trim();
      var local = q ? PL.localSearch(P, q, lang, 6) : [];
      var strong = local.filter(function (r) { return r.score >= 85; }), weak = local.filter(function (r) { return r.score < 85; });
      items = strong.concat(remote || [], weak).slice(0, 9);
      if (q.length >= 2) items.push({ label: q, kind: "typed", source: "typed", zone: null });
      var html = items.map(function (r, i) {
        if (r.kind === "typed") return '<li role="option" class="combo-opt typed" id="' + end + "-opt-" + i + '" data-i="' + i + '"><span class="opt-main"><b>' + esc(t("srch_use_typed", { q: q })) + "</b></span></li>";
        var sub = r.source === "list" ? (r.kind === "area" || loc(r.zone) === r.label ? "" : loc(r.zone)) : [r.sub, r.zone ? loc(r.zone) : (r.resolve ? "" : t("msg_zone_out"))].filter(Boolean).join(" · ");
        return '<li role="option" class="combo-opt" id="' + end + "-opt-" + i + '" data-i="' + i + '"><span class="type-badge t-' + r.kind + '">' + esc(t("badge_" + r.kind)) + '</span><span class="opt-main"><b>' + esc(r.label) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span></li>";
      }).join("");
      var prov = PL.provider(G);
      if (loading) html += '<li class="combo-note">' + esc(t("srch_searching")) + "</li>";
      else if (prov !== "none" && q.length < (G.minChars || 3)) html += '<li class="combo-note">' + esc(t("srch_more")) + "</li>";
      else if (!local.length && remote && !remote.length) html += '<li class="combo-note">' + esc(t("srch_none")) + "</li>";
      list.innerHTML = html; active = items.length && q ? 0 : -1; highlight(); open(!!html && document.activeElement === inp);
    }
    function set(pl) { search[end] = pl; inp.value = pl ? pl.label : ""; inp.classList.remove("invalid"); }
    function pick(i) {
      var r = items[i]; if (!r) return;
      open(false);
      var done = function () {
        set({ label: r.label, sub: r.sub || "", names: r.names, kind: r.kind, zone: r.zone || null, lat: r.lat, lon: r.lon, source: r.source });
        resolveSearch();
      };
      if (r.resolve) r.resolve().then(function (c) { r.lat = c.lat; r.lon = c.lon; r.zone = PL.zoneFor(P, c.lat, c.lon); done(); }, function (e) { console.warn("OKASTO: place lookup failed", e); r.zone = null; done(); });
      else done();
    }
    // text left in the box without picking: take a near-exact built-in match, else keep it as typed (we quote it)
    function commit() {
      var q = inp.value.trim();
      if (search[end] && search[end].label === q) return;
      if (!q) { if (search[end]) { search[end] = null; resolveSearch(); } return; }
      var best = PL.localSearch(P, q, lang, 1)[0];
      if (best && best.score >= 95) set(best); else set({ label: q, kind: "typed", source: "typed", zone: null });
      resolveSearch();
    }
    inp.addEventListener("input", function () {
      var q = inp.value;
      if (search[end]) { search[end] = null; resolveSearch(); }
      clearTimeout(timer); if (ctrl) ctrl.abort(); var my = ++seq;
      var prov = PL.provider(G);
      if (prov === "none" || q.trim().length < (G.minChars || 3)) { render(q, null, false); return; }
      render(q, null, true);
      timer = setTimeout(function () {
        ctrl = window.AbortController ? new AbortController() : null;
        PL.remoteSearch(G, q.trim(), lang, bias(), ctrl && ctrl.signal).then(function (res) {
          if (my !== seq) return;
          res.forEach(function (r) { if (r.lat != null) r.zone = PL.zoneFor(P, r.lat, r.lon); });
          render(inp.value, res, false);
        }).catch(function (e) {
          if (e && e.name === "AbortError") return;
          console.warn("OKASTO: place search unavailable, using the built-in list only.", e);
          if (my === seq) render(inp.value, [], false);
        });
      }, G.debounceMs || 350);
    });
    inp.addEventListener("keydown", function (e) {
      var n = items.length;
      if (e.key === "ArrowDown" && n) { e.preventDefault(); if (list.hidden) open(true); active = (active + 1) % n; highlight(); }
      else if (e.key === "ArrowUp" && n) { e.preventDefault(); active = (active - 1 + n) % n; highlight(); }
      else if (e.key === "Enter") { e.preventDefault(); if (!list.hidden && active >= 0) pick(active); else commit(); }
      else if (e.key === "Escape") open(false);
    });
    inp.addEventListener("focus", function () { if (!search[end] && inp.value.trim()) render(inp.value, null, false); });
    inp.addEventListener("blur", function () { setTimeout(function () { open(false); if (!list.contains(document.activeElement)) commit(); }, 180); });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    list.addEventListener("click", function (e) { var li = e.target.closest(".combo-opt"); if (li) pick(+li.getAttribute("data-i")); });
    return { set: set, commit: commit, render: render, pick: pick, items: function () { return items; } };
  }
  function initSearch() { combos.pickup = Combo("pickup"); combos.dropoff = Combo("dropoff"); }

  /* ---------- Events ---------- */
  function bind() {
    $$(".lang-switch button").forEach(function (b) { b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); }); });
    sel.pickup.addEventListener("change", function () { buildDropoff(); });
    $("#bookingForm").addEventListener("input", function (e) {
      if (e.target.name === "pax" || e.target.name === "luggage") state.manualVehicle = false;
      update();
    });
    $("#bookingForm").addEventListener("change", function (e) {
      if (e.target.name === "vehicle") { state.vehicle = e.target.value; state.manualVehicle = true; }
      update();
    });
    $$(".stepper button").forEach(function (b) {
      b.addEventListener("click", function () {
        var inp = b.parentNode.querySelector("input"), step = +b.getAttribute("data-step");
        var n = (parseInt(inp.value, 10) || 0) + step;
        inp.value = Math.min(+inp.max, Math.max(+inp.min, n));
        state.manualVehicle = false; update();
      });
    });
    $("#swapBtn").addEventListener("click", function () {
      if (search.mode === "search") {
        var pa = search.pickup; combos.pickup.set(search.dropoff); combos.dropoff.set(pa); resolveSearch(); return;
      }
      var a = sel.pickup.value, b = sel.dropoff.value; if (!a || !b) return;
      var target = findRoute(b, a) ? [b, a] : null;
      // reverse of "Pattaya North" etc. starts from the area (Pattaya)
      if (!target && LOC[b] && LOC[b].reverseAs && findRoute(LOC[b].reverseAs, a)) target = [LOC[b].reverseAs, a];
      if (!target && LOC[a] && LOC[a].area) {   // e.g. Pattaya -> DMK swapped => DMK -> Pattaya North
        var alt = destinations(b).filter(function (r) { return area(r.to) === area(a); })[0];
        if (alt) target = [b, alt.to];
      }
      if (target) setRoute(target[0], target[1]); else toast(t("bk_no_reverse"));
    });
    $("#bookingForm").addEventListener("submit", function (e) { e.preventDefault(); bookAndPay(); });
    $("#lineBtn").addEventListener("click", function () { openChannel("line"); });
    $("#waBtn").addEventListener("click", function () { openChannel("wa"); });
    $$("#payModal [data-close]").forEach(function (x) { x.addEventListener("click", closePay); });
    $("#payGo").addEventListener("click", goPay);
    $("#payNext").addEventListener("click", checkoutNext);
    $("#payBack").addEventListener("click", function () { showStep(1); });
    $("#payAgree").addEventListener("change", function () { if (this.checked) { $("#agreeError").hidden = true; $(".co-agree").classList.remove("invalid"); } });
    $("#payMethods").addEventListener("change", function () { $("#methodError").hidden = true; $(".co-methods").classList.remove("invalid"); if (booking) { booking.method = chosenMethod(); var m = methodById(booking.method); $("#sumMethodRow").hidden = !m; $("#sumMethod").textContent = m ? t("co_method") + ": " + mText(m.label) : ""; } });
    document.addEventListener("keydown", trapFocus);
    $("#paySendLine").addEventListener("click", function () { if (booking) openChannel("line", "book", booking.reference); });
    $("#paySendWa").addEventListener("click", function () { if (booking) openChannel("wa", "book", booking.reference); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#payModal").hidden) closePay(); });
    $("#fleetGrid").addEventListener("click", function (e) {
      var b = e.target.closest(".fleet-book"); if (!b) return;
      var id = b.getAttribute("data-v"), rb = $('input[name="vehicle"][value="' + id + '"]');
      if (rb && !rb.disabled) { rb.checked = true; state.vehicle = id; state.manualVehicle = true; update(); }
      $("#book").scrollIntoView({ behavior: "smooth" });
    });
    $("#routeTabs").addEventListener("click", function (e) {
      var b = e.target.closest(".rt-tab"); if (!b) return;
      state.tab = b.getAttribute("data-tab"); buildTable();
    });
    $("#priceTable").addEventListener("click", function (e) {
      var b = e.target.closest(".book-link"); if (!b) return;
      var f = b.getAttribute("data-from"), to = b.getAttribute("data-to");
      setRoute(f, to);
      if (search.mode === "search") { combos.pickup.set(placeFromZone(f)); combos.dropoff.set(placeFromZone(to)); resolveSearch(); }
      $("#book").scrollIntoView({ behavior: "smooth" });
    });
    $("#modeToggle").addEventListener("click", function () {
      if (search.mode === "search") setMode("list");
      else {
        combos.pickup.set(sel.pickup.value ? placeFromZone(sel.pickup.value) : null);
        combos.dropoff.set(sel.dropoff.value ? placeFromZone(sel.dropoff.value) : null);
        setMode("search"); resolveSearch();
      }
    });
    $("#navToggle").addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open"); this.setAttribute("aria-expanded", open);
    });
    $$("#mainNav a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); }); });
  }

  /* ---------- Init ---------- */
  /* ---------- Price data loading: Google Sheet CSV -> data/prices.json -> js/prices-data.js ---------- */
  function parseCSV(text) {
    var rows = [], row = [], f = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
      else f += ch;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ""; }); });
  }
  // Sheet layout (header row required): section,from,to,economy,suv,premium,ev,van,luxvan,min_hours,name_en,name_th,name_zh,type
  function pricesFromCSV(text, base) {
    var rows = parseCSV(text), h = rows.shift().map(function (x) { return String(x).trim().toLowerCase(); });
    var col = function (r, k) { var i = h.indexOf(k); return i < 0 ? "" : String(r[i] == null ? "" : r[i]).trim(); };
    var vids = base.vehicles.map(function (v) { return v.id; });
    var numOrNull = function (x) { x = String(x).replace(/[,\s฿]/g, ""); return x === "" || /^(x|n\/?a|unavailable|-)$/i.test(x) ? null : Number(x); };
    var out = JSON.parse(JSON.stringify(base)); out.rates = {}; var ch = [];
    var locs = {}; out.locations.forEach(function (l) { locs[l.id] = l; });
    rows.forEach(function (r) {
      var sec = col(r, "section").toLowerCase(), from = col(r, "from"), to = col(r, "to");
      var prices = vids.map(function (id) { return numOrNull(col(r, id)); });
      if (prices.some(function (p) { return p != null && isNaN(p); })) throw new Error("Bad price in row " + r.join(","));
      if (sec === "transfer" && from && to) { (out.rates[from] = out.rates[from] || {})[to] = prices; }
      else if (sec === "charter" && from) ch.push({ id: from, perHour: prices, minHours: Number(col(r, "min_hours")) || 0, fuelIncluded: /^(y|yes|true|1)$/i.test(to) });
      else if (sec === "setting" && from) out[from] = isNaN(Number(to)) ? to : Number(to);
      else if (sec === "location" && from) {
        var l = locs[from] || (locs[from] = { id: from, type: "other", name: {} });
        l.name = l.name || {};
        ["en", "th", "zh"].forEach(function (k) { if (col(r, "name_" + k)) l.name[k] = col(r, "name_" + k); });
        if (col(r, "type")) l.type = col(r, "type");
      }
    });
    if (ch.length) out.charter = ch;
    out.locations = Object.keys(locs).map(function (k) { return locs[k]; });
    if (!Object.keys(out.rates).length) throw new Error("No transfer rows in sheet");
    return out;
  }
  function useData(data, source) {
    P = data; window.OKASTO_PRICES = data; window.__okastoPriceSource = source;
    var a = sel.pickup.value, b = sel.dropoff.value;
    indexData(); buildRoutes(); applyLang(lang);
    if (search.mode === "search") resolveSearch(); else if (a) setRoute(a, b);
  }
  function loadRemotePrices() {
    if (!window.fetch) return;
    var csv = C.pricesSheetCsvUrl;
    if (csv) {
      fetch(csv, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (txt) { useData(pricesFromCSV(txt, P), "sheet"); })
        .catch(function (e) { console.warn("OKASTO: Google Sheet prices not loaded, using built-in prices.", e); });
      return;
    }
    if (location.protocol === "file:" || !C.pricesJsonUrl) return;   // file:// -> keep js/prices-data.js copy
    fetch(C.pricesJsonUrl, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { if (d && d.rates && d.vehicles) useData(d, "json"); })
      .catch(function (e) { console.warn("OKASTO: data/prices.json not loaded, using js/prices-data.js.", e); });
  }

  function init() {
    indexData();
    buildRoutes();
    var d = new Date(); d.setDate(d.getDate() + 1);
    var iso = function (x) { return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
    $("#date").value = iso(d); $("#date").min = iso(new Date());
    initSearch();
    applyLang(initialLang());
    combos.pickup.set(placeFromZone("BKK"));
    resolveSearch();
    bind();
    paymentReturn();
    window.__okastoPriceSource = "js";
    loadRemotePrices();
  }
  init();

  // expose for testing/debug
  window.OKASTO = { pricesFromCSV: pricesFromCSV, calc: calc, setLang: applyLang, buildMessage: buildMessage, routes: function () { return ROUTES; }, displayPrice: displayPrice, setRoute: setRoute,
    zoneFor: function (lat, lon) { return PL.zoneFor(P, lat, lon); }, search: search, bookAndPay: bookAndPay, payLive: payLive, resolvePair: function (a, b) { return resolvePair(a, b); } };
})();
