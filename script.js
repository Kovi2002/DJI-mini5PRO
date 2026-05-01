'use strict';
/* ============================================================
   AltitudeLens — script.js  (Stable Version)
   ============================================================ */

/* ── 0. Force scroll to top ─────────────────────────────────── */
window.history.replaceState(null, '', window.location.pathname);

/* ── 1. Page Loader ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 600);
});

/* ── 2. Navbar ──────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      if (navToggle) navToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

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
  if (heroContent && window.scrollY < window.innerHeight)
    heroContent.style.transform = `translateY(${window.scrollY * 0.22}px)`;
}, { passive: true });

/* ── 4. Scroll reveal ────────────────────────────────────────── */
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 }).observe(el);
});

/* ── 5. Animated counters ────────────────────────────────────── */
const statsSection = document.getElementById('stats');
let countersStarted = false;
if (statsSection) {
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
  }, { threshold: 0.4 }).observe(statsSection);
}

/* ── 6. Scroll progress bar ──────────────────────────────────── */
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

/* ── 7. Typing effect on hero ────────────────────────────────── */
const typingEl     = document.getElementById('typingText');
const typingCursor = document.getElementById('typingCursor');
if (typingEl) {
  const line1 = 'Cinematični drone posnetki';
  const line2 = 'iz nove perspektive';
  let i = 0;
  let phase = 1;

  setTimeout(() => {
    const type = () => {
      if (phase === 1) {
        if (i < line1.length) {
          typingEl.innerHTML = line1.slice(0, i+1) + '<span class="typing-cursor">|</span>';
          i++;
          setTimeout(type, 65);
        } else {
          typingEl.innerHTML = line1 + '<br><span class="headline-accent"></span><span class="typing-cursor">|</span>';
          phase = 2; i = 0;
          setTimeout(type, 300);
        }
      } else {
        const accentEl = typingEl.querySelector('.headline-accent');
        if (i < line2.length) {
          if (accentEl) accentEl.textContent = line2.slice(0, i+1);
          i++;
          setTimeout(type, 50);
        } else {
          // Hide cursor immediately when done
          const cur = typingEl.querySelector('.typing-cursor');
          if (cur) cur.remove();
        }
      }
    };
    type();
  }, 900);
}

