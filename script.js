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

/* ── 6. Portfolio lightbox ───────────────────────────────────── */
const lightbox      = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxVideo = document.getElementById('lightboxVideo');

function openLightbox(type, src) {
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (type === 'image') {
    lightboxImg.src = src;
    lightboxImg.classList.add('active');
    lightboxVideo.classList.remove('active');
    lightboxVideo.pause();
  } else {
    lightboxVideo.querySelector('source').src = src;
    lightboxVideo.load();
    lightboxVideo.classList.add('active');
    lightboxImg.classList.remove('active');
  }
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxVideo.pause();
  lightboxImg.src = '';
  lightboxImg.classList.remove('active');
  lightboxVideo.classList.remove('active');
}

// Attach click to each portfolio item
document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('click', () => {
    const type = item.dataset.type;
    const src  = item.dataset.src;
    // Only open lightbox if the src exists (placeholder check)
    if (src && src !== '') openLightbox(type, src);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
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

  window.location.href = `mailto:your@email.com?subject=${subject}&body=${body}`;
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
