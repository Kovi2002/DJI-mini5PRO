/* ============================================================
   AltitudeLens — style.css
   Smer: "Kino z neba" · nočna modrina + zlata ura
   Tipografija: Archivo (expanded) · Instrument Sans · JetBrains Mono
   ============================================================ */

/* ── Spremenljivke ─────────────────────────────────────────── */
:root {
  --ink:        #04070d;                 /* nočni let */
  --panel:      #0a1220;                 /* instrumentna plošča */
  --panel-2:    #0d1729;
  --line:       rgba(148, 197, 255, 0.14);
  --nebo:       #4fc3ff;                 /* nebo — cian */
  --zora:       #ffb45e;                 /* zlata ura */
  --zora-deep:  #ff8a4c;
  --text:       #eef4ff;
  --muted:      #8fa3c0;
  --horizon:    linear-gradient(90deg, #4fc3ff 0%, #7dd8ff 32%, #ffb45e 68%, #ff8a4c 100%);

  --font-display: 'Archivo', sans-serif;
  --font-body:    'Instrument Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --radius: 14px;
  --ease:   cubic-bezier(0.22, 1, 0.36, 1);
  --nav-h:  72px;
}

/* ── Reset ──────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; font-size: 16px; }

body {
  background: var(--ink);
  color: var(--text);
  font-family: var(--font-body);
  font-weight: 400;
  line-height: 1.7;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

img, video { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }
button { cursor: pointer; border: none; background: none; font-family: inherit; color: inherit; }

section { scroll-margin-top: var(--nav-h); }

::selection { background: var(--zora); color: var(--ink); }

:focus-visible {
  outline: 2px solid var(--zora);
  outline-offset: 3px;
  border-radius: 4px;
}

/* ── Linija horizonta (podpis strani) ───────────────────────── */
#scrollProgress {
  position: fixed; top: 0; left: 0; z-index: 1200;
  width: 100%; height: 2px;
  background: var(--horizon);
  transform-origin: left;
  transform: scaleX(0);
}

.horizon-divider {
  height: 1px;
  max-width: min(1160px, calc(100% - 3rem));
  margin: 0 auto;
  background: var(--horizon);
  opacity: 0.35;
}

/* ── Loader ─────────────────────────────────────────────────── */
#loader {
  position: fixed; inset: 0; z-index: 2000;
  background: var(--ink);
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.7s ease, visibility 0.7s ease;
}
#loader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }

.loader-inner { display: flex; flex-direction: column; align-items: center; gap: 1.1rem; }

.loader-text {
  font-family: var(--font-display);
  font-stretch: 125%;
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: 0.14em;
}
.loader-text span { color: var(--zora); }

.loader-horizon {
  width: 180px; height: 1.5px;
  background: var(--horizon);
  transform-origin: left;
  animation: horizonSweep 1.1s var(--ease) infinite;
}
@keyframes horizonSweep {
  0%   { transform: scaleX(0);   opacity: 1; }
  70%  { transform: scaleX(1);   opacity: 1; }
  100% { transform: scaleX(1);   opacity: 0; }
}

.loader-mono {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.28em;
  color: var(--muted);
}

/* ── Tipografija sekcij ─────────────────────────────────────── */
.section-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--zora);
  margin-bottom: 0.9rem;
}
.section-label::before { content: '— '; color: var(--nebo); }

.section-title {
  font-family: var(--font-display);
  font-stretch: 118%;
  font-weight: 800;
  font-size: clamp(1.9rem, 4.2vw, 3rem);
  line-height: 1.06;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.section-sub {
  color: var(--muted);
  margin-top: 0.9rem;
  max-width: 520px;
}

.section-header { margin-bottom: 3rem; }
.section-header .section-sub { margin-inline: 0; }

.container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

section { padding: clamp(4.5rem, 9vw, 7.5rem) 0; }

/* ── Gumbi ──────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-stretch: 112%;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.95rem 1.9rem;
  border-radius: 999px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), background 0.3s ease, color 0.3s ease;
  will-change: transform;
}

.btn-primary {
  background: linear-gradient(120deg, var(--zora) 0%, var(--zora-deep) 100%);
  color: #170b02;
  box-shadow: 0 6px 26px rgba(255, 150, 70, 0.22);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 34px rgba(255, 150, 70, 0.34);
}

.btn-ghost {
  border: 1px solid var(--line);
  color: var(--text);
  background: rgba(10, 18, 32, 0.5);
  backdrop-filter: blur(8px);
}
.btn-ghost:hover {
  border-color: var(--nebo);
  color: var(--nebo);
  transform: translateY(-2px);
}

.btn-full { width: 100%; }
.btn:disabled { opacity: 0.6; cursor: wait; transform: none; }

/* ── Navigacija ─────────────────────────────────────────────── */
#navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--nav-h);
  padding: 0 clamp(1.25rem, 4vw, 3rem);
  transition: background 0.4s ease, border-color 0.4s ease, height 0.3s ease;
  border-bottom: 1px solid transparent;
}
#navbar.scrolled {
  background: rgba(4, 7, 13, 0.82);
  backdrop-filter: blur(14px);
  border-bottom-color: var(--line);
}

