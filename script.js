'use strict';
/* ============================================================
   AltitudeLens — script.js  (v2 · Kino z neba)
   ============================================================ */

/* ── 0. Scroll na vrh ob nalaganju ──────────────────────────── */
window.history.replaceState(null, '', window.location.pathname);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. Loader + kinematografski začetek ────────────────────── */
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  const loader = document.getElementById('loader');
  const delay = reducedMotion ? 0 : 700;
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
    document.body.classList.add('loaded'); // odpre letterbox in razkrije hero
  }, delay);
});

/* ── 2. Linija horizonta (scroll progress) ──────────────────── */
const scrollProgress = document.getElementById('scrollProgress');
function updateProgress() {
  if (!scrollProgress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  scrollProgress.style.transform = `scaleX(${p})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ── 3. Navigacija ──────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (navbar)    navbar.classList.toggle('scrolled', window.scrollY > 60);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ── 4. Reveal ob scrollu ───────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

/* ── 5. Števci statistike ───────────────────────────────────── */
const statNums = document.querySelectorAll('.stat-num');
if ('IntersectionObserver' in window && statNums.length) {
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      if (reducedMotion) { el.textContent = target; counterIO.unobserve(el); return; }
      const dur = 1400;
      const start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => counterIO.observe(el));
}

/* ── 6. Portfolio + Lightbox ────────────────────────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxTitle   = document.getElementById('lightboxTitle');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxThumbs  = document.getElementById('lightboxThumbs');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

const galleryData = {};
document.querySelectorAll('#galleryData > div').forEach(d => {
  const cat = d.dataset.category;
  if (!galleryData[cat]) galleryData[cat] = [];
  galleryData[cat].push({ src: d.dataset.src, title: d.dataset.title });
});

let galleryImages = [];
let currentIndex  = 0;

const categoryTitles = { landscape: 'Pokrajina / Narava', urban: 'Mestno / Urbano' };

function openLightbox(category) {
  galleryImages = galleryData[category] || [];
  if (!galleryImages.length || !lightbox) return;
  if (lightboxTitle) lightboxTitle.textContent = categoryTitles[category] || 'Galerija';
  buildThumbs();
  showImage(0);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function buildThumbs() {
  if (!lightboxThumbs) return;
  lightboxThumbs.innerHTML = '';
  galleryImages.forEach((img, i) => {
    const t = document.createElement('img');
    t.src = img.src;
    t.alt = img.title;
    t.addEventListener('click', () => showImage(i));
    lightboxThumbs.appendChild(t);
  });
}

function showImage(i) {
  if (i < 0 || i >= galleryImages.length) return;
  currentIndex = i;
  const img = galleryImages[i];
  if (lightboxImg)     { lightboxImg.src = img.src; lightboxImg.alt = img.title; }
  if (lightboxCaption) lightboxCaption.textContent = `${img.title} · ${i + 1} / ${galleryImages.length}`;
  if (lightboxPrev)    lightboxPrev.disabled = i === 0;
  if (lightboxNext)    lightboxNext.disabled = i === galleryImages.length - 1;
  if (lightboxThumbs) {
    [...lightboxThumbs.children].forEach((t, k) => t.classList.toggle('active', k === i));
  }
}

document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => openLightbox(card.dataset.category));
});
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev)  lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
if (lightboxNext)  lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));
if (lightbox) {
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
}
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});

/* ── 7. Kontaktni obrazec ───────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const project = document.getElementById('project').value;
    const message = document.getElementById('message').value.trim();
    const btn     = document.getElementById('submitBtn');
    const aiBox   = document.getElementById('aiResponse');
    const aiText  = document.getElementById('aiText');
    const success = document.getElementById('successMsg');

    if (btn) { btn.disabled = true; btn.textContent = 'Pošiljam …'; }

    try {
      await fetch('https://formspree.io/f/mqewokoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, project, message })
      });
    } catch (err) { console.error(err); }

    const projectReplies = {
      'Aerialni video': 'aerialni video',
      'Aerialna fotografija': 'aerialna fotografija',
      'Nepremičnine': 'nepremičninske posnetke',
      'Pokrivanje dogodkov': 'pokrivanje dogodkov',
      'Promocijski video': 'promocijski video',
      'Pokrajina / Potovanja': 'pokrajino in potovanja'
    };
    const reply = `Živjo ${name}, hvala za tvoje sporočilo glede ${projectReplies[project] || 'tvojega projekta'}! Sporočilo je bilo prejeto in Luka ti bo osebno odgovoril v 24 urah.`;

    await new Promise(r => setTimeout(r, 500));
    if (aiBox) aiBox.style.display = 'block';
    if (aiText) {
      if (reducedMotion) {
        aiText.textContent = reply;
      } else {
        aiText.textContent = '';
        let i = 0;
        const t = setInterval(() => {
          aiText.textContent += reply[i++];
          if (i >= reply.length) clearInterval(t);
        }, 16);
      }
    }
    if (success) success.style.display = 'block';
    if (btn) btn.textContent = 'Sporočilo poslano ✓';
    contactForm.reset();
  });
}

/* ── 8. Rezervacijski obrazec ───────────────────────────────── */
const bDate = document.getElementById('bDate');
if (bDate) bDate.min = new Date().toISOString().split('T')[0];

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name  = document.getElementById('bName').value.trim();
    const email = document.getElementById('bEmail').value.trim();
    const date  = document.getElementById('bDate').value;
    const type  = document.getElementById('bType').value;
    const notesEl = document.getElementById('bNotes');
    const notes = notesEl ? notesEl.value.trim() : '';
    const btn   = document.getElementById('bookingBtn');

    if (!name || !email || !date || !type) {
      alert('Prosim izpolni vsa obvezna polja.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Pošiljam …'; }

    const dateFormatted = new Date(date).toLocaleDateString('sl-SI', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    try {
      const res = await fetch('https://formspree.io/f/mqewokoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name, email,
          subject: 'Rezervacija — ' + type,
          date: dateFormatted,
          project_type: type,
          notes: notes || 'Ni opomb'
        })
      });
      console.log('Booking sent:', res.status);
    } catch (err) {
      console.error('Booking error:', err);
    }

    const emailEl = document.getElementById('bookingEmail');
    if (emailEl) emailEl.textContent = email;
    bookingForm.style.display = 'none';
    const succ = document.getElementById('bookingSuccess');
    if (succ) succ.style.display = 'block';
    if (btn) { btn.disabled = false; btn.textContent = 'Rezerviraj'; }
  });
}

/* ── 9. Telemetrija — rahlo "dihanje" podatkov ──────────────── */
const hudAlt = document.getElementById('hudAlt');
const hudBat = document.getElementById('hudBat');
if ((hudAlt || hudBat) && !reducedMotion) {
  let alt = 124, bat = 94;
  setInterval(() => {
    alt += (Math.random() - 0.5) * 2;
    alt = Math.max(80, Math.min(150, alt));
    if (hudAlt) hudAlt.textContent = Math.round(alt) + ' m';
    if (Math.random() < 0.12 && bat > 62) bat -= 1;
    if (hudBat) hudBat.textContent = bat + '%';
  }, 2600);
}

/* ── 10. Na vrh + letnica ───────────────────────────────────── */
if (backToTop) backToTop.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
);
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();
