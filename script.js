'use strict';
/* ============================================================
   AltitudeLens — script.js  (3D Interactive Edition)
   ============================================================ */

/* ── 1. Page Loader ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 800);
  initThreeJS();
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

/* ── 3. THREE.JS — Particle field + Drone ───────────────────── */
function initThreeJS() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  /* Particles */
  const COUNT = 1800;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random()-0.5)*30;
    pos[i*3+1] = (Math.random()-0.5)*20;
    pos[i*3+2] = (Math.random()-0.5)*15;
    const b = 0.3 + Math.random()*0.7;
    col[i*3]=0; col[i*3+1]=b*0.78; col[i*3+2]=b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const particles = new THREE.Points(pGeo,
    new THREE.PointsMaterial({ size:0.06, vertexColors:true, transparent:true, opacity:0.85 }));
  scene.add(particles);

  /* Drone (primitives) */
  const droneGroup = new THREE.Group();
  const bodyMat   = new THREE.MeshPhongMaterial({ color:0x0a1628, emissive:0x001a33, specular:0x00c8ff, shininess:120 });
  const accentMat = new THREE.MeshPhongMaterial({ color:0x00c8ff, emissive:0x003a55, specular:0xffffff, shininess:200 });
  const wireMat   = new THREE.MeshPhongMaterial({ color:0x112244, specular:0x0088cc, shininess:80 });

  droneGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.12,0.28), bodyMat));

  const gimbal = new THREE.Mesh(new THREE.SphereGeometry(0.07,16,16), accentMat);
  gimbal.position.set(0,-0.1,0.05); droneGroup.add(gimbal);

  const led = new THREE.Mesh(new THREE.BoxGeometry(0.52,0.01,0.03), accentMat);
  led.position.set(0,-0.065,0); droneGroup.add(led);

  const rotors = [];
  [{ x:0.55,z:0.38 },{ x:-0.55,z:0.38 },{ x:0.55,z:-0.38 },{ x:-0.55,z:-0.38 }].forEach(({x,z}) => {
    const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.72,8), wireMat);
    a1.rotation.z = Math.PI/2; a1.position.set(x/2,0,z); droneGroup.add(a1);
    const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.8,8), wireMat);
    a2.rotation.x = Math.PI/2; a2.position.set(x,0,z/2); droneGroup.add(a2);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.08,12), accentMat);
    hub.position.set(x,0.04,z); droneGroup.add(hub);
    const rg = new THREE.Group(); rg.position.set(x,0.09,z);
    for (let b=0;b<2;b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.38,0.008,0.055),
        new THREE.MeshPhongMaterial({ color:0x1a2a44, transparent:true, opacity:0.85 }));
      blade.rotation.y = b*Math.PI/2; rg.add(blade);
    }
    rotors.push(rg); droneGroup.add(rg);
  });

  droneGroup.scale.setScalar(1.4);
  scene.add(droneGroup);

  /* Lights */
  scene.add(new THREE.AmbientLight(0x001a33, 1.5));
  const dl = new THREE.DirectionalLight(0x00c8ff, 3);
  dl.position.set(2,3,2); scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0x0044ff, 1.5);
  dl2.position.set(-3,-1,-2); scene.add(dl2);
  const pl = new THREE.PointLight(0x00c8ff, 2, 8);
  pl.position.set(0,1,2); scene.add(pl);

  /* Grid */
  const grid = new THREE.GridHelper(30,30,0x001a33,0x001a33);
  grid.position.y = -3; scene.add(grid);

  /* Mouse */
  let mx=0, my=0, tx=0, ty=0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX/window.innerWidth -0.5)*2;
    my = (e.clientY/window.innerHeight-0.5)*2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    tx += (mx-tx)*0.04; ty += (my-ty)*0.04;

    droneGroup.position.y = Math.sin(t*1.2)*0.12;
    droneGroup.rotation.x = ty*0.25 + Math.sin(t*0.7)*0.04;
    droneGroup.rotation.y = t*0.3  + tx*0.4;
    droneGroup.rotation.z = tx*0.1;

    rotors.forEach((r,i) => { r.rotation.y += i%2===0 ? 0.35 : -0.35; });

    particles.rotation.y = t*0.04 + tx*0.08;
    particles.rotation.x = ty*0.05;

    camera.position.x += (tx*0.3 - camera.position.x)*0.05;
    camera.position.y += (-ty*0.2 - camera.position.y)*0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  })();
}

/* ── 4. Hero mouse parallax ─────────────────────────────────── */
const heroContent = document.getElementById('heroContent');
const heroBg      = document.querySelector('.hero-video');

window.addEventListener('mousemove', e => {
  if (window.scrollY > window.innerHeight) return;
  const cx = e.clientX/window.innerWidth -0.5;
  const cy = e.clientY/window.innerHeight-0.5;
  if (heroBg)      heroBg.style.transform      = `scale(1.08) translate(${cx*18}px,${cy*10}px)`;
  if (heroContent) heroContent.style.transform = `translate(${cx*-12}px,${cy*-8}px)`;
});
window.addEventListener('scroll', () => {
  if (window.scrollY < window.innerHeight && heroContent)
    heroContent.style.transform = `translateY(${window.scrollY*0.22}px)`;
}, { passive:true });

/* ── 5. Scroll reveal ────────────────────────────────────────── */
new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); } });
}, { threshold:0.12 }).observe && document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); } });
  }, { threshold:0.12 }).observe(el);
});