.nav-logo, .footer-logo {
  font-family: var(--font-display);
  font-stretch: 125%;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
}
.nav-logo span, .footer-logo span { color: var(--zora); }

.nav-links {
  display: flex; align-items: center; gap: 2rem;
}
.nav-links a {
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--muted);
  transition: color 0.25s ease;
  position: relative;
}
.nav-links a:not(.nav-cta)::after {
  content: '';
  position: absolute; left: 0; bottom: -6px;
  width: 100%; height: 1.5px;
  background: var(--horizon);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s var(--ease);
}
.nav-links a:hover { color: var(--text); }
.nav-links a:not(.nav-cta):hover::after { transform: scaleX(1); }

.nav-cta {
  font-family: var(--font-display);
  font-stretch: 112%;
  font-weight: 700;
  font-size: 0.72rem !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #170b02 !important;
  background: linear-gradient(120deg, var(--zora), var(--zora-deep));
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,150,70,0.3); }

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  z-index: 1100;
}
.nav-toggle span {
  width: 24px; height: 2px;
  background: var(--text);
  transition: transform 0.3s var(--ease), opacity 0.3s ease;
}
.nav-toggle.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-toggle.active span:nth-child(2) { opacity: 0; }
.nav-toggle.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── HERO ───────────────────────────────────────────────────── */
#hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0;
}

/* Kinematografski letterbox — podpisni moment */
.letterbox {
  position: absolute; left: 0; right: 0; z-index: 40;
  height: 18vh;
  background: var(--ink);
  transition: transform 1.3s var(--ease) 0.15s;
  pointer-events: none;
}
.letterbox-top    { top: 0;    transform: translateY(0); }
.letterbox-bottom { bottom: 0; transform: translateY(0); }
body.loaded .letterbox-top    { transform: translateY(-100%); }
body.loaded .letterbox-bottom { transform: translateY(100%); }

.hero-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transform: scale(1.12);
  transition: transform 2.6s var(--ease) 0.2s;
  filter: saturate(1.05) contrast(1.04);
}
body.loaded .hero-video { transform: scale(1.02); }

.hero-gradient {
  position: absolute; inset: 0; z-index: 5;
  background:
    linear-gradient(180deg, rgba(4,7,13,0.55) 0%, rgba(4,7,13,0.12) 38%, rgba(4,7,13,0.78) 100%),
    linear-gradient(75deg, rgba(4,7,13,0.72) 0%, rgba(4,7,13,0.15) 55%, rgba(255,138,76,0.08) 100%);
}

.hero-content {
  position: relative; z-index: 20;
  padding: 0 clamp(1.5rem, 6vw, 6rem);
  max-width: 1050px;
}

/* Vrstice, ki "pristanejo" */
.hero-line { opacity: 0; transform: translateY(28px); transition: opacity 0.9s var(--ease), transform 0.9s var(--ease); }
body.loaded .hero-eyebrow      { transition-delay: 0.55s; }
body.loaded .hero-headline .hero-line:nth-child(1) { transition-delay: 0.7s; }
body.loaded .hero-headline .hero-line:nth-child(2) { transition-delay: 0.85s; }
body.loaded .hero-sub          { transition-delay: 1.05s; }
body.loaded .hero-ctas         { transition-delay: 1.2s; }
body.loaded .hero-line         { opacity: 1; transform: translateY(0); }

.hero-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  color: var(--nebo);
  margin-bottom: 1.4rem;
}

