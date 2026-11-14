/* ============================================================
   KoviFly — main.js
   Vse je progresivna nadgradnja: brez JS stran ostane berljiva.
============================================================ */
(function(){
"use strict";

var EN = document.documentElement.lang === "en";
var T = EN ? {
  required: "This field is required.",
  email: "Enter a valid email address.",
  phone: "Enter a valid phone number.",
  date: "Choose a date from today onwards.",
  service: "Choose a project type.",
  consent: "I need your consent to send the enquiry.",
  sending: "Sending …",
  fail: "Sending failed. Please try again or write to Kovacic.luka34@gmail.com.",
  menuOpen: "Open menu", menuClose: "Close menu"
} : {
  required: "To polje je obvezno.",
  email: "Vpiši veljaven e-naslov.",
  phone: "Vpiši veljavno telefonsko številko.",
  date: "Izberi datum od danes naprej.",
  service: "Izberi vrsto projekta.",
  consent: "Za pošiljanje potrebujem tvoje soglasje.",
  sending: "Pošiljam …",
  fail: "Pošiljanje ni uspelo. Poskusi znova ali piši na Kovacic.luka34@gmail.com.",
  menuOpen: "Odpri meni", menuClose: "Zapri meni"
};

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var finePointer  = window.matchMedia("(pointer: fine)").matches;
var saveData     = !!(navigator.connection && navigator.connection.saveData);
var hasGsap      = typeof window.gsap !== "undefined";
function $(id){ return document.getElementById(id); }
function all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

/* ---------- PRELOADER ---------- */
(function(){
  var loader = $("loader"), loaderAlt = $("loaderAlt"), loaderBar = $("loaderBar");
  if (!loader) return;
  var t0 = performance.now(), DUR = reduceMotion ? 200 : 1200;
  function tick(now){
    var p = Math.min((now - t0) / DUR, 1);
    var e = 1 - Math.pow(1 - p, 3);
    if (loaderAlt) loaderAlt.textContent = String(Math.round(e * 120)).padStart(3, "0");
    if (loaderBar) loaderBar.style.width = (e * 100) + "%";
    if (p < 1) requestAnimationFrame(tick);
    else setTimeout(function(){ loader.classList.add("done"); }, 150);
  }
  requestAnimationFrame(tick);
})();

/* ---------- LENIS SMOOTH SCROLL ---------- */
var lenis = null;
/* na dotik brskalnik že drsi gladko — Lenis tam samo troši procesor */
if (!reduceMotion && finePointer && typeof window.Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
  document.documentElement.classList.add("lenis");
  (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  if (hasGsap && window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
}
function scrollToEl(el){
  if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

/* ---------- NAV ---------- */
var nav = $("nav"), burger = $("burger"), mobileMenu = $("mobileMenu");
function onScrollNav(){ if (nav) nav.classList.toggle("scrolled", window.scrollY > 40); }
window.addEventListener("scroll", onScrollNav, { passive: true });
onScrollNav();

function setMenu(open){
  if (!burger || !mobileMenu) return;
  mobileMenu.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? T.menuClose : T.menuOpen);
}
if (burger) burger.addEventListener("click", function(){
  setMenu(!mobileMenu.classList.contains("open"));
});
document.addEventListener("keydown", function(e){
  if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("open")) { setMenu(false); burger.focus(); }
});

all('a[href^="#"]').forEach(function(a){
  a.addEventListener("click", function(e){
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    setMenu(false);
    scrollToEl(el);
    if (history.replaceState) history.replaceState(null, "", id);
  });
});

/* ---------- ALTIMETER (podpis strani) ---------- */
var altVal = $("altVal"), altMarker = $("altMarker"), altSec = $("altSec");
var phaseSections = all("[data-phase]");
var MAX_ALT = 120;
function pageProgress(){
  var max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
}
function updateAltimeter(){
  if (!altVal) return;
  var p = pageProgress();
  altVal.textContent = String(Math.round(p * MAX_ALT)).padStart(3, "0");
  if (altMarker) altMarker.style.top = (p * 100) + "%";
  var mid = window.scrollY + window.innerHeight * 0.4, label = null;
  for (var i = 0; i < phaseSections.length; i++) {
    if (phaseSections[i].offsetTop <= mid) label = phaseSections[i].getAttribute("data-phase");
  }
  if (altSec && label && altSec.textContent !== label) altSec.textContent = label;
}
window.addEventListener("scroll", updateAltimeter, { passive: true });
updateAltimeter();

/* ---------- HERO HUD (živa telemetrija) ---------- */
(function(){
  var wind = $("hudWind"), bat = $("hudBat"), alt = $("hudAlt"), b = 96;
  if (reduceMotion || !wind) return;
  setInterval(function(){
    if (document.hidden || window.scrollY > window.innerHeight) return;
    wind.textContent = (2.4 + Math.random() * 2.2).toFixed(1) + " m/s";
    if (alt) alt.textContent = (118 + Math.round(Math.random() * 12)) + " m";
    if (bat && Math.random() < 0.3 && b > 62) bat.textContent = (--b) + "%";
  }, 2600);
})();

/* ---------- CURSOR ---------- */
(function(){
  var dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;
  if (!finePointer || reduceMotion) { dot.style.display = ring.style.display = "none"; return; }
  var mx = -100, my = -100, rx = -100, ry = -100, running = false;
  function loop(){
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    dot.style.transform = "translate(" + (mx - 3) + "px," + (my - 3) + "px)";
    ring.style.transform = "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
    /* zanka teče samo, dokler obroč še lovi miško — ne kuri procesorja v mirovanju */
    if (Math.abs(mx - rx) > 0.2 || Math.abs(my - ry) > 0.2) requestAnimationFrame(loop);
    else running = false;
  }
  window.addEventListener("mousemove", function(e){
    mx = e.clientX; my = e.clientY;
    if (!running) { running = true; requestAnimationFrame(loop); }
  }, { passive: true });
  document.addEventListener("mouseover", function(e){
    if (e.target.closest("[data-cursor='view']")) { ring.classList.add("is-view"); ring.classList.remove("is-link"); }
    else if (e.target.closest("a,button,select,input,textarea,label")) { ring.classList.add("is-link"); ring.classList.remove("is-view"); }
    else ring.classList.remove("is-view", "is-link");
  });
})();

/* ---------- HARMONIKE: storitve (ena odprta) + FAQ ---------- */
function setPanel(item, head, body, open){
  item.classList.toggle("open", open);
  head.setAttribute("aria-expanded", String(open));
  body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
}
var svcs = all(".svc");
svcs.forEach(function(svc){
  var head = svc.querySelector(".svc-head"), body = svc.querySelector(".svc-body");
  head.addEventListener("click", function(){
    var isOpen = svc.classList.contains("open");
    svcs.forEach(function(o){ setPanel(o, o.querySelector(".svc-head"), o.querySelector(".svc-body"), false); });
    if (!isOpen) setPanel(svc, head, body, true);
  });
});
all(".faq-item").forEach(function(item){
  var q = item.querySelector(".faq-q"), a = item.querySelector(".faq-a");
  q.addEventListener("click", function(){ setPanel(item, q, a, !item.classList.contains("open")); });
});
window.addEventListener("resize", function(){
  all(".svc.open .svc-body, .faq-item.open .faq-a").forEach(function(b){ b.style.maxHeight = b.scrollHeight + "px"; });
});

/* ---------- PREDIZPOLNITEV OBRAZCA (storitve, paketi) ---------- */
all("[data-service]").forEach(function(cta){
  cta.addEventListener("click", function(){
    var sel = $("bk-service"), notes = $("bk-notes");
    if (sel) { sel.value = cta.getAttribute("data-service"); sel.dispatchEvent(new Event("change")); }
    var pre = cta.getAttribute("data-prefill");
    if (pre && notes && notes.value.indexOf(pre) === -1) notes.value = pre + (notes.value ? "\n" + notes.value : "");
  });
});

/* ---------- PORTFOLIO: video predogledi ob hoverju / fokusu ---------- */
all(".folio-vid").forEach(function(v){
  var item = v.closest(".folio-item");
  if (saveData) { v.remove(); return; }
  item.classList.add("has-vid");
  function play(){
    if (!v.src) v.src = v.getAttribute("data-src");
    v.play().catch(function(){});
  }
  function stop(){ v.pause(); try { v.currentTime = 0; } catch(e){} }
  item.addEventListener("mouseenter", play);
  item.addEventListener("mouseleave", stop);
  item.addEventListener("focus", play);
  item.addEventListener("blur", stop);
});

/* ---------- LIGHTBOX (s pastjo za fokus) ---------- */
(function(){
  var lb = $("lightbox");
  if (!lb) return;
  var lbImg = $("lbImg"), lbVid = $("lbVid"), lbTitle = $("lbTitle"), lbCat = $("lbCat");
  var items = all(".folio-item"), index = 0, lastFocus = null;
  function show(i){
    index = (i + items.length) % items.length;
    var it = items[index], img = it.querySelector("img"), vid = it.querySelector(".folio-vid");
    if (vid) {
      lbVid.src = vid.getAttribute("data-src");
      lbVid.style.display = "block"; lbImg.style.display = "none";
      lbVid.play().catch(function(){});
    } else {
      lbVid.pause(); lbVid.removeAttribute("src");
      lbVid.style.display = "none"; lbImg.style.display = "block";
      lbImg.src = img.getAttribute("src").replace("-800.", "-1600.");
    }
    lbImg.alt = img.alt;
    lbTitle.textContent = it.getAttribute("data-title") || "";
    lbCat.textContent = it.getAttribute("data-cat") || "";
  }
  function open(i){
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();
    $("lbClose").focus();
  }
  function close(){
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    lbVid.pause();
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function(it, i){
    it.addEventListener("click", function(){ open(i); });
    it.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
  });
  $("lbClose").addEventListener("click", close);
  $("lbPrev").addEventListener("click", function(e){ e.stopPropagation(); show(index - 1); });
  $("lbNext").addEventListener("click", function(e){ e.stopPropagation(); show(index + 1); });
  lb.addEventListener("click", function(e){ if (e.target === lb) close(); });
  document.addEventListener("keydown", function(e){
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "Tab") {
      var f = all("button", lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

/* ---------- OBRAZEC: validacija v živo + Formspree ---------- */
(function(){
  var form = $("bookingForm"), card = $("bookingCard");
  if (!form) return;
  var status = $("formStatus"), btn = form.querySelector("button[type=submit]");
  var dateEl = $("bk-date");
  var now = new Date();
  var today = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  if (dateEl) dateEl.min = today;

  function message(el){
    var v = el.validity;
    if (el.type === "checkbox") return el.checked ? "" : T.consent;
    if (v.valueMissing) return el.tagName === "SELECT" ? T.service : T.required;
    if (el.type === "email" && (v.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value))) return T.email;
    if (el.type === "tel" && el.value && v.patternMismatch) return T.phone;
    if (el.type === "date" && (v.rangeUnderflow || v.badInput || (el.value && el.value < today))) return T.date;
    return "";
  }
  function check(el, quiet){
    var msg = message(el);
    var err = el.getAttribute("aria-describedby") && $(el.getAttribute("aria-describedby"));
    var field = el.closest(".field");
    if (!quiet || !msg) {
      if (err) err.textContent = msg;
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (field) field.classList.toggle("is-ok", !msg && !!el.value && el.type !== "checkbox");
    }
    return !msg;
  }
  var fields = all("input:not([type=hidden]):not([name=_gotcha]), select", form);
  fields.forEach(function(el){
    el.addEventListener("blur", function(){ check(el); });
    /* med tipkanjem napako samo odstranimo, ne prikazujemo je prezgodaj */
    el.addEventListener("input", function(){ check(el, true); });
    el.addEventListener("change", function(){ check(el); });
  });

  form.addEventListener("submit", function(e){
    e.preventDefault();
    status.textContent = "";
    var bad = fields.filter(function(el){ return !check(el); });
    if (bad.length) { bad[0].focus(); return; }
    var label = btn.innerHTML;
    btn.disabled = true; btn.textContent = T.sending;
    fetch(form.action, { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" } })
      .then(function(r){
        if (!r.ok) throw new Error("send failed");
        card.classList.add("sent");
        var ok = card.querySelector(".form-ok");
        if (ok) ok.focus({ preventScroll: true });
      })
      .catch(function(){
        btn.disabled = false; btn.innerHTML = label;
        status.textContent = T.fail;
      });
  });
})();

/* ---------- 3D MODEL DRONA — naloži se šele, ko je sekcija blizu ---------- */
(function(){
  var wrap = $("dron3d"), img = $("dronImg"), gear = $("gear");
  if (!wrap || !gear || saveData || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function(entries){
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    var s = document.createElement("script");
    s.type = "module";
    s.src = "/js/vendor/model-viewer.min.js";
    s.onload = function(){
      var mv = wrap.querySelector("model-viewer");
      mv.addEventListener("load", function(){
        if (img) img.hidden = true;
        wrap.hidden = false;
      }, { once: true });
      mv.setAttribute("src", mv.getAttribute("data-src"));
      /* model-viewer ne nalaga, dokler je skrit → pokažemo ga zunaj pogleda */
      wrap.hidden = false; wrap.style.position = "absolute"; wrap.style.opacity = "0"; wrap.style.pointerEvents = "none";
      mv.addEventListener("load", function(){ wrap.style.position = wrap.style.opacity = wrap.style.pointerEvents = ""; }, { once: true });
    };
    document.head.appendChild(s);
  }, { rootMargin: "400px 0px" });
  io.observe(gear);
})();

/* ===== SKY ENGINE: video scrub čez CELO stran =====
   Scroll napredek strani (0–1) vodi video:
     0.00–0.52 → hero-scroll, 0.52–1.00 → sky-b, s crossfade prehodom pri 0.52.
   Video se naloži samo na namizju; mobilni, reduced-motion in "varčevanje s podatki"
   ostanejo pri statični sliki. */
(function(){
  var skyA = $("skyA"), skyB = $("skyB"), skyDip = $("skyDip"), hero = document.querySelector(".hero");
  if (!skyA || !skyB) return;
  var isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900;
  if (reduceMotion || isTouch || saveData) { skyA.remove(); skyB.remove(); return; }

  var SPLIT = 0.52, FADE = 0.07;
  var durA = 7.0, durB = 7.0, bLoaded = false;
  function smooth(x){ x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); }
  skyA.addEventListener("loadedmetadata", function(){ durA = skyA.duration || durA; }, { once: true });
  skyB.addEventListener("loadedmetadata", function(){ durB = skyB.duration || durB; }, { once: true });
  skyA.preload = "auto"; skyA.src = skyA.getAttribute("data-src");

  var tA = 0, tB = 0, fBT = 0, fB = 0, active = true;
  function computeSky(){
    var p = pageProgress();
    if (!bLoaded && p > 0.12) { bLoaded = true; skyB.preload = "auto"; skyB.src = skyB.getAttribute("data-src"); }
    tA = Math.min(p / (SPLIT + FADE), 1) * durA;
    tB = Math.min(Math.max((p - (SPLIT - FADE)) / (1 - (SPLIT - FADE)), 0), 1) * durB;
    fBT = smooth((p - (SPLIT - FADE)) / (FADE * 2));
    if (hero) hero.classList.toggle("hint-hidden", p > 0.02);
    if (!active) { active = true; requestAnimationFrame(seekLoop); }
  }
  function seekLoop(){
    var busy = false;
    if (skyA.readyState >= 2 && Math.abs(skyA.currentTime - tA) > 0.02) { try { skyA.currentTime = tA; } catch(e){} busy = true; }
    if (bLoaded && skyB.readyState >= 2 && Math.abs(skyB.currentTime - tB) > 0.02) { try { skyB.currentTime = tB; } catch(e){} busy = true; }
    fB += (fBT - fB) * 0.075;
    if (Math.abs(fBT - fB) < 0.002) fB = fBT; else busy = true;
    skyB.style.opacity = fB;
    if (skyDip) skyDip.style.opacity = smooth(1 - Math.abs(2 * fB - 1)) * 0.6;
    /* zanka se ustavi, ko ni več kaj početi; naslednji scroll jo spet zažene */
    if (busy || skyA.readyState < 2) requestAnimationFrame(seekLoop); else active = false;
  }
  window.addEventListener("scroll", computeSky, { passive: true });
  computeSky();
  fB = fBT;
  requestAnimationFrame(seekLoop);
})();

/* ---------- ŠTEVCI: nikoli ne pokažejo 0 ----------
   HTML že vsebuje končno številko; animacija teče od ~40 % do cilja. */
function animateCount(el){
  var target = parseInt(el.getAttribute("data-target"), 10) || 0;
  var from = Math.max(1, Math.round(target * 0.4));
  if (from >= target) return;
  var t0 = performance.now(), DUR = 1600;
  el.textContent = from;
  (function tick(now){
    var p = Math.min((now - t0) / DUR, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * e);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
if (!reduceMotion && "IntersectionObserver" in window) {
  var countIO = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      animateCount(en.target);
    });
  }, { threshold: 0.6 });
  all(".count").forEach(function(el){ countIO.observe(el); });
}

/* ---------- REVEAL ob vstopu v pogled (CSS animacija, brez GSAP) ---------- */
(function(){
  var els = all("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function(el){ el.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      en.target.classList.add("in");
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  els.forEach(function(el){ io.observe(el); });
})();

/* ---------- GSAP ANIMACIJE ---------- */
if (hasGsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  var heroTl = gsap.timeline({ delay: 0.9 });
  heroTl.from(".hero-line span", { yPercent: 115, duration: 1.1, stagger: 0.13, ease: "power4.out" })
        .from(".hero-eyebrow", { opacity: 0, x: -20, duration: .7, ease: "power3.out" }, "-=.8")
        /* brez opacity: hero-sub je LCP element, zato mora biti naslikan takoj */
        .from(".hero-sub",    { y: 20, duration: .7, ease: "power3.out" }, "-=.5")
        .from(".hero-ctas",   { opacity: 0, y: 20, duration: .7, ease: "power3.out" }, "-=.5")
        .from(".hero-hud",    { opacity: 0, y: 12, duration: .6, ease: "power3.out" }, "-=.45");

  gsap.to(".hero-content", {
    y: -110, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: 0.4 }
  });
  gsap.from(".stats", {
    y: 60, ease: "power3.out",
    scrollTrigger: { trigger: ".stats", start: "top 95%", end: "top 55%", scrub: 1 }
  });
  gsap.utils.toArray(".js-scrub").forEach(function(line){
    gsap.fromTo(line, { opacity: 0.5, y: 50 }, {
      opacity: 1, y: 0, ease: "none",
      scrollTrigger: { trigger: line, start: "top 92%", end: "top 45%", scrub: true }
    });
  });
  gsap.from(".footer-mark", {
    yPercent: 26, opacity: 0, ease: "power2.out",
    scrollTrigger: { trigger: ".footer", start: "top 95%", end: "top 55%", scrub: true }
  });
}
})();
