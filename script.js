/* ============================================================
   AltitudeLens — script.js
   ============================================================ */

'use strict';

/* ── 1. Page Loader ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 600);
});

/* ── 2. Navbar: scroll style + mobile toggle ─────────────────── */
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
  navToggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── 3. Hero parallax ────────────────────────────────────────── */
const heroContent = document.getElementById('heroContent');
const heroSection = document.getElementById('hero');

window.addEventListener('scroll', () => {
  if (!heroSection || !heroContent) return;
  const scrolled = window.scrollY;
  const heroH    = heroSection.offsetHeight;
  if (scrolled < heroH) {
    // Subtle upward shift — content moves slower than scroll
    heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
  }
}, { passive: true });

/* ── 4. Scroll-reveal ────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // fire once
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── 5. Animated counters ────────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statsSection = document.getElementById('stats');
let countersStarted = false;

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
    });
    statsObserver.disconnect();
  }
}, { threshold: 0.4 });

if (statsSection) statsObserver.observe(statsSection);

/* ── 6. Category folder cards → Gallery lightbox ────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxTitle   = document.getElementById('lightboxTitle');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxThumbs  = document.getElementById('lightboxThumbs');

let galleryImages = []; // current category images
let currentIndex  = 0;

// Build image list from hidden gallery data
function getImages(category) {
  return [...document.querySelectorAll('#galleryData [data-category="' + category + '"]')]
    .map(el => ({ src: el.dataset.src, title: el.dataset.title }));
}

function buildThumbs() {
  lightboxThumbs.innerHTML = '';
  galleryImages.forEach((img, i) => {
    const t = document.createElement('div');
    t.className = 'lightbox-thumb' + (i === currentIndex ? ' active' : '');
    t.innerHTML = '<img src="' + img.src + '" alt="' + (img.title || '') + '" />';
    t.addEventListener('click', (e) => { e.stopPropagation(); showImage(i); });
    lightboxThumbs.appendChild(t);
  });
}

function showImage(index) {
  currentIndex = index;
  const img = galleryImages[currentIndex];
  if (!img) return;

  lightboxImg.style.opacity = '0';
  lightboxImg.src = img.src;
  lightboxImg.alt = img.title || '';
  lightboxImg.onload = () => { lightboxImg.style.opacity = '1'; };

  lightboxCaption.textContent = (currentIndex + 1) + ' / ' + galleryImages.length + (img.title ? '  ·  ' + img.title : '');

  // Update thumb strip
  document.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === currentIndex);
  });

  // Scroll active thumb into view
  const activeThumb = lightboxThumbs.children[currentIndex];
  if (activeThumb) activeThumb.scrollIntoView({ inline: 'center', behavior: 'smooth' });

  // Arrow states
  lightboxPrev.disabled = currentIndex === 0;
  lightboxNext.disabled = currentIndex === galleryImages.length - 1;
}

function openGallery(category, categoryLabel) {
  galleryImages = getImages(category);
  if (!galleryImages.length) return;

  lightboxTitle.textContent = categoryLabel;
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

function showPrev() { if (currentIndex > 0) showImage(currentIndex - 1); }
function showNext() { if (currentIndex < galleryImages.length - 1) showImage(currentIndex + 1); }

// Category card clicks
document.querySelectorAll('.category-card').forEach(card => {
  const labels = { landscape: 'Landscape / Nature', urban: 'Urban / City' };
  card.addEventListener('click', () => {
    openGallery(card.dataset.category, labels[card.dataset.category] || card.dataset.category);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPrev();
  if (e.key === 'ArrowRight') showNext();
});

/* ── 7. Contact form (mailto fallback) ──────────────────────── */
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name    = contactForm.querySelector('#name').value.trim();
  const email   = contactForm.querySelector('#email').value.trim();
  const project = contactForm.querySelector('#project').value;
  const message = contactForm.querySelector('#message').value.trim();

  // Compose mailto string — replace with Formspree when ready
  const subject = encodeURIComponent(`Drone Project Inquiry — ${project || 'General'}`);
  const body    = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nProject: ${project}\n\n${message}`
  );

  window.location.href = `mailto:Kovacic.luka34@gmail.com?subject=${subject}&body=${body}`;
});

/* ── 8. Back to top ─────────────────────────────────────────── */
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 9. Footer year ─────────────────────────────────────────── */
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ── 10. HUD scanline subtle drift ─────────────────────────── */
const scanline = document.querySelector('.hud-scanline');
if (scanline) {
  let dir = 1, pos = 50;
  setInterval(() => {
    pos += dir * 0.05;
    if (pos > 55 || pos < 45) dir *= -1;
    scanline.style.top = pos + '%';
  }, 30);
}

/* ── 11. Active nav link on scroll ─────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--text)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
