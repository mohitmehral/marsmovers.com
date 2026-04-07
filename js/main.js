// Mars Movers — Commercial Site Engine
// Three.js hero, scroll reveals, counter animations, live data

// === THREE.JS HERO — Mars Globe + Starfield ===
(function initHero() {
  const container = document.getElementById('hero-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
  camera.position.set(3, 1, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 100;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, sizeAttenuation: true });
  scene.add(new THREE.Points(starGeo, starMat));

  // Mars sphere
  const marsGeo = new THREE.SphereGeometry(1.8, 64, 64);
  const marsMat = new THREE.MeshStandardMaterial({
    color: 0xc0441e,
    roughness: 0.85,
    metalness: 0.1,
    emissive: 0x1a0500,
    emissiveIntensity: 0.3
  });
  const mars = new THREE.Mesh(marsGeo, marsMat);
  mars.position.set(2.5, 0, -2);
  scene.add(mars);

  // Surface detail — bump via noise-like displacement
  const detailGeo = new THREE.SphereGeometry(1.82, 64, 64);
  const detailMat = new THREE.MeshStandardMaterial({
    color: 0x8b3a1a,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.3,
    wireframe: true
  });
  const detail = new THREE.Mesh(detailGeo, detailMat);
  detail.position.copy(mars.position);
  scene.add(detail);

  // Atmosphere glow
  const atmosGeo = new THREE.SphereGeometry(1.95, 32, 32);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0xff5014,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide
  });
  const atmos = new THREE.Mesh(atmosGeo, atmosMat);
  atmos.position.copy(mars.position);
  scene.add(atmos);

  // Polar cap
  const capGeo = new THREE.SphereGeometry(1.81, 32, 16, 0, Math.PI * 2, 0, 0.4);
  const capMat = new THREE.MeshStandardMaterial({ color: 0xdde8f0, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.5 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.copy(mars.position);
  scene.add(cap);

  // Lights
  const sun = new THREE.DirectionalLight(0xffeedd, 2);
  sun.position.set(-5, 3, 5);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x331100, 0.8));

  // Orbit ring (data relay visualization)
  const orbitGeo = new THREE.TorusGeometry(2.8, 0.008, 8, 128);
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0xff5014, transparent: true, opacity: 0.2 });
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.position.copy(mars.position);
  orbit.rotation.x = Math.PI / 2.5;
  scene.add(orbit);

  // Satellite dots on orbit
  const satGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const satMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const sats = [];
  for (let i = 0; i < 5; i++) {
    const sat = new THREE.Mesh(satGeo, satMat);
    sat.userData.angle = (i / 5) * Math.PI * 2;
    sat.userData.speed = 0.3 + Math.random() * 0.2;
    scene.add(sat);
    sats.push(sat);
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  function onResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }
  window.addEventListener('resize', onResize);

  let frame = 0;
  function animate() {
    frame++;
    mars.rotation.y += 0.001;
    detail.rotation.y += 0.001;
    cap.rotation.y += 0.001;
    orbit.rotation.z += 0.002;

    // Satellites
    sats.forEach(sat => {
      sat.userData.angle += sat.userData.speed * 0.01;
      const a = sat.userData.angle;
      const r = 2.8;
      sat.position.set(
        mars.position.x + Math.cos(a) * r,
        mars.position.y + Math.sin(a) * r * Math.sin(orbit.rotation.x),
        mars.position.z + Math.sin(a) * r * Math.cos(orbit.rotation.x)
      );
    });

    // Subtle camera follow mouse
    camera.position.x += (3 + mouseX * 0.8 - camera.position.x) * 0.02;
    camera.position.y += (1 + mouseY * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(mars.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

// === SCROLL REVEAL ===
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// === COUNTER ANIMATION ===
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease out quart
      const current = target * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();

// === LIVE MARS DISTANCE ===
(function initLiveData() {
  function getMarsDistance() {
    const a = (Date.now() / 1000 / (686.97 * 86400)) * 2 * Math.PI;
    return (225 + 170 * Math.sin(a)).toFixed(1);
  }
  const el = document.getElementById('mars-dist');
  if (el) {
    el.textContent = getMarsDistance();
    setInterval(() => { el.textContent = getMarsDistance(); }, 5000);
  }

  // Launch window countdown
  function getLaunchDays() {
    const d = Math.ceil((new Date('2026-11-01') - new Date()) / 86400000);
    return d > 0 ? d : 0;
  }
  const launchEl = document.getElementById('launch-days');
  if (launchEl) launchEl.textContent = getLaunchDays();
})();

// === NAV SCROLL EFFECT ===
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile nav if open
        document.getElementById('mobile-nav')?.classList.remove('open');
      }
    });
  });
})();

// === MOBILE NAV ===
window.openMobileNav = function() {
  document.getElementById('mobile-nav')?.classList.add('open');
};
window.closeMobileNav = function() {
  document.getElementById('mobile-nav')?.classList.remove('open');
};

// === CTA FORM ===
(function initForm() {
  const form = document.getElementById('cta-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (!email) return;
    const btn = form.querySelector('button');
    btn.textContent = '✓ RECEIVED';
    btn.style.background = '#00ff88';
    btn.style.color = '#000';
    setTimeout(() => {
      btn.textContent = 'REQUEST ACCESS';
      btn.style.background = '';
      btn.style.color = '';
      form.reset();
    }, 3000);
    // Track
    if (typeof gtag === 'function') gtag('event', 'request_access', { email_domain: email.split('@')[1] });
  });
})();
