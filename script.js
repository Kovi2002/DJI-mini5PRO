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

/* ── 6. Portfolio filter ─────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      const cat = item.dataset.category;
      if (filter === 'all' || cat === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

/* ── 7. Lightbox with navigation ────────────────────────────── */
const lightbox      = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

let currentIndex = 0;
let visibleItems = [];

function getVisibleItems() {
  return [...document.querySelectorAll('.portfolio-item:not(.hidden)')];
}

function openLightbox(index) {
  visibleItems = getVisibleItems();
  currentIndex = index;
  const item = visibleItems[currentIndex];
  if (!item) return;

  lightboxImg.style.opacity = '0';
  lightboxImg.src = item.dataset.src;
  lightboxImg.alt = item.dataset.title || '';
  lightboxCaption.textContent = (item.dataset.caption || '') + (item.dataset.title ? ' — ' + item.dataset.title : '');

  lightboxImg.onload = () => { lightboxImg.style.opacity = '1'; };
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Show/hide arrows
  lightboxPrev.style.opacity = currentIndex === 0 ? '0.2' : '1';
  lightboxNext.style.opacity = currentIndex === visibleItems.length - 1 ? '0.2' : '1';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function showPrev() {
  if (currentIndex > 0) openLightbox(currentIndex - 1);
}

function showNext() {
  if (currentIndex < visibleItems.length - 1) openLightbox(currentIndex + 1);
}

// Attach click to each portfolio item
document.querySelectorAll('.portfolio-item').forEach((item, idx) => {
  item.addEventListener('click', () => {
    visibleItems = getVisibleItems();
    const visibleIdx = visibleItems.indexOf(item);
    if (item.dataset.src) openLightbox(visibleIdx);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showPrev();
  if (e.key === 'ArrowRight')  showNext();
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