.hero-headline {
  font-family: var(--font-display);
  font-stretch: 125%;
  font-weight: 850;
  font-size: clamp(2.9rem, 9.5vw, 7.4rem);
  line-height: 0.96;
  letter-spacing: -0.012em;
  text-transform: uppercase;
  margin-bottom: 1.6rem;
}
.hero-headline .hero-line { display: block; overflow: hidden; }
.hero-headline em {
  font-style: normal;
  background: var(--horizon);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  font-size: clamp(1rem, 1.6vw, 1.18rem);
  color: rgba(238, 244, 255, 0.85);
  max-width: 560px;
  margin-bottom: 2.2rem;
}

.hero-ctas { display: flex; flex-wrap: wrap; gap: 1rem; }

/* Telemetrija — ena disciplinirana vrstica ob dnu */
.telemetry {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 25;
  display: flex; align-items: center; justify-content: center;
  gap: clamp(1.2rem, 4vw, 3rem);
  padding: 0.85rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: rgba(238, 244, 255, 0.65);
  border-top: 1px solid rgba(148, 197, 255, 0.12);
  background: rgba(4, 7, 13, 0.45);
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 1s ease 1.5s;
}
body.loaded .telemetry { opacity: 1; }

.tel-item span:not(.rec-dot) { color: var(--nebo); }

.rec-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ff5a5a;
  margin-right: 0.5rem;
  animation: recBlink 1.4s ease infinite;
}
@keyframes recBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

/* ── STATS ──────────────────────────────────────────────────── */
#stats { padding: clamp(3rem, 6vw, 4.5rem) 0; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.stat-num, .stat-plus {
  font-family: var(--font-display);
  font-stretch: 120%;
  font-weight: 800;
  font-size: clamp(2.3rem, 5vw, 3.6rem);
  line-height: 1;
}
.stat-plus { color: var(--zora); }

.stat-item p {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 0.7rem;
}

/* ── ABOUT ──────────────────────────────────────────────────── */
.about-grid {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
}

.about-figure {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--line);
  aspect-ratio: 4 / 5;
}
.about-figure::after {
  content: '';
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 45%;
  background: linear-gradient(180deg, transparent, rgba(4,7,13,0.75));
  pointer-events: none;
}
.about-figure img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 15%;
  transition: transform 0.8s var(--ease);
}
.about-figure:hover img { transform: scale(1.04); }

.about-tag {
  position: absolute; bottom: 1rem; left: 1rem; z-index: 2;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.24em;
  color: var(--text);
  background: rgba(4, 7, 13, 0.6);
  border: 1px solid var(--line);
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

.about-text p { color: var(--muted); margin-bottom: 1.1rem; }
.about-text strong { color: var(--text); }
.about-text .btn { margin-top: 1rem; }

/* ── SERVICES ───────────────────────────────────────────────── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.service-card {
  position: relative;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.9rem 1.6rem;
  overflow: hidden;
  transition: transform 0.4s var(--ease), border-color 0.4s ease;
}
.service-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--horizon);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--ease);
}
.service-card:hover { transform: translateY(-5px); border-color: rgba(148, 197, 255, 0.3); }
.service-card:hover::before { transform: scaleX(1); }

.service-icon {
  width: 44px; height: 44px;
  color: var(--nebo);
  margin-bottom: 1.1rem;
}
.service-icon svg { width: 100%; height: 100%; }

.service-card h3 {
  font-family: var(--font-display);
  font-stretch: 112%;
  font-weight: 700;
  font-size: 1.02rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 0.55rem;
}
.service-card p { color: var(--muted); font-size: 0.92rem; }

/* ── PORTFOLIO ──────────────────────────────────────────────── */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.category-card {
  text-align: left;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.45s var(--ease), border-color 0.4s ease, box-shadow 0.45s var(--ease);
}
.category-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 180, 94, 0.4);
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.45);
}

.category-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.category-cover-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--ease);
}
.category-card:hover .category-cover-img { transform: scale(1.06); }

