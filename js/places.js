/* OKASTO — place search + zone matching.
   - Built-in index (no key, works offline): every location in prices.json that has a "center",
     with all its names + "aliases", plus the extra landmarks in prices.json -> "places".
   - Zone matching for a map point: airports (radiusKm) -> polygons -> nearest center within radiusKm.
   - Remote geocoder for hotels/addresses: Photon (default, free, OpenStreetMap) or Google Places (API key).
   The ONLY network calls in this file go to the geocoder chosen in js/config.js (geocoder.provider). */
(function () {
  "use strict";

  /* ---------- text normalising + fuzzy score ---------- */
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^0-9a-z\u0e00-\u0e7f\u3400-\u9fff]+/g, " ").trim();
  }
  function lev(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length, prev = [], cur, i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  // 0..100: how well query q matches the name s
  function score(q, s) {
    q = norm(q); s = norm(s);
    if (!q || !s) return 0;
    var qc = q.replace(/ /g, ""), sc = s.replace(/ /g, "");
    if (q === s || qc === sc) return 100;
    if (s.indexOf(q) === 0 || sc.indexOf(qc) === 0) return 90 - Math.min(10, (sc.length - qc.length) / 3);
    if ((" " + s).indexOf(" " + q) >= 0) return 80;
    if (qc.length >= 2 && sc.indexOf(qc) >= 0) return 70;
    if (sc.length >= 4 && qc.indexOf(sc) >= 0) return 62;           // "suvarnabhumi airport bangkok" contains "suvarnabhumi"
    if (qc.length < 4) return 0;
    // typo tolerance: compare with the same-length start of the name and with every word
    var best = 0, cands = [sc.slice(0, qc.length), sc].concat(s.split(" "));
    cands.forEach(function (c) {
      if (!c) return;
      var sim = 1 - lev(qc, c) / Math.max(qc.length, c.length);
      if (sim > best) best = sim;
    });
    return best >= 0.72 ? Math.round(60 * best) : 0;
  }

  /* ---------- geometry ---------- */
  function km(a, b) {
    var R = 6371, r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function inPoly(pt, poly) {               // ray casting, points are [lat, lon]
    var x = pt[1], y = pt[0], inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][1], yi = poly[i][0], xj = poly[j][1], yj = poly[j][0];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  // -> location id or null (outside every priced area)
  function zoneFor(P, lat, lon) {
    var pt = [lat, lon], locs = P.locations || [], best = null, bd = Infinity;
    locs.forEach(function (l) {                                  // 1. airports
      if (l.type !== "airport" || !l.center || !l.radiusKm) return;
      var d = km(pt, l.center); if (d <= l.radiusKm && d < bd) { bd = d; best = l.id; }
    });
    if (best) return best;
    for (var i = 0; i < locs.length; i++) {                      // 2. polygons
      var ps = locs[i].polygons; if (!ps) continue;
      for (var k = 0; k < ps.length; k++) if (inPoly(pt, ps[k])) return locs[i].id;
    }
    locs.forEach(function (l) {                                  // 3. nearest center within radius
      if (l.type === "airport" || l.polygons || !l.center || !l.radiusKm) return;
      var d = km(pt, l.center); if (d <= l.radiusKm && d < bd) { bd = d; best = l.id; }
    });
    return best;
  }

  /* ---------- built-in search ---------- */
  function names(o) { var n = o.name || {}; return [n.en, n.th, n.zh].filter(Boolean).concat(o.aliases || []); }
  function localSearch(P, q, lang, max) {
    var out = [];
    (P.locations || []).forEach(function (l) {
      if (!l.center) return;                                     // generic price-list rows (no map point) are not searchable
      var s = 0; names(l).forEach(function (n) { s = Math.max(s, score(q, n)); });
      if (s > 0) out.push({ score: s + (l.type === "airport" ? 3 : 0), label: (l.name[lang] || l.name.en), names: l.name, kind: l.type === "airport" ? "airport" : "area",
        zone: l.id, lat: l.center[0], lon: l.center[1], source: "list" });
    });
    (P.places || []).forEach(function (p) {
      var s = 0; names(p).forEach(function (n) { s = Math.max(s, score(q, n)); });
      if (s > 0) out.push({ score: s - 1, label: (p.name[lang] || p.name.en), names: p.name, kind: p.kind || "place",
        zone: zoneFor(P, p.at[0], p.at[1]), lat: p.at[0], lon: p.at[1], source: "list" });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, max || 6);
  }

  /* ---------- remote geocoders ---------- */
  var HOTEL = /^(hotel|hostel|guest_house|motel|resort|apartment|chalet|apartments)$/;
  function photon(G, q, lang, bias, signal) {
    var b = G.thailandBbox, u = G.photonUrl + "?q=" + encodeURIComponent(q) + "&limit=10&bbox=" + b.join(",");
    if (bias) u += "&lat=" + bias[0] + "&lon=" + bias[1];
    if (lang === "en") u += "&lang=en";                          // Photon only knows en/de/fr; others get local names
    return fetch(u, { signal: signal }).then(function (r) { if (!r.ok) throw new Error("Photon " + r.status); return r.json(); })
      .then(function (j) {
        var seen = {};
        return (j.features || []).filter(function (f) {
          var p = f.properties || {}, c = f.geometry && f.geometry.coordinates;
          if (!c || (p.countrycode && p.countrycode !== "TH")) return false;
          var key = (p.name || p.street || "") + "|" + c[1].toFixed(3) + "|" + c[0].toFixed(3);
          if (seen[key]) return false; seen[key] = 1; return true;
        }).map(function (f) {
          var p = f.properties, c = f.geometry.coordinates;
          var kind = p.osm_value === "aerodrome" ? "airport" : (p.osm_key === "tourism" && HOTEL.test(p.osm_value)) ? "hotel" : "place";
          var label = p.name || [p.housenumber, p.street].filter(Boolean).join(" ") || p.city || q;
          var sub = [p.name ? p.street : "", p.district || p.locality, p.city, p.state].filter(function (x, i, a) { return x && a.indexOf(x) === i && x !== label; }).join(", ");
          return { label: label, sub: sub, kind: kind, lat: c[1], lon: c[0], source: "photon" };
        }).filter(function (r) {                                    // same name + same address line = same place
          var k = (r.label + "|" + r.sub).toLowerCase();
          if (seen["~" + k]) return false; seen["~" + k] = 1; return true;
        });
      });
  }

  var gLoad = null;
  function googleReady(key) {
    if (gLoad) return gLoad;
    gLoad = new Promise(function (res, rej) {
      window.__okastoGmapsCb = function () { res(); };
      var s = document.createElement("script");
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) + "&libraries=places&loading=async&callback=__okastoGmapsCb";
      s.async = true; s.onerror = function () { gLoad = null; rej(new Error("Google Maps script failed")); };
      document.head.appendChild(s);
    });
    return gLoad;
  }
  var gToken = null;
  function google(G, q, lang, bias) {
    return googleReady(G.googlePlacesApiKey).then(function () { return window.google.maps.importLibrary("places"); }).then(function (lib) {
      if (!gToken) gToken = new lib.AutocompleteSessionToken();
      var req = { input: q, includedRegionCodes: ["th"], sessionToken: gToken, language: lang === "zh" ? "zh-CN" : lang };
      if (bias) req.locationBias = { lat: bias[0], lng: bias[1] };
      return lib.AutocompleteSuggestion.fetchAutocompleteSuggestions(req);
    }).then(function (res) {
      return (res.suggestions || []).filter(function (s) { return s.placePrediction; }).map(function (s) {
        var p = s.placePrediction, types = p.types || [];
        return { label: p.mainText ? p.mainText.text : p.text.text, sub: p.secondaryText ? p.secondaryText.text : "",
          kind: types.indexOf("airport") >= 0 ? "airport" : types.indexOf("lodging") >= 0 ? "hotel" : "place",
          source: "google", resolve: function () {
            var place = p.toPlace();
            return place.fetchFields({ fields: ["location", "displayName", "formattedAddress"] }).then(function () {
              gToken = null;                                      // a session ends with a place lookup
              return { lat: place.location.lat(), lon: place.location.lng() };
            });
          } };
      });
    });
  }
  function provider(G) {
    if (!G || G.provider === "none") return "none";
    if (G.googlePlacesApiKey) return "google";
    return G.provider === "google" ? "none" : "photon";
  }
  function remoteSearch(G, q, lang, bias, signal) {
    var p = provider(G);
    if (p === "google") return google(G, q, lang, bias);
    if (p === "photon") return photon(G, q, lang, bias, signal);
    return Promise.resolve([]);
  }

  window.OKASTO_PLACES = { norm: norm, score: score, km: km, inPoly: inPoly, zoneFor: zoneFor, localSearch: localSearch, remoteSearch: remoteSearch, provider: provider };
})();
