/* OKASTO price editor: runs fully in the browser. The only request it makes is reading
   data/prices.json from this same site. Nothing is uploaded or sent anywhere. */
(function () {
  "use strict";
  var DRAFT_KEY = "okasto_prices_draft";
  var VEH_LABEL = { economy: "Economy", suv: "SUV", premium: "Premium", ev: "Electric SUV", van: "Normal Van", luxvan: "Luxury Van" };
  var P, origin;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function toast(msg) { var d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }
  function status(msg) { $("#status").textContent = msg; }
  function locById(id) { return P.locations.filter(function (l) { return l.id === id; })[0]; }
  function name(id) { var l = locById(id); return l && l.name ? (l.name.en || id) : id; }
  function save() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(P)); } catch (e) {} status("Draft saved in this browser · not published until you upload the files"); }

  /* ---------- formatting / export ---------- */
  function formatJSON(p) {
    // pretty JSON, but keep each price row / small array on one line
    return JSON.stringify(p, null, 2).replace(/\[\s+([^\[\]{}]*?)\s+\]/g, function (m, inner) { return "[" + inner.split(/,\s*/).join(", ") + "]"; });
  }
  function exportData() {
    var out = clone(P);
    // clean: drop empty origins, sort nothing (owner's order is kept)
    Object.keys(out.rates).forEach(function (o) { if (!Object.keys(out.rates[o]).length) delete out.rates[o]; });
    return out;
  }
  function jsFile(p) {
    return "/* AUTO-GENERATED fallback copy of data/prices.json (used when the page is opened via file:// or the JSON can't be loaded).\n" +
      "   Keep it identical to data/prices.json — admin.html downloads both. */\nwindow.OKASTO_PRICES = " + formatJSON(p) + ";\n";
  }
  function csvCell(v) { v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function csvFile(p) {
    var vids = p.vehicles.map(function (v) { return v.id; });
    var head = ["section", "from", "to"].concat(vids, ["min_hours", "name_en", "name_th", "name_zh", "type"]);
    var blank = function (n) { var a = []; for (var i = 0; i < n; i++) a.push(""); return a; };
    var rows = [head];
    ["markupPercent", "roundTo", "extraBabySeat", "autoReverse", "updated"].forEach(function (k) { rows.push(["setting", k, p[k]].concat(blank(head.length - 3))); });
    Object.keys(p.rates).forEach(function (o) {
      Object.keys(p.rates[o]).forEach(function (d) { rows.push(["transfer", o, d].concat(p.rates[o][d].map(function (x) { return x == null ? "" : x; }), blank(5))); });
    });
    p.charter.forEach(function (c) { rows.push(["charter", c.id, c.fuelIncluded ? "yes" : "no"].concat(c.perHour.map(function (x) { return x == null ? "" : x; }), [c.minHours], blank(4))); });
    p.locations.forEach(function (l) { rows.push(["location", l.id, ""].concat(blank(vids.length), ["", l.name.en || "", l.name.th || "", l.name.zh || "", l.type || ""])); });
    return "\ufeff" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n") + "\r\n";
  }
  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function validateAll() {
    var bad = document.querySelectorAll("input.bad").length;
    if (bad) { alert(bad + " box(es) have an invalid number (red). Fix them first."); return false; }
    return true;
  }

  /* ---------- number inputs ---------- */
  function numInput(val, onChange, attrs) {
    var i = document.createElement("input");
    i.type = "text"; i.inputMode = "numeric"; i.className = "num" + (val == null ? " blank" : "");
    i.value = val == null ? "" : val; i.placeholder = "—";
    if (attrs) Object.keys(attrs).forEach(function (k) { i.setAttribute(k, attrs[k]); });
    i.addEventListener("input", function () {
      var raw = i.value.replace(/[,\s฿]/g, "");
      var ok = raw === "" || (/^\d+(\.\d+)?$/.test(raw));
      i.classList.toggle("bad", !ok); i.classList.toggle("blank", raw === "");
      if (ok) { onChange(raw === "" ? null : Number(raw)); save(); }
    });
    return i;
  }
  function vehHeader(extra) {
    return "<tr>" + (extra || "") + P.vehicles.map(function (v) { return "<th>" + esc(VEH_LABEL[v.id] || v.id) + "<small>" + esc(v.paxLabel) + " pax</small></th>"; }).join("");
  }

  /* ---------- render ---------- */
  function renderSettings() {
    ["markupPercent", "roundTo", "extraBabySeat", "updated"].forEach(function (k) {
      var el = $("#" + k); el.value = P[k] == null ? "" : P[k];
      el.oninput = function () { P[k] = k === "updated" ? el.value : Number(el.value) || 0; if (k === "roundTo" && P[k] < 1) P[k] = 1; save(); };
    });
    $("#autoReverse").checked = P.autoReverse !== false;
    $("#autoReverse").onchange = function () { P.autoReverse = $("#autoReverse").checked; save(); };
  }
  function renderTabs() {
    var origins = Object.keys(P.rates);
    if (origins.indexOf(origin) < 0) origin = origins[0];
    $("#originTabs").innerHTML = origins.map(function (o) { return '<button type="button" data-o="' + esc(o) + '" class="' + (o === origin ? "on" : "") + '">' + esc(name(o)) + " (" + Object.keys(P.rates[o]).length + ")</button>"; }).join("");
  }
  function renderRates() {
    renderTabs();
    var tbl = $("#rateTable"); tbl.innerHTML = "<thead>" + vehHeader("<th>Destination</th>") + "<th></th></tr></thead>";
    var tb = document.createElement("tbody");
    var rows = origin ? P.rates[origin] : {};
    Object.keys(rows).forEach(function (d) {
      var tr = document.createElement("tr");
      tr.innerHTML = '<td class="dest">' + esc(name(d)) + "<small>" + esc(d) + "</small></td>";
      rows[d].forEach(function (val, i) {
        var td = document.createElement("td");
        td.appendChild(numInput(val, function (v) { rows[d][i] = v; }, { "aria-label": d + " " + P.vehicles[i].id }));
        tr.appendChild(td);
      });
      var del = document.createElement("td"); var b = document.createElement("button");
      b.className = "danger"; b.type = "button"; b.textContent = "Remove";
      b.onclick = function () { if (confirm("Remove " + name(d) + " from " + name(origin) + "?")) { delete rows[d]; save(); renderRates(); } };
      del.appendChild(b); tr.appendChild(del); tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    var used = Object.keys(rows).concat([origin]);
    $("#addDestSel").innerHTML = P.locations.filter(function (l) { return used.indexOf(l.id) < 0; }).map(function (l) { return '<option value="' + esc(l.id) + '">' + esc(l.name.en || l.id) + "</option>"; }).join("");
    $("#addOriginSel").innerHTML = P.locations.filter(function (l) { return !P.rates[l.id]; }).map(function (l) { return '<option value="' + esc(l.id) + '">' + esc(l.name.en || l.id) + "</option>"; }).join("");
  }
  function emptyRow() { return P.vehicles.map(function () { return null; }); }
  function renderCharter() {
    var tbl = $("#charterTable"); tbl.innerHTML = "<thead>" + vehHeader("<th>Charter</th>") + "<th>Min hours</th><th>Fuel included</th></tr></thead>";
    var tb = document.createElement("tbody");
    P.charter.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.innerHTML = '<td class="dest">' + esc(c.id === "bangkok" ? "In Bangkok" : c.id === "outside" ? "Outside Bangkok" : c.id) + "<small>" + esc(c.id) + "</small></td>";
      c.perHour.forEach(function (val, i) { var td = document.createElement("td"); td.appendChild(numInput(val, function (v) { c.perHour[i] = v; })); tr.appendChild(td); });
      var td = document.createElement("td"); td.appendChild(numInput(c.minHours, function (v) { c.minHours = v || 0; })); tr.appendChild(td);
      td = document.createElement("td"); var cb = document.createElement("input"); cb.type = "checkbox"; cb.style.width = "auto"; cb.checked = !!c.fuelIncluded;
      cb.onchange = function () { c.fuelIncluded = cb.checked; save(); }; td.appendChild(cb); tr.appendChild(td);
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
  }
  function renderLocs() {
    var tbl = $("#locTable"); tbl.innerHTML = "<thead><tr><th>ID</th><th>Group</th><th>Area</th><th>Name EN</th><th>Name TH</th><th>Name ZH</th><th>Search aliases <small>comma-separated</small></th><th>Centre <small>lat, lon</small></th><th>Radius km</th><th>Used in</th></tr></thead>";
    var tb = document.createElement("tbody");
    P.locations.forEach(function (l) {
      var uses = 0; Object.keys(P.rates).forEach(function (o) { if (o === l.id) uses += Object.keys(P.rates[o]).length; if (P.rates[o][l.id]) uses++; });
      var tr = document.createElement("tr");
      tr.innerHTML = "<td><b>" + esc(l.id) + "</b></td>";
      [["type"], ["area"], ["name", "en"], ["name", "th"], ["name", "zh"]].forEach(function (path) {
        var td = document.createElement("td"), i = document.createElement("input");
        i.value = path[1] ? (l.name[path[1]] || "") : (l[path[0]] || "");
        i.oninput = function () {
          if (path[1]) l.name[path[1]] = i.value;
          else if (i.value) l[path[0]] = i.value; else delete l[path[0]];
          save();
        };
        td.appendChild(i); tr.appendChild(td);
      });
      // place-search geometry (see _geo_readme in prices.json). Polygons are kept as-is (edit them in the JSON).
      var tdA = document.createElement("td"), ia = document.createElement("input");
      ia.className = "wide"; ia.value = (l.aliases || []).join(", ");
      ia.oninput = function () { var a = ia.value.split(",").map(function (x) { return x.trim(); }).filter(Boolean); if (a.length) l.aliases = a; else delete l.aliases; save(); };
      tdA.appendChild(ia); tr.appendChild(tdA);
      var tdC = document.createElement("td"), ic = document.createElement("input");
      ic.value = l.center ? l.center.join(", ") : ""; ic.placeholder = "e.g. 7.895, 98.298";
      ic.oninput = function () {
        var m = ic.value.split(",").map(function (x) { return parseFloat(x); });
        if (!ic.value.trim()) { delete l.center; ic.classList.remove("bad"); }
        else if (m.length === 2 && m.every(function (x) { return isFinite(x); })) { l.center = m; ic.classList.remove("bad"); }
        else { ic.classList.add("bad"); return; }
        save();
      };
      tdC.appendChild(ic);
      if (l.polygons) { var sm = document.createElement("small"); sm.textContent = " + polygon (" + l.polygons.length + ")"; tdC.appendChild(sm); }
      tr.appendChild(tdC);
      var tdR = document.createElement("td");
      tdR.appendChild(numInput(l.radiusKm == null ? null : l.radiusKm, function (v) { if (v == null) delete l.radiusKm; else l.radiusKm = v; }, { step: "0.5", "aria-label": l.id + " radius" }));
      tr.appendChild(tdR);
      var td = document.createElement("td");
      if (uses) td.textContent = uses + " route(s)";
      else { var b = document.createElement("button"); b.className = "danger"; b.type = "button"; b.textContent = "Delete"; b.onclick = function () { P.locations.splice(P.locations.indexOf(l), 1); save(); renderAll(); }; td.appendChild(b); }
      tr.appendChild(td); tb.appendChild(tr);
    });
    tbl.appendChild(tb);
  }
  function renderVeh() {
    P.vehicles.forEach(function (v) { delete v.carryOn; });   // carry-ons are no longer used
    var tbl = $("#vehTable"); tbl.innerHTML = "<thead><tr><th>Vehicle</th><th>Max passengers (number)</th><th>Passenger label</th><th>Standard bags (24 inch)</th></tr></thead>";
    var tb = document.createElement("tbody");
    P.vehicles.forEach(function (v) {
      var tr = document.createElement("tr"); tr.innerHTML = "<td><b>" + esc(VEH_LABEL[v.id] || v.id) + "</b> <small>(" + esc(v.id) + ")</small></td>";
      ["pax", "paxLabel", "bags"].forEach(function (k) {
        var td = document.createElement("td");
        if (k === "paxLabel") { var i = document.createElement("input"); i.value = v[k]; i.oninput = function () { v[k] = i.value; save(); }; td.appendChild(i); }
        else td.appendChild(numInput(v[k], function (x) { v[k] = x || 0; }));
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    tbl.appendChild(tb);
  }
  function renderAll() { renderSettings(); renderRates(); renderCharter(); renderLocs(); renderVeh(); }

  /* ---------- actions ---------- */
  function bind() {
    $("#originTabs").addEventListener("click", function (e) { var b = e.target.closest("button[data-o]"); if (b) { origin = b.getAttribute("data-o"); renderRates(); } });
    $("#addDestBtn").onclick = function () { var id = $("#addDestSel").value; if (!id) return; P.rates[origin][id] = emptyRow(); save(); renderRates(); toast("Added " + name(id) + ". Now fill in the prices."); };
    $("#addNewBtn").onclick = function () {
      var id = $("#nId").value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "");
      if (!id) return alert("Enter an ID (letters/numbers).");
      if (locById(id)) return alert("ID " + id + " already exists. Pick it from the list instead.");
      if (!$("#nEn").value.trim()) return alert("Enter at least the English name.");
      P.locations.push({ id: id, type: $("#nType").value, name: { en: $("#nEn").value.trim(), th: $("#nTh").value.trim() || $("#nEn").value.trim(), zh: $("#nZh").value.trim() || $("#nEn").value.trim() } });
      P.rates[origin][id] = emptyRow();
      ["#nId", "#nEn", "#nTh", "#nZh"].forEach(function (s) { $(s).value = ""; });
      save(); renderAll(); toast("Added " + id + ". Now fill in the prices.");
    };
    $("#addOriginBtn").onclick = function () { var id = $("#addOriginSel").value; if (!id) return; P.rates[id] = {}; origin = id; save(); renderRates(); };
    $("#delOriginBtn").onclick = function () { if (origin && confirm("Remove origin " + name(origin) + " and ALL its prices?")) { delete P.rates[origin]; origin = null; save(); renderRates(); renderLocs(); } };
    $("#dlJson").onclick = function () { if (validateAll()) download("prices.json", formatJSON(exportData()) + "\n", "application/json"); };
    $("#dlJs").onclick = function () { if (validateAll()) download("prices-data.js", jsFile(exportData()), "text/javascript"); };
    $("#dlCsv").onclick = function () { if (validateAll()) download("okasto-prices-sheet.csv", csvFile(exportData()), "text/csv"); };
    $("#openBtn").onclick = function () { $("#fileIn").click(); };
    $("#fileIn").onchange = function () {
      var f = $("#fileIn").files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try { var d = JSON.parse(r.result); if (!d.rates || !d.vehicles) throw new Error("not an OKASTO prices file"); P = d; save(); renderAll(); toast("Loaded " + f.name); }
        catch (e) { alert("Could not read this file: " + e.message); }
      };
      r.readAsText(f);
    };
    $("#resetBtn").onclick = function () { if (confirm("Discard your unsaved draft and reload the prices from the site files?")) { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} location.reload(); } };
  }

  function start(data, src) { P = clone(data); P.charter = P.charter || []; origin = Object.keys(P.rates)[0]; renderAll(); status(src); }
  window.OKASTO_ADMIN = { formatJSON: formatJSON, jsFile: jsFile, csvFile: csvFile, data: function () { return P; } };
  bind();
  var draft = null; try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch (e) {}
  if (draft && draft.rates) { start(draft, "Showing your unsaved draft (from this browser). Use \"Discard draft\" to reload the site files."); return; }
  start(window.OKASTO_PRICES, "Loaded from js/prices-data.js");
  if (location.protocol !== "file:" && window.fetch) {
    fetch("data/prices.json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { if (d && d.rates) start(d, "Loaded from data/prices.json"); })
      .catch(function () { status("Loaded from js/prices-data.js (data/prices.json not reachable)"); });
  }
})();