.category-count {
  position: absolute; top: 0.9rem; right: 0.9rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  background: rgba(4, 7, 13, 0.65);
  border: 1px solid var(--line);
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

.category-info { padding: 1.4rem 1.5rem 1.6rem; }
.category-info h3 {
  font-family: var(--font-display);
  font-stretch: 112%;
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.category-info p { color: var(--muted); font-size: 0.9rem; margin-bottom: 0.9rem; }

.category-open {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  color: var(--zora);
  transition: letter-spacing 0.3s var(--ease);
}
.category-card:hover .category-open { letter-spacing: 0.24em; }

/* ── LIGHTBOX ───────────────────────────────────────────────── */
.lightbox {
  position: fixed; inset: 0; z-index: 1500;
  background: rgba(4, 7, 13, 0.96);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  opacity: 0; visibility: hidden;
  transition: opacity 0.35s ease, visibility 0.35s ease;
}
.lightbox.open { opacity: 1; visibility: visible; }

.lightbox-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 1.5rem;
}
.lightbox-title {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--muted);
}
.lightbox-close {
  font-size: 2rem;
  line-height: 1;
  color: var(--muted);
  transition: color 0.25s ease, transform 0.25s ease;
}
.lightbox-close:hover { color: var(--zora); transform: rotate(90deg); }

.lightbox-main {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4.5rem;
  min-height: 0;
}
.lightbox-main img {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-prev, .lightbox-next {
  position: absolute; top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  font-size: 2.6rem;
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 50%;
  background: rgba(10, 18, 32, 0.6);
  transition: color 0.25s ease, border-color 0.25s ease;
}
.lightbox-prev { left: 1rem; }
.lightbox-next { right: 1rem; }
.lightbox-prev:hover, .lightbox-next:hover { color: var(--zora); border-color: var(--zora); }
.lightbox-prev:disabled, .lightbox-next:disabled { opacity: 0.25; cursor: default; }

.lightbox-caption {
  text-align: center;
  font-size: 0.9rem;
  color: var(--muted);
  padding: 0.8rem;
}

.lightbox-thumbs {
  display: flex; justify-content: center; gap: 0.6rem;
  padding: 0 1rem 1.4rem;
  flex-wrap: wrap;
}
.lightbox-thumbs img {
  width: 72px; height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1.5px solid transparent;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.25s ease, border-color 0.25s ease;
}
.lightbox-thumbs img.active,
.lightbox-thumbs img:hover { opacity: 1; border-color: var(--zora); }

/* ── PROCESS — Kako poteka ──────────────────────────────────── */
.process-list {
  display: grid;
  gap: 0;
  border-top: 1px solid var(--line);
}

.process-step {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 1.5rem;
  align-items: start;
  padding: 1.8rem 0.5rem;
  border-bottom: 1px solid var(--line);
  transition: background 0.35s ease;
}
.process-step:hover { background: rgba(148, 197, 255, 0.03); }

.process-num {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  background: var(--horizon);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  padding-top: 0.2rem;
}

.process-step h3 {
  font-family: var(--font-display);
  font-stretch: 112%;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}
.process-step p { color: var(--muted); font-size: 0.94rem; max-width: 620px; }

/* ── EQUIPMENT ──────────────────────────────────────────────── */
.equipment-feature {
  position: relative;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(1.8rem, 4vw, 3rem);
}

.equipment-badge {
  position: absolute; top: -0.7rem; left: 2rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.24em;
  color: #170b02;
  background: linear-gradient(120deg, var(--zora), var(--zora-deep));
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
}

.equipment-visual { display: flex; justify-content: center; }
.drone-photo {
  width: 100%;
  max-width: 340px;
  border-radius: 12px;
  filter: drop-shadow(0 18px 40px rgba(79, 195, 255, 0.16));
  animation: droneFloat 5s ease-in-out infinite;
}
@keyframes droneFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}

.equipment-info h3 {
  font-family: var(--font-display);
  font-stretch: 118%;
  font-weight: 800;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.equipment-sub {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--nebo);
  margin: 0.5rem 0 1.6rem;
}

.equipment-specs { display: grid; gap: 1.1rem; }
.equipment-specs li { display: flex; gap: 0.9rem; align-items: flex-start; }
.spec-icon { color: var(--zora); font-size: 0.85rem; padding-top: 0.2rem; }
.equipment-specs strong { display: block; font-size: 0.98rem; }
.equipment-specs p { color: var(--muted); font-size: 0.88rem; }

/* ── INSTAGRAM ──────────────────────────────────────────────── */
.instagram-cta {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 1.25rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.4rem 1.8rem;
  margin-bottom: 1.5rem;
}

