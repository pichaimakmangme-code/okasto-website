/* OKASTO — runtime for the content pages (about / contact / terms / privacy).
   Same language choice as the home page (localStorage "okasto_lang" or ?lang=). No network calls. */
(function () {
  "use strict";
  var C = window.OKASTO_CONFIG, I = window.OKASTO_I18N, PG = window.OKASTO_PAGES;
  var LANGS = ["th", "en", "zh"], page = document.body.getAttribute("data-page");
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  function t(lang, key) { return (I[lang] && I[lang][key]) || I.en[key] || key; }
  function fillContacts() {
    var c = C.contact;
    $$(".js-line-link").forEach(function (a) { a.href = c.lineUrl; });
    $$(".js-line-id").forEach(function (e) { e.textContent = "LINE " + c.lineId; });
    $$(".js-wa-link").forEach(function (a) { a.href = "https://wa.me/" + c.whatsappNumber; });
    $$(".js-wa-display").forEach(function (e) { e.textContent = c.whatsappDisplay; });
    $$(".js-tel-link").forEach(function (a) { a.href = "tel:" + c.phoneTel; });
    $$(".js-mail-link").forEach(function (a) { a.href = "mailto:" + c.email; });
    $$(".js-phone").forEach(function (e) { e.textContent = c.phoneDisplay; });
    $$(".js-email").forEach(function (e) { e.textContent = c.email; });
    $$(".js-address").forEach(function (e) { e.textContent = c.address; });
    $$(".js-company").forEach(function (e) { e.textContent = c.company; });
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }
  function apply(l) {
    if (LANGS.indexOf(l) < 0) l = "en";
    var P = PG[page][l] || PG[page].en;
    document.documentElement.lang = l === "zh" ? "zh-Hans" : l;
    document.title = P.title + " — OKASTO Private Transfer";
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(l, el.getAttribute("data-i18n")); });
    $$("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(l, el.getAttribute("data-i18n-aria"))); });
    $("#pageTitle").textContent = P.title;
    $("#crumbHere").textContent = P.title;
    $("#pageLead").textContent = P.lead;
    var d = $("#draftBanner");
    if (d) { d.hidden = !P.draft; $("#draftText").textContent = P.draft || ""; }
    $("#pageBody").innerHTML = P.body;   // static, authored content from js/pages.js
    $$(".lang-switch button").forEach(function (b) {
      var on = b.getAttribute("data-lang") === l;
      b.classList.toggle("active", on); b.setAttribute("aria-pressed", on);
    });
    fillContacts();
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
  $$(".lang-switch button").forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); }); });
  var tog = $("#navToggle");
  if (tog) tog.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open"); tog.setAttribute("aria-expanded", open);
  });
  apply(initialLang());
})();
