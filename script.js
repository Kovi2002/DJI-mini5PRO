'use strict';
/* ============================================================
   AltitudeLens — script.js
   ============================================================ */

/* ── 0. Force scroll to top on page load ────────────────────── */
if (window.location.hash) {
  window.location.hash = '';
}
window.history.replaceState(null, '', window.location.pathname);
window.scrollTo(0, 0);

/* ── 1. Page Loader ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  window.scrollTo(0, 0);
  setTimeout(() => loader.classList.add('hidden'), 600);
});

/* ── 2. Navbar ──────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ── 3. Hero parallax ────────────────────────────────────────── */
const heroContent = document.getElementById('heroContent');
const heroBg      = document.querySelector('.hero-video');

window.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const cx = e.clientX / window.innerWidth  - 0.5;
  const cy = e.clientY / window.innerHeight - 0.5;
  if (heroBg)      heroBg.style.transform      = `scale(1.08) translate(${cx * 18}px, ${cy * 10}px)`;
  if (heroContent) heroContent.style.transform = `translate(${cx * -12}px, ${cy * -8}px)`;
});

window.addEventListener('scroll', () => {
  if (window.scrollY < window.innerHeight && heroContent)
    heroContent.style.transform = `translateY(${window.scrollY * 0.22}px)`;
}, { passive: true });

/* ── 4. Scroll reveal ────────────────────────────────────────── */
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 }).observe(el);
});

/* ── 5. Animated counters ────────────────────────────────────── */
let countersStarted = false;
new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = +el.dataset.target;
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1800, 1);
        el.textContent = Math.floor((1 - (1-p)*(1-p)) * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    });
  }
}, { threshold: 0.4 }).observe(document.getElementById('stats'));

/* ── 6. Category gallery lightbox ────────────────────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxTitle   = document.getElementById('lightboxTitle');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxThumbs  = document.getElementById('lightboxThumbs');

let galleryImages = [], currentIndex = 0;

const getImages = cat =>
  [...document.querySelectorAll('#galleryData [data-category="' + cat + '"]')]
  .map(el => ({ src: el.dataset.src, title: el.dataset.title }));

function buildThumbs() {
  lightboxThumbs.innerHTML = '';
  galleryImages.forEach((img, i) => {
    const t = document.createElement('div');
    t.className = 'lightbox-thumb' + (i === currentIndex ? ' active' : '');
    t.innerHTML = '<img src="' + img.src + '" alt="' + (img.title || '') + '" />';
    t.onclick = e => { e.stopPropagation(); showImage(i); };
    lightboxThumbs.appendChild(t);
  });
}

function showImage(i) {
  currentIndex = i;
  const img = galleryImages[i]; if (!img) return;
  lightboxImg.style.opacity = '0';
  lightboxImg.src = img.src;
  lightboxImg.onload = () => { lightboxImg.style.opacity = '1'; };
  lightboxCaption.textContent = (i + 1) + ' / ' + galleryImages.length + (img.title ? '  ·  ' + img.title : '');
  document.querySelectorAll('.lightbox-thumb').forEach((t, j) => t.classList.toggle('active', j === i));
  lightboxThumbs.children[i]?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  lightboxPrev.disabled = i === 0;
  lightboxNext.disabled = i === galleryImages.length - 1;
}

function openGallery(cat, label) {
  galleryImages = getImages(cat);
  if (!galleryImages.length) return;
  lightboxTitle.textContent = label;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  buildThumbs();
  showImage(0);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
  lightboxThumbs.innerHTML = '';
}

const catLabels = { landscape: 'Landscape / Nature', urban: 'Urban / City' };
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => openGallery(card.dataset.category, catLabels[card.dataset.category] || card.dataset.category));
});
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', e => { e.stopPropagation(); if (currentIndex > 0) showImage(currentIndex - 1); });
lightboxNext.addEventListener('click', e => { e.stopPropagation(); if (currentIndex < galleryImages.length - 1) showImage(currentIndex + 1); });
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft'  && currentIndex > 0) showImage(currentIndex - 1);
  if (e.key === 'ArrowRight' && currentIndex < galleryImages.length - 1) showImage(currentIndex + 1);
});

/* ── 7. Contact form ─────────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const n  = document.getElementById('name').value.trim();
  const em = document.getElementById('email').value.trim();
  const p  = document.getElementById('project').value;
  const m  = document.getElementById('message').value.trim();
  window.location.href = `mailto:Kovacic.luka34@gmail.com?subject=${encodeURIComponent('Drone Project — ' + p)}&body=${encodeURIComponent('Name: ' + n + '\nEmail: ' + em + '\nProject: ' + p + '\n\n' + m)}`;
});

/* ── 8. Back to top & footer year ────────────────────────────── */
document.getElementById('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ── 9. HUD scanline ─────────────────────────────────────────── */
const scanline = document.querySelector('.hud-scanline');
if (scanline) {
  let dir = 1, pos = 50;
  setInterval(() => { pos += dir * 0.05; if (pos > 55 || pos < 45) dir *= -1; scanline.style.top = pos + '%'; }, 30);
}

/* ── Booking form ────────────────────────────────────────────── */
// Set minimum date to today
const bDate = document.getElementById('bDate');
if (bDate) {
  const today = new Date().toISOString().split('T')[0];
  bDate.min = today;
}

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name  = document.getElementById('bName').value.trim();
    const email = document.getElementById('bEmail').value.trim();
    const date  = document.getElementById('bDate').value;
    const type  = document.getElementById('bType').value;
    const notes = document.getElementById('bNotes').value.trim();
    const btn   = document.getElementById('bookingBtn');

    btn.disabled = true;
    btn.textContent = 'Sending...';

    // Format date nicely
    const dateFormatted = new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Send to Formspree
    try {
      await fetch('https://formspree.io/f/mqewokoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name, email,
          subject: 'Booking Request — ' + type,
          date: dateFormatted,
          project_type: type,
          notes: notes || 'None'
        })
      });
    } catch(err) {
      console.error('Booking error:', err);
    }

    // Show success
    document.getElementById('bookingEmail').textContent = email;
    bookingForm.style.display = 'none';
    document.getElementById('bookingSuccess').style.display = 'block';
  });
}