.ig-left { display: flex; align-items: center; gap: 1rem; }
.ig-avatar {
  width: 54px; height: 54px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  color: var(--zora);
  border: 1.5px solid var(--line);
  background: rgba(255, 180, 94, 0.06);
}
.ig-handle {
  display: block;
  font-family: var(--font-display);
  font-stretch: 112%;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
}
.ig-desc { font-size: 0.82rem; color: var(--muted); }

.ig-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.6rem;
}
.ig-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--line);
}
.ig-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.7s var(--ease);
}
.ig-item:hover img { transform: scale(1.08); }

.ig-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(4, 7, 13, 0.65);
  opacity: 0;
  transition: opacity 0.35s ease;
}
.ig-item:hover .ig-overlay { opacity: 1; }
.ig-overlay span {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-align: center;
  padding: 0 0.5rem;
  color: var(--text);
}

/* ── OBRAZCI (booking + kontakt) ────────────────────────────── */
.booking-wrap,
.contact-form {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(1.6rem, 4vw, 2.4rem);
}

.booking-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
}
.form-group-notes { margin-top: 1.2rem; }
#bookingForm .btn-full { margin-top: 1.6rem; }

.form-group { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1.1rem; }
.booking-grid .form-group, .form-group-notes { margin-bottom: 0; }

.form-group label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}

.form-group input,
.form-group select,
.form-group textarea {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--text);
  background: var(--ink);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}
.form-group textarea { resize: vertical; min-height: 90px; }

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--zora);
  box-shadow: 0 0 0 3px rgba(255, 180, 94, 0.14);
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238fa3c0' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  background-size: 16px;
}
.form-group input::placeholder,
.form-group textarea::placeholder { color: rgba(143, 163, 192, 0.5); }

/* Color-scheme za datum na temni podlagi */
input[type="date"] { color-scheme: dark; }

.form-success { text-align: center; padding: 2.2rem 0; }
.success-emoji { font-size: 2.4rem; }
.form-success h3, .success-title {
  font-family: var(--font-display);
  font-stretch: 115%;
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin: 0.9rem 0 0.4rem;
}
.form-success p { color: var(--muted); }
.form-success #bookingEmail { color: var(--zora); }
.success-title { color: var(--zora); }

/* AI odgovor */
#aiResponse { margin-top: 1.4rem; }
.ai-response-box {
  border: 1px solid rgba(79, 195, 255, 0.25);
  border-radius: 10px;
  background: rgba(79, 195, 255, 0.05);
  padding: 1rem 1.2rem;
}
.ai-header { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.55rem; }
.ai-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--nebo);
  animation: recBlink 1.6s ease infinite;
}
.ai-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--nebo);
}
#aiText { font-size: 0.9rem; color: var(--muted); line-height: 1.7; }

/* ── KONTAKT ────────────────────────────────────────────────── */
.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 1.5rem;
  align-items: start;
}

.contact-info { display: grid; gap: 1.25rem; }

.contact-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.5rem 1.6rem;
}
.contact-card h3 {
  font-family: var(--font-display);
  font-stretch: 112%;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.8rem;
}
.contact-card p { color: var(--muted); font-size: 0.92rem; }
.contact-card strong { color: var(--text); }

.contact-links { display: grid; gap: 0.7rem; }
.contact-links li { display: flex; align-items: center; gap: 0.7rem; }
.contact-icon { font-size: 0.95rem; }
.contact-links a {
  font-size: 0.92rem;
  color: var(--muted);
  transition: color 0.25s ease;
}
.contact-links a:hover { color: var(--zora); }

/* ── FOOTER ─────────────────────────────────────────────────── */
#footer {
  border-top: 1px solid var(--line);
  padding: 2.6rem 1.5rem;
  position: relative;
}
.footer-inner {
  max-width: 1160px;
  margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
}
.footer-socials a {
  display: inline-flex;
  width: 38px; height: 38px;
  align-items: center; justify-content: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--muted);
  transition: color 0.25s ease, border-color 0.25s ease, transform 0.3s var(--ease);
}
.footer-socials svg { width: 18px; height: 18px; }
.footer-socials a:hover { color: var(--zora); border-color: var(--zora); transform: translateY(-2px); }