/* ── 6. Counters ─────────────────────────────────────────────── */
let countersStarted = false;
new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = +el.dataset.target;
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts-start)/1800,1);
        el.textContent = Math.floor((1-(1-p)*(1-p))*target);
        if (p<1) requestAnimationFrame(step); else el.textContent=target;
      };
      requestAnimationFrame(step);
    });
  }
}, { threshold:0.4 }).observe(document.getElementById('stats'));

/* ── 7. 3D tilt on cards ─────────────────────────────────────── */
function addTilt(selector, maxAngle, zDepth) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width -0.5;
      const y = (e.clientY-r.top) /r.height-0.5;
      card.style.transform = `perspective(700px) rotateY(${x*maxAngle}deg) rotateX(${-y*maxAngle}deg) translateZ(${zDepth}px) scale(1.03)`;
      card.style.boxShadow = `${-x*22}px ${-y*22}px 45px rgba(0,200,255,0.18), 0 0 0 1px rgba(0,200,255,0.2)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform=''; card.style.boxShadow=''; });
  });
}
addTilt('.service-card', 18, 12);
addTilt('.category-card', 14, 16);
addTilt('.equipment-feature', 8, 10);

/* ── 8. Glitch effect on headline ───────────────────────────── */
const glitchEl = document.querySelector('.hero-headline');
if (glitchEl) {
  setInterval(() => {
    if (Math.random() > 0.92) {
      glitchEl.classList.add('glitch');
      setTimeout(() => glitchEl.classList.remove('glitch'), 150);
    }
  }, 2000);
}

/* ── 9. Gallery lightbox ─────────────────────────────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxTitle   = document.getElementById('lightboxTitle');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxThumbs  = document.getElementById('lightboxThumbs');

let galleryImages=[], currentIndex=0;

const getImages = cat =>
  [...document.querySelectorAll('#galleryData [data-category="'+cat+'"]')]
  .map(el=>({src:el.dataset.src, title:el.dataset.title}));

function buildThumbs() {
  lightboxThumbs.innerHTML='';
  galleryImages.forEach((img,i)=>{
    const t=document.createElement('div');
    t.className='lightbox-thumb'+(i===currentIndex?' active':'');
    t.innerHTML='<img src="'+img.src+'" alt="'+(img.title||'')+'" />';
    t.onclick=e=>{e.stopPropagation();showImage(i);};
    lightboxThumbs.appendChild(t);
  });
}

function showImage(i) {
  currentIndex=i;
  const img=galleryImages[i]; if(!img) return;
  lightboxImg.style.opacity='0';
  lightboxImg.src=img.src;
  lightboxImg.onload=()=>{ lightboxImg.style.opacity='1'; };
  lightboxCaption.textContent=(i+1)+' / '+galleryImages.length+(img.title?' · '+img.title:'');
  document.querySelectorAll('.lightbox-thumb').forEach((t,j)=>t.classList.toggle('active',j===i));
  lightboxThumbs.children[i]?.scrollIntoView({inline:'center',behavior:'smooth'});
  lightboxPrev.disabled=i===0;
  lightboxNext.disabled=i===galleryImages.length-1;
}

function openGallery(cat, label) {
  galleryImages=getImages(cat); if(!galleryImages.length) return;
  lightboxTitle.textContent=label;
  lightbox.classList.add('open');
  document.body.style.overflow='hidden';
  buildThumbs(); showImage(0);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow='';
  lightboxImg.src=''; lightboxThumbs.innerHTML='';
}

const catLabels={landscape:'Landscape / Nature',urban:'Urban / City'};
document.querySelectorAll('.category-card').forEach(card=>{
  card.addEventListener('click',()=>openGallery(card.dataset.category, catLabels[card.dataset.category]||card.dataset.category));
});
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', e=>{e.stopPropagation(); if(currentIndex>0) showImage(currentIndex-1);});
lightboxNext.addEventListener('click', e=>{e.stopPropagation(); if(currentIndex<galleryImages.length-1) showImage(currentIndex+1);});
lightbox.addEventListener('click', e=>{ if(e.target===lightbox) closeLightbox(); });
document.addEventListener('keydown', e=>{
  if(!lightbox.classList.contains('open')) return;
  if(e.key==='Escape') closeLightbox();
  if(e.key==='ArrowLeft'  && currentIndex>0) showImage(currentIndex-1);
  if(e.key==='ArrowRight' && currentIndex<galleryImages.length-1) showImage(currentIndex+1);
});

/* ── 10. Contact form ────────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', e=>{
  e.preventDefault();
  const n=document.getElementById('name').value.trim();
  const em=document.getElementById('email').value.trim();
  const p=document.getElementById('project').value;
  const m=document.getElementById('message').value.trim();
  window.location.href=`mailto:Kovacic.luka34@gmail.com?subject=${encodeURIComponent('Drone Project — '+p)}&body=${encodeURIComponent('Name: '+n+'\nEmail: '+em+'\nProject: '+p+'\n\n'+m)}`;
});

/* ── 11. Back to top & footer year ──────────────────────────── */
document.getElementById('backToTop').addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ── 12. HUD scanline ────────────────────────────────────────── */
const scanline = document.querySelector('.hud-scanline');
if (scanline) {
  let dir=1, p=50;
  setInterval(()=>{ p+=dir*0.05; if(p>55||p<45) dir*=-1; scanline.style.top=p+'%'; }, 30);
}
