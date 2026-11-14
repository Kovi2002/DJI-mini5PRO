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

/* ---------- PRELOADER: pre-flight checklist ----------
   Največ ~1,2 s, preskočljiv s klikom/tipko, prikaže se samo ob prvem obisku. */
var loaderShown = false;
(function(){
  var loader = $("loader");
  if (!loader) return;
  if (document.documentElement.classList.contains("no-loader")) { loader.remove(); return; }
  loaderShown = true;
  var items = all(".loader-list li", loader), bar = $("loaderBar"), finished = false, timers = [];
  function finish(){
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    loader.classList.add("done");
    try { localStorage.setItem("kf_preflight", "1"); } catch(e){}
    window.removeEventListener("keydown", finish);
    setTimeout(function(){ loader.remove(); }, 900);
  }
  if (reduceMotion) { finish(); return; }
  if (bar) { bar.style.transition = "width 1.05s cubic-bezier(.22,1,.36,1)"; requestAnimationFrame(function(){ bar.style.width = "100%"; }); }
  items.forEach(function(li, i){ timers.push(setTimeout(function(){ li.classList.add("ok"); }, 120 + i * 300)); });
  timers.push(setTimeout(finish, 1200));
  loader.addEventListener("click", finish);
  window.addEventListener("keydown", finish);
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

/* ============================================================
   LET: scroll = pot. En sam izračun na sličico poganja
   višinomer, HUD, mini zemljevid, mobilno vrstico in pristanek.
============================================================ */
var MAX_ALT = 120, FLIGHT_KM = 2.4;
function smooth(x){ x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); }
function pad3(n){ return String(Math.round(n)).padStart(3, "0"); }
var scrollMax = 1;
function pageProgress(){
  return scrollMax > 0 ? Math.min(Math.max(window.scrollY / scrollMax, 0), 1) : 0;
}
/* profil višine: vzpon v prvih 12 %, križarjenje, spust v zadnjih 10 % */
function altitudeAt(p){
  if (p < 0.12) return MAX_ALT * smooth(p / 0.12);
  if (p > 0.90) return MAX_ALT * (1 - smooth((p - 0.90) / 0.10));
  return MAX_ALT;
}

(function(){
  var altVal = $("altVal"), altMarker = $("altMarker"), altSec = $("altSec");
  var hudAlt = $("hudAlt"), hudSpd = $("hudSpd"), hudDst = $("hudDst"), hudBat = $("hudBat");
  var fmap = $("fmap"), trail = $("fmapTrail"), base = $("fmapBase"), wpLayer = $("fmapWps"), drone = $("fmapDrone");
  var fmapWp = $("fmapWp"), fmapLabel = $("fmapLabel"), tAlt = $("tAlt"), tSpd = $("tSpd"), tDst = $("tDst");
  var fbar = $("fbar"), fbarFill = $("fbarFill"), fbarWp = $("fbarWp"), fbarAlt = $("fbarAlt");
  var landing = $("landing"), landingTxt = $("landingTxt"), hero = document.querySelector(".hero");
  var phases = all("[data-phase]"), wps = all("[data-wp]");
  var phaseTops = [], wpFrac = [], wpEls = [], pathLen = 0, lastWp = -1, lastPhase = "";
  var SVGNS = "http://www.w3.org/2000/svg";

  /* meritve razporeditve — samo ob spremembi velikosti, nikoli med drsenjem */
  function measure(){
    scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY, off = window.innerHeight * 0.4;
    phaseTops = phases.map(function(s){ return s.getBoundingClientRect().top + y; });
    wpFrac = wps.map(function(s, i){
      return i === 0 ? 0 : Math.min(Math.max((s.getBoundingClientRect().top + y - off) / scrollMax, 0), 1);
    });
    placeWaypoints();
    update();
  }

  function buildWaypoints(){
    if (!wpLayer || !base) return;
    pathLen = base.getTotalLength();
    trail.style.strokeDasharray = pathLen;
    wps.forEach(function(sec, i){
      var a = document.createElementNS(SVGNS, "a");
      a.setAttribute("href", "#" + sec.id);
      a.setAttribute("class", "fmap-wp");
      a.setAttribute("aria-label", "WP" + i + " — " + sec.getAttribute("data-wp"));
      var hit = document.createElementNS(SVGNS, "circle"); hit.setAttribute("r", "8"); hit.setAttribute("class", "hit");
      var dot = document.createElementNS(SVGNS, "circle"); dot.setAttribute("r", i === 0 || i === wps.length - 1 ? "3.6" : "2.8");
      a.appendChild(hit); a.appendChild(dot);
      a.addEventListener("click", function(e){ e.preventDefault(); scrollToEl(sec); });
      function label(){ if (fmapLabel) fmapLabel.textContent = "→ WP" + i + " · " + sec.getAttribute("data-wp").toUpperCase(); }
      a.addEventListener("mouseenter", label); a.addEventListener("focus", label);
      a.addEventListener("mouseleave", function(){ lastWp = -1; update(); });
      a.addEventListener("blur", function(){ lastWp = -1; update(); });
      wpLayer.appendChild(a);
      wpEls.push(a);
    });
  }
  function placeWaypoints(){
    if (!pathLen) return;
    wpEls.forEach(function(a, i){
      var pt = base.getPointAtLength(wpFrac[i] * pathLen);
      a.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ")");
    });
  }

  var speed = 0, lastY = window.scrollY, lastT = performance.now(), spdRaf = 0;
  function speedLoop(now){
    var dt = Math.max(now - lastT, 1), y = window.scrollY;
    var v = Math.min(Math.abs(y - lastY) / dt * 1000 / 160, 16); /* px/s → m/s, največ 16 */
    lastY = y; lastT = now;
    speed += (v - speed) * 0.18;
    var txt = (speed < 0.05 ? 0 : speed).toFixed(1);
    if (hudSpd) hudSpd.textContent = txt + " m/s";
    if (tSpd) tSpd.textContent = txt;
    spdRaf = speed > 0.05 || v > 0 ? requestAnimationFrame(speedLoop) : 0;
  }

  function update(){
    var p = pageProgress(), alt = altitudeAt(p), a3 = pad3(alt);
    var km = (p * FLIGHT_KM).toFixed(2);

    /* višinomer */
    if (altVal) altVal.textContent = a3;
    if (altMarker) altMarker.style.top = (100 - alt / MAX_ALT * 100) + "%";
    var mid = window.scrollY + window.innerHeight * 0.4, phase = lastPhase;
    for (var i = 0; i < phases.length; i++) if (phaseTops[i] <= mid) phase = phases[i].getAttribute("data-phase");
    if (phase !== lastPhase) { lastPhase = phase; if (altSec) altSec.textContent = phase; }

    /* hero HUD */
    if (hudAlt) hudAlt.textContent = Math.round(alt) + " m";
    if (hudDst) hudDst.textContent = km + " km";
    if (hudBat) hudBat.textContent = Math.round(100 - p * 64) + "%";
    if (hero) hero.classList.toggle("hint-hidden", p > 0.02);

    /* trenutni waypoint */
    var wp = 0;
    for (var k = 0; k < wpFrac.length; k++) if (wpFrac[k] <= p + 0.0005) wp = k;
    if (wp !== lastWp) {
      lastWp = wp;
      var name = wps[wp] ? wps[wp].getAttribute("data-wp").toUpperCase() : "";
      if (fmapWp) fmapWp.textContent = "WP" + wp + "/" + (wps.length - 1);
      if (fmapLabel) fmapLabel.textContent = name;
      if (fbarWp) fbarWp.textContent = "WP" + wp + " · " + name;
      wpEls.forEach(function(el, n){
        el.classList.toggle("passed", n <= wp);
        el.classList.toggle("current", n === wp);
        if (n === wp) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current");
      });
    }

    /* mini zemljevid */
    if (pathLen) {
      trail.style.strokeDashoffset = pathLen * (1 - p);
      var pt = base.getPointAtLength(p * pathLen), pt2 = base.getPointAtLength(Math.min(p * pathLen + 1.5, pathLen));
      var ang = (pt2.x === pt.x && pt2.y === pt.y) ? -60 : Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI + 90;
      drone.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ") rotate(" + ang.toFixed(0) + ")");
    }
    if (tAlt) tAlt.textContent = a3;
    if (tDst) tDst.textContent = km;
    if (fmap) fmap.classList.toggle("on", p > 0.015);

    /* mobilna vrstica */
    if (fbarFill) fbarFill.style.transform = "scaleX(" + p + ")";
    if (fbarAlt) fbarAlt.textContent = a3;
    if (fbar) fbar.classList.toggle("on", p > 0.015);

    /* pristanek: med spustom tabla z višino, ob dotiku tal potrditev (ki po nekaj sekundah zbledi) */
    var down = p >= 0.995, approach = p > 0.90;
    if (approach !== wasApproach || down !== wasDown) {
      wasApproach = approach; wasDown = down; lastWp = -1;
      document.body.classList.toggle("landed", down);
      clearTimeout(landT);
      if (landing) {
        landing.classList.toggle("on", approach);
        landing.classList.toggle("down", down);
        if (down) landT = setTimeout(function(){ landing.classList.remove("on"); }, 2800);
      }
    }
    if (approach) {
      var msg = down ? ("TOUCHDOWN ✓ · " + (EN ? "MOTORS OFF" : "MOTORJI IZKLOPLJENI")) : ("LANDING · ALT " + a3 + " M");
      if (landingTxt) landingTxt.textContent = msg;
      if (fbarWp) fbarWp.textContent = down ? "TOUCHDOWN ✓" : "LANDING";
      if (down && fmapLabel) fmapLabel.textContent = "TOUCHDOWN ✓";
    }
  }
  var wasApproach = false, wasDown = false, landT = 0;

  var ticking = false;
  window.addEventListener("scroll", function(){
    if (!ticking) { ticking = true; requestAnimationFrame(function(){ ticking = false; update(); }); }
    if (!spdRaf && !reduceMotion) { lastY = window.scrollY; lastT = performance.now(); spdRaf = requestAnimationFrame(speedLoop); }
  }, { passive: true });

  var rT = 0;
  function remeasure(){ clearTimeout(rT); rT = setTimeout(measure, 150); }
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", measure);
  if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(document.body);

  buildWaypoints();
  measure();
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

/* ===== SKY ENGINE: scroll scrubba en video čez CELO stran =====
   Namizje: 1600 px različica. Dotik / ozki zasloni: lahka pokončna različica (~0,7 MB),
   ki se naloži šele po nalaganju strani. Reduced-motion in varčevanje s podatki: samo slika. */
(function(){
  var sky = $("skyA");
  if (!sky) return;
  if (reduceMotion || saveData) { sky.remove(); return; }
  var mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900;
  var dur = 7.0, target = 0, active = false, started = false;
  sky.addEventListener("loadedmetadata", function(){ dur = sky.duration || dur; });
  sky.addEventListener("loadeddata", function(){ sky.classList.add("ready"); kick(); }, { once: true });

  function start(){
    if (started) return; started = true;
    sky.preload = "auto";
    sky.src = sky.getAttribute(mobile ? "data-src-m" : "data-src");
    sky.load();
  }
  /* iOS začne nalagati video šele po dotiku: kratek play/pause ga "odklene" */
  function unlock(){
    start();
    var pr = sky.play();
    if (pr && pr.then) pr.then(function(){ sky.pause(); }).catch(function(){});
  }
  function seekLoop(){
    var busy = false;
    if (sky.readyState >= 2) {
      /* ne kopičimo iskanj: novo sličico zahtevamo šele, ko je prejšnja prikazana */
      if (!sky.seeking && Math.abs(sky.currentTime - target) > 0.03) {
        try { sky.currentTime = target; } catch(e){}
        busy = true;
      } else if (sky.seeking) busy = true;
    }
    if (busy) requestAnimationFrame(seekLoop); else active = false;
  }
  function kick(){
    target = Math.min(pageProgress() * dur, dur - 0.05);
    if (!active && started) { active = true; requestAnimationFrame(seekLoop); }
  }
  window.addEventListener("scroll", kick, { passive: true });

  if (mobile) {
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    var later = function(){ setTimeout(start, 1200); };
    if (document.readyState === "complete") later(); else window.addEventListener("load", later);
  } else start();
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

  var heroTl = gsap.timeline({ delay: loaderShown ? 1.0 : 0.15 });
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