.footer-copy { font-size: 0.8rem; color: var(--muted); }

.back-to-top {
  position: fixed; bottom: 1.5rem; left: 1.5rem; z-index: 900;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: rgba(10, 18, 32, 0.8);
  backdrop-filter: blur(8px);
  color: var(--muted);
  font-size: 1.1rem;
  opacity: 0; visibility: hidden;
  transform: translateY(8px);
  transition: opacity 0.35s ease, visibility 0.35s ease, transform 0.35s var(--ease), color 0.25s ease, border-color 0.25s ease;
}
.back-to-top.visible { opacity: 1; visibility: visible; transform: translateY(0); }
.back-to-top:hover { color: var(--zora); border-color: var(--zora); }

/* ── WhatsApp ───────────────────────────────────────────────── */
.whatsapp-btn {
  position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 900;
  display: flex; align-items: center; gap: 0.55rem;
  background: #25d366;
  color: #06250f;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.88rem;
  box-shadow: 0 8px 26px rgba(37, 211, 102, 0.32);
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.whatsapp-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(37, 211, 102, 0.42); }
.whatsapp-btn svg { width: 20px; height: 20px; }

/* ── Reveal animacije ───────────────────────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
}
.reveal.visible { opacity: 1; transform: translateY(0); }

/* Stagger za mreže */
.services-grid .reveal:nth-child(2) { transition-delay: 0.08s; }
.services-grid .reveal:nth-child(3) { transition-delay: 0.16s; }
.services-grid .reveal:nth-child(4) { transition-delay: 0.08s; }
.services-grid .reveal:nth-child(5) { transition-delay: 0.16s; }
.services-grid .reveal:nth-child(6) { transition-delay: 0.24s; }
.stats-grid .reveal:nth-child(2) { transition-delay: 0.1s; }
.stats-grid .reveal:nth-child(3) { transition-delay: 0.2s; }
.stats-grid .reveal:nth-child(4) { transition-delay: 0.3s; }
.process-list .reveal:nth-child(2) { transition-delay: 0.07s; }
.process-list .reveal:nth-child(3) { transition-delay: 0.14s; }
.process-list .reveal:nth-child(4) { transition-delay: 0.21s; }
.process-list .reveal:nth-child(5) { transition-delay: 0.28s; }

/* ── Odzivnost ──────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .services-grid { grid-template-columns: repeat(2, 1fr); }
  .ig-grid { grid-template-columns: repeat(3, 1fr); }
  .contact-grid { grid-template-columns: 1fr; }
}

@media (max-width: 820px) {
  .nav-toggle { display: flex; }

  .nav-links {
    position: fixed; inset: 0;
    flex-direction: column;
    justify-content: center;
    gap: 1.8rem;
    background: rgba(4, 7, 13, 0.97);
    backdrop-filter: blur(16px);
    transform: translateY(-100%);
    transition: transform 0.5s var(--ease);
    z-index: 1050;
  }
  .nav-links.open { transform: translateY(0); }
  .nav-links a { font-size: 1.15rem; }
  .nav-cta { font-size: 0.85rem !important; padding: 0.85rem 1.7rem; }

  .about-grid, .equipment-grid { grid-template-columns: 1fr; }
  .about-figure { max-width: 420px; margin: 0 auto; }

  .category-grid { grid-template-columns: 1fr; }
  .booking-grid { grid-template-columns: 1fr; }

  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem 1rem; }

  .tel-wide { display: none; }

  .letterbox { height: 12vh; }

  .lightbox-main { padding: 0 1rem; }
  .lightbox-prev { left: 0.4rem; }
  .lightbox-next { right: 0.4rem; }
  .lightbox-prev, .lightbox-next { width: 42px; height: 42px; font-size: 2rem; }
}

@media (max-width: 520px) {
  .ig-grid { grid-template-columns: repeat(2, 1fr); }
  .process-step { grid-template-columns: 56px 1fr; gap: 1rem; }
  .whatsapp-label { display: none; }
  .whatsapp-btn { padding: 0.85rem; }
  .hero-ctas .btn { width: 100%; }
}

/* ── Zmanjšano gibanje ──────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
  }
  .reveal, .hero-line { opacity: 1; transform: none; }
  .letterbox { display: none; }
  .telemetry { opacity: 1; }
}