/* ── 8. Particle canvas in hero ──────────────────────────────── */
const pCanvas = document.getElementById('particleCanvas');
if (pCanvas) {
  const ctx = pCanvas.getContext('2d');
  let W = pCanvas.width  = window.innerWidth;
  let H = pCanvas.height = pCanvas.parentElement.offsetHeight || window.innerHeight;

  window.addEventListener('resize', () => {
    W = pCanvas.width  = window.innerWidth;
    H = pCanvas.height = pCanvas.parentElement.offsetHeight || window.innerHeight;
  });

  const pts = Array.from({ length: 60 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.5 + 0.4,
    a: Math.random() * Math.PI * 2
  }));

  let mx = W/2, my = H/2;
  document.getElementById('hero').addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      const dx = mx - p.x, dy = my - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 160) { p.vx += dx/dist * 0.012; p.vy += dy/dist * 0.012; }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy; p.a += 0.01;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const alpha = 0.25 + Math.sin(p.a) * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,200,255,${alpha})`;
      ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,200,255,${0.12*(1-d/90)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  })();
}

/* ── 9. Custom cursor (desktop only) ─────────────────────────── */
if (window.innerWidth > 768) {
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (cursorDot && cursorRing) {
    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;

    window.addEventListener('mousemove', e => {
      dotX = e.clientX; dotY = e.clientY;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
    });

    (function animRing() {
      ringX += (dotX - ringX) * 0.12;
      ringY += (dotY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animRing);
    })();

    window.addEventListener('mousedown', () => {
      cursorDot.classList.add('clicked');
      cursorRing.classList.add('clicked');
    });
    window.addEventListener('mouseup', () => {
      cursorDot.classList.remove('clicked');
      cursorRing.classList.remove('clicked');
    });
    document.querySelectorAll('a, button, .service-card, .category-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }
}

/* ── 10. Category gallery lightbox ───────────────────────────── */
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
  if (!lightboxThumbs) return;
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
  if (lightboxCaption) lightboxCaption.textContent = (i+1) + ' / ' + galleryImages.length + (img.title ? '  ·  ' + img.title : '');
  document.querySelectorAll('.lightbox-thumb').forEach((t, j) => t.classList.toggle('active', j === i));
  lightboxThumbs.children[i]?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  if (lightboxPrev) lightboxPrev.disabled = i === 0;
  if (lightboxNext) lightboxNext.disabled = i === galleryImages.length - 1;
}

function openGallery(cat, label) {
  galleryImages = getImages(cat);
  if (!galleryImages.length) return;
  if (lightboxTitle) lightboxTitle.textContent = label;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  buildThumbs(); showImage(0);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
  if (lightboxThumbs) lightboxThumbs.innerHTML = '';
}

const catLabels = { landscape: 'Pokrajina / Narava', urban: 'Mestno / Urbano' };
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => openGallery(card.dataset.category, catLabels[card.dataset.category] || card.dataset.category));
});
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev)  lightboxPrev.addEventListener('click', e => { e.stopPropagation(); if (currentIndex > 0) showImage(currentIndex-1); });
if (lightboxNext)  lightboxNext.addEventListener('click', e => { e.stopPropagation(); if (currentIndex < galleryImages.length-1) showImage(currentIndex+1); });
if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft'  && currentIndex > 0) showImage(currentIndex-1);
  if (e.key === 'ArrowRight' && currentIndex < galleryImages.length-1) showImage(currentIndex+1);
});

/* ── 11. Contact form ─────────────────────────────────────────── */
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

    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

    try {
      await fetch('https://formspree.io/f/mqewokoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, project, message })
      });
    } catch(err) { console.error(err); }

    const projectReplies = {
      'Aerial Video': 'aerial video production', 'Aerial Photography': 'aerial photography',
      'Real Estate': 'real estate aerial shots', 'Event Coverage': 'event coverage',
      'Promotional Video': 'promotional video production', 'Landscape / Travel': 'landscape and travel content'
    };
    const reply = `Hi ${name}, thank you for reaching out about ${projectReplies[project] || 'your project'}! Your message has been received and Luka will personally get back to you within 24 hours.`;

    await new Promise(r => setTimeout(r, 600));
    if (aiBox) aiBox.style.display = 'block';
    if (aiText) {
      aiText.textContent = '';
      let i = 0;
      const t = setInterval(() => {
        aiText.textContent += reply[i++];
        if (i >= reply.length) clearInterval(t);
      }, 18);
    }
    if (success) success.style.display = 'block';
    if (btn) btn.textContent = 'Message sent ✓';
    contactForm.reset();
  });
}

/* ── 12. Booking form ────────────────────────────────────────── */
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
    const notes = document.getElementById('bNotes').value.trim();
    const btn   = document.getElementById('bookingBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    const dateFormatted = new Date(date).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    try {
      await fetch('https://formspree.io/f/mqewokoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, subject: 'Booking — ' + type, date: dateFormatted, project_type: type, notes: notes || 'None' })
      });
    } catch(err) { console.error(err); }
    const emailEl = document.getElementById('bookingEmail');
    if (emailEl) emailEl.textContent = email;
    bookingForm.style.display = 'none';
    const succ = document.getElementById('bookingSuccess');
    if (succ) succ.style.display = 'block';
  });
}

/* ── 13. HUD scanline ────────────────────────────────────────── */
const scanline = document.querySelector('.hud-scanline');
if (scanline) {
  let dir = 1, pos = 50;
  setInterval(() => { pos += dir * 0.05; if (pos > 55 || pos < 45) dir *= -1; scanline.style.top = pos + '%'; }, 30);
}

/* ── 14. Back to top & footer year ──────────────────────────── */
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ── HUD animated data ───────────────────────────────────────── */
const hudAlt = document.getElementById('hudAlt');
const hudBat = document.getElementById('hudBat');
if (hudAlt && hudBat) {
  let alt = 124, bat = 94, altDir = 1;
  setInterval(() => {
    // Altitude fluctuates
    alt += altDir * (Math.random() * 2);
    if (alt > 135 || alt < 115) altDir *= -1;
    hudAlt.textContent = Math.round(alt).toString().padStart(4,'0') + 'm';
    // Battery slowly drains
    if (Math.random() > 0.97 && bat > 80) bat -= 1;
    hudBat.textContent = bat + '%';
  }, 1200);
}

/* ── Animated grid perspective on scroll ────────────────────── */
window.addEventListener('scroll', () => {
  const grid = document.querySelector('body::after');
  // Grid moves via CSS animation — no JS needed
}, { passive: true });
