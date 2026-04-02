// Mars Approach — Full Mission Game Engine
// 5 asteroid levels + level 6 = landing redirect
// ~7 minutes total, speed increases each level

var canvas = document.getElementById('c'), ctx = canvas.getContext('2d');
var W, H;

// === 5 APPROACH ZONES ===
var LEVELS = [
  { name:'Outer Belt',       desc:'Light debris — warm up',           dur:70,  spawnRate:50, rockSpd:1.0, rockMax:22, sideChance:0.05, ammoRefill:4, speedMult:1.0, bgTint:[0,0,0] },
  { name:'Dense Field',      desc:'Heavier traffic — stay sharp',     dur:75,  spawnRate:38, rockSpd:1.4, rockMax:26, sideChance:0.10, ammoRefill:3, speedMult:1.3, bgTint:[5,0,0] },
  { name:'Debris Storm',     desc:'Fragments everywhere — shoot!',    dur:80,  spawnRate:28, rockSpd:1.8, rockMax:28, sideChance:0.15, ammoRefill:3, speedMult:1.6, bgTint:[10,2,0] },
  { name:'Gravity Well',     desc:'Rocks pulled toward you',          dur:85,  spawnRate:22, rockSpd:2.2, rockMax:30, sideChance:0.20, ammoRefill:2, speedMult:2.0, bgTint:[15,4,2] },
  { name:'Mars Orbit Entry', desc:'Final push — maximum intensity',   dur:90,  spawnRate:16, rockSpd:2.8, rockMax:32, sideChance:0.25, ammoRefill:2, speedMult:2.5, bgTint:[20,6,3] }
];
var TOTAL_DIST = 225; // million km

// === GAME STATE ===
var ship, rocks, bullets, stars, particles, ammoCoins;
var score, lives, level, frame, kills, ammo, running, raf;
var levelTimer, levelFrame, gameTime;
var totalPts = parseInt(localStorage.getItem('mm_pts') || '0');
var best = parseInt(localStorage.getItem('mm_best') || '0');
var keys = {}, lastTap = 0, touchDx = 0, touchDy = 0;

document.getElementById('nav-pts').textContent = totalPts + ' pts';
if (best > 0) document.getElementById('h-kills').textContent = best;

// === AUDIO ===
var audioCtx = null;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function snd(freq, dur, vol, type) {
  initAudio();
  var o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type || 'sine'; o.frequency.value = freq; g.gain.value = vol || 0.04;
  o.connect(g); g.connect(audioCtx.destination);
  g.gain.setTargetAtTime(0, audioCtx.currentTime + dur * 0.6, dur * 0.3);
  o.start(); o.stop(audioCtx.currentTime + dur);
}

// === RESIZE ===
function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
window.addEventListener('resize', resize);
resize();

// === INIT ===
function initGame() {
  ship = { x: W / 2, y: H - 100, spd: 5, dx: 0, dy: 0, inv: 0 };
  rocks = []; bullets = []; stars = []; particles = []; ammoCoins = [];
  score = 0; lives = 3; level = 0; frame = 0; kills = 0; ammo = 12; gameTime = 0;
  levelTimer = 0; levelFrame = 0;
  for (var i = 0; i < 160; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      spd: Math.random() * 0.3 + 0.1,
      o: Math.random() * 0.5 + 0.15,
      layer: Math.floor(Math.random() * 3)
    });
  }
  showLevelBanner();
  updateHUD();
}

// === LEVEL BANNER ===
function showLevelBanner() {
  var lv = LEVELS[level];
  var el = document.getElementById('level-banner');
  document.getElementById('lb-zone').textContent = 'Zone ' + (level + 1) + ' of 6';
  document.getElementById('lb-name').textContent = lv.name;
  document.getElementById('lb-desc').textContent = lv.desc;
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); }, 2500);
  snd(440, 0.1, 0.04); setTimeout(function() { snd(660, 0.15, 0.04); }, 120);
}

// === SPAWN ROCK ===
function spawnRock() {
  var lv = LEVELS[level];
  var r = Math.random() * lv.rockMax * 0.6 + lv.rockMax * 0.4;
  var fromSide = Math.random() < lv.sideChance;
  var x, y, vx, vy;
  if (fromSide) {
    x = Math.random() < 0.5 ? -r : W + r;
    y = Math.random() * H * 0.5;
    vx = (x < 0 ? 1 : -1) * (Math.random() * 0.8 + 0.4) * lv.rockSpd;
    vy = (Math.random() * 0.8 + 0.3) * lv.rockSpd;
  } else {
    x = Math.random() * (W - r * 2) + r;
    y = -r;
    vx = (Math.random() - 0.5) * 0.6 * lv.rockSpd;
    vy = (Math.random() * 1.2 + 0.6) * lv.rockSpd;
  }
  // Level 4 (Gravity Well) — rocks curve toward ship
  var gravTarget = level === 3 ? true : false;
  rocks.push({ x: x, y: y, r: r, vx: vx, vy: vy, rot: 0, rs: (Math.random() - 0.5) * 0.06, hp: r > 20 ? 2 : 1, sides: Math.floor(Math.random() * 3) + 6, grav: gravTarget });
}

// === DRAW STARSHIP ===
function drawStarship() {
  if (ship.inv > 0 && Math.floor(frame / 4) % 2 === 0) return;
  var sw = 12, sh = 42;
  ctx.save(); ctx.translate(ship.x, ship.y);
  // Fuselage
  ctx.fillStyle = '#d0d0d0';
  ctx.beginPath();
  ctx.moveTo(-sw, -sh / 2); ctx.quadraticCurveTo(-sw - 2, -sh / 2 - 8, 0, -sh / 2 - 16);
  ctx.quadraticCurveTo(sw + 2, -sh / 2 - 8, sw, -sh / 2);
  ctx.lineTo(sw, sh / 2); ctx.lineTo(-sw, sh / 2); ctx.closePath(); ctx.fill();
  // Heat shield
  ctx.fillStyle = '#222'; ctx.fillRect(-sw, sh / 2 - 10, sw * 2, 8);
  // Nose
  ctx.fillStyle = '#ff5014';
  ctx.beginPath(); ctx.moveTo(-7, -sh / 2); ctx.quadraticCurveTo(0, -sh / 2 - 20, 7, -sh / 2); ctx.fill();
  // Windows
  ctx.fillStyle = 'rgba(100,200,255,.8)';
  ctx.beginPath(); ctx.arc(0, -sh / 2 + 6, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -sh / 2 + 13, 2, 0, Math.PI * 2); ctx.fill();
  // Fins
  ctx.fillStyle = '#999';
  ctx.beginPath(); ctx.moveTo(-sw, sh / 2 - 6); ctx.lineTo(-sw - 8, sh / 2 + 4); ctx.lineTo(-sw, sh / 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(sw, sh / 2 - 6); ctx.lineTo(sw + 8, sh / 2 + 4); ctx.lineTo(sw, sh / 2); ctx.fill();
  // Engine flames — scale with speed
  var lv = LEVELS[level];
  var fl = (10 + Math.random() * 12) * (0.8 + lv.speedMult * 0.3);
  ctx.fillStyle = 'rgba(255,200,50,.85)';
  ctx.beginPath(); ctx.moveTo(-7, sh / 2); ctx.lineTo(7, sh / 2); ctx.lineTo(0, sh / 2 + fl); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,100,20,.4)';
  ctx.beginPath(); ctx.moveTo(-4, sh / 2); ctx.lineTo(4, sh / 2); ctx.lineTo(0, sh / 2 + fl * 0.6); ctx.closePath(); ctx.fill();
  // Side thrusters
  if (ship.dx !== 0) {
    ctx.fillStyle = 'rgba(100,180,255,.5)';
    var side = ship.dx > 0 ? -1 : 1;
    ctx.beginPath(); ctx.moveTo(side * sw, 0); ctx.lineTo(side * (sw + 6), -2); ctx.lineTo(side * (sw + 6), 2); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// === DRAW ROCK ===
function drawRock(a) {
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
  ctx.strokeStyle = a.hp > 1 ? 'rgba(200,140,80,.9)' : 'rgba(180,120,70,.7)';
  ctx.fillStyle = a.hp > 1 ? 'rgba(90,55,30,.7)' : 'rgba(70,45,25,.5)';
  ctx.lineWidth = a.hp > 1 ? 2 : 1.5;
  ctx.beginPath();
  for (var i = 0; i < a.sides; i++) {
    var ang = (i / a.sides) * Math.PI * 2, jit = a.r * (0.7 + Math.sin(i * 2.7) * 0.2);
    i === 0 ? ctx.moveTo(Math.cos(ang) * jit, Math.sin(ang) * jit) : ctx.lineTo(Math.cos(ang) * jit, Math.sin(ang) * jit);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  if (a.hp === 1 && a.r > 15) {
    ctx.strokeStyle = 'rgba(255,100,50,.3)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(-a.r * 0.3, -a.r * 0.2); ctx.lineTo(a.r * 0.2, a.r * 0.3); ctx.stroke();
  }
  ctx.restore();
}

// === DRAW BULLET ===
function drawBullet(b) {
  ctx.fillStyle = 'rgba(100,200,255,.9)'; ctx.fillRect(b.x - 1.5, b.y - 6, 3, 12);
  ctx.fillStyle = 'rgba(100,200,255,.3)'; ctx.fillRect(b.x - 3, b.y - 4, 6, 8);
}

// === PARTICLES ===
function spawnPx(x, y, count, color) {
  for (var i = 0; i < count; i++) {
    var ang = Math.random() * Math.PI * 2, spd = Math.random() * 3 + 1;
    particles.push({ x: x, y: y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 30 + Math.random() * 20, ml: 50, r: Math.random() * 2 + 1, c: color || '#ff8844' });
  }
}

// === SHOOT ===
function shoot() {
  if (ammo <= 0 || !running) return;
  ammo--;
  bullets.push({ x: ship.x, y: ship.y - 27, vy: -11 });
  snd(800, 0.07, 0.03, 'square');
}

// === HIT CHECK ===
function hitShip(a) {
  var dx = ship.x - a.x, dy = ship.y - a.y;
  return Math.sqrt(dx * dx + dy * dy) < a.r + 16;
}

// === UPDATE HUD ===
function updateHUD() {
  document.getElementById('h-score').textContent = score;
  document.getElementById('h-level').textContent = (level + 1) + '/6';
  document.getElementById('h-speed').textContent = LEVELS[Math.min(level, 4)].speedMult.toFixed(1) + 'x';
  document.getElementById('h-ammo').textContent = ammo;
  document.getElementById('h-kills').textContent = kills;
  var l = '';
  for (var i = 0; i < 3; i++) l += '<span style="opacity:' + (i < lives ? 1 : .15) + '">🚀</span>';
  document.getElementById('h-lives').innerHTML = l;
  document.getElementById('nav-level').textContent = 'Level ' + (level + 1);
}

// === DISTANCE BAR ===
function updateDist() {
  var totalDur = 0, elapsed = 0;
  for (var i = 0; i < LEVELS.length; i++) {
    totalDur += LEVELS[i].dur * 60;
    if (i < level) elapsed += LEVELS[i].dur * 60;
  }
  elapsed += levelFrame;
  var pct = Math.min(100, (elapsed / totalDur) * 100);
  document.getElementById('dist-fill').style.width = pct + '%';
  document.getElementById('dist-ship').style.left = pct + '%';
  var kmLeft = Math.floor(TOTAL_DIST * (1 - pct / 100));
  document.getElementById('dist-km').textContent = kmLeft + 'M km';
  document.getElementById('dist-speed').textContent = LEVELS[Math.min(level, 4)].speedMult.toFixed(1) + 'x';
}

// === MAIN LOOP ===
function loop() {
  var lv = LEVELS[Math.min(level, 4)];
  frame++; levelFrame++;
  gameTime = frame / 60;

  // Background — tinted per level
  var bg = lv.bgTint;
  ctx.fillStyle = 'rgb(' + bg[0] + ',' + bg[1] + ',' + bg[2] + ')';
  ctx.fillRect(0, 0, W, H);

  // Stars — speed scales with level
  var starSpeedMult = lv.speedMult;
  stars.forEach(function(s) {
    s.y += (s.layer + 1) * 0.15 * starSpeedMult + 0.1;
    if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
    ctx.fillStyle = 'rgba(255,255,255,' + s.o.toFixed(2) + ')';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  });

  score = Math.floor(frame / 6);

  // Level progression — time-based
  var lvDurFrames = lv.dur * 60;
  if (levelFrame >= lvDurFrames) {
    level++;
    levelFrame = 0;
    if (level >= 5) {
      // All 5 asteroid levels done — go to landing
      approachComplete();
      return;
    }
    showLevelBanner();
    // Ammo refill on level change
    ammo = Math.min(ammo + LEVELS[level].ammoRefill, 18);
  }

  // Spawn rocks
  var rate = Math.max(12, lv.spawnRate - Math.floor(levelFrame / 600));
  if (frame % rate === 0) spawnRock();
  // Ammo trickle every 12 seconds
  if (levelFrame % (60 * 12) === 0 && levelFrame > 0 && ammo < 15) { ammo += 2; }

  // Input
  ship.dx = 0; ship.dy = 0;
  if (keys['ArrowLeft'] || keys['a']) ship.dx = -ship.spd;
  if (keys['ArrowRight'] || keys['d']) ship.dx = ship.spd;
  if (keys['ArrowUp'] || keys['w']) ship.dy = -ship.spd * 0.7;
  if (keys['ArrowDown'] || keys['s']) ship.dy = ship.spd * 0.7;
  // Apply touch input
  if (touchDx !== 0) ship.dx = touchDx;
  if (touchDy !== 0) ship.dy = touchDy;
  ship.x = Math.max(20, Math.min(W - 20, ship.x + ship.dx));
  ship.y = Math.max(60, Math.min(H - 40, ship.y + ship.dy));
  if (ship.inv > 0) ship.inv--;

  // Bullets
  for (var bi = bullets.length - 1; bi >= 0; bi--) {
    var b = bullets[bi]; b.y += b.vy;
    if (b.y < -10) { bullets.splice(bi, 1); ammo = Math.max(0, ammo - 1); continue; }
    drawBullet(b);
    for (var ri = rocks.length - 1; ri >= 0; ri--) {
      var a = rocks[ri];
      var dx = b.x - a.x, dy = b.y - a.y;
      if (Math.sqrt(dx * dx + dy * dy) < a.r + 4) {
        bullets.splice(bi, 1);
        a.hp--;
        if (a.hp <= 0) {
          spawnPx(a.x, a.y, 12, '#ff8844');
          spawnPx(a.x, a.y, 6, '#ffcc44');
          if (a.r > 18) {
            for (var s = 0; s < 2; s++) {
              rocks.push({ x: a.x + (s === 0 ? -10 : 10), y: a.y, r: a.r * 0.5, vx: (Math.random() - 0.5) * 2, vy: a.vy * 0.8 + Math.random(), rot: 0, rs: (Math.random() - 0.5) * 0.1, hp: 1, sides: 6, grav: false });
            }
          }
          rocks.splice(ri, 1); kills++; score += 10;
          snd(200, 0.12, 0.05, 'sawtooth');
        } else {
          spawnPx(a.x, a.y, 5, '#ffaa44');
          snd(300, 0.06, 0.03, 'triangle');
        }
        break;
      }
    }
  }

  // Rocks
  for (var i = rocks.length - 1; i >= 0; i--) {
    var a = rocks[i];
    // Gravity well — rocks curve toward ship
    if (a.grav) {
      var gdx = ship.x - a.x, gdy = ship.y - a.y;
      var gd = Math.sqrt(gdx * gdx + gdy * gdy);
      if (gd > 30) { a.vx += (gdx / gd) * 0.02; a.vy += (gdy / gd) * 0.02; }
    }
    a.x += a.vx; a.y += a.vy; a.rot += a.rs;
    if (a.y > H + a.r + 20 || a.x < -a.r - 60 || a.x > W + a.r + 60) { rocks.splice(i, 1); continue; }
    drawRock(a);
    if (ship.inv === 0 && hitShip(a)) {
      rocks.splice(i, 1); lives--; ship.inv = 80;
      spawnPx(ship.x, ship.y, 10, '#ff3333');
      snd(120, 0.3, 0.07, 'sawtooth');
      updateHUD();
      if (lives <= 0) { endGame(); return; }
    }
  }

  // Particles
  for (var pi = particles.length - 1; pi >= 0; pi--) {
    var p = particles[pi]; p.x += p.vx; p.y += p.vy; p.life--; p.vx *= 0.97; p.vy *= 0.97;
    if (p.life <= 0) { particles.splice(pi, 1); continue; }
    ctx.globalAlpha = p.life / p.ml;
    ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Mars glow — grows over time
  var totalPct = 0;
  for (var ti = 0; ti < level; ti++) totalPct += LEVELS[ti].dur;
  totalPct = ((totalPct * 60 + levelFrame) / (400 * 60)) * 100;
  var glow = document.getElementById('mars-glow');
  var gs = 200 + totalPct * 5;
  glow.style.width = gs + 'px'; glow.style.height = gs + 'px';
  glow.style.bottom = (-200 + totalPct * 2.5) + 'px';
  glow.style.opacity = (0.2 + totalPct * 0.008).toFixed(2);

  // === AMMO COINS ===
  // Spawn every 15-25 seconds, values: 20, 30, 40 ammo
  if (frame % (60 * 18) === 0 && frame > 300) {
    var coinVal = [20, 30, 40][Math.floor(Math.random() * 3)];
    ammoCoins.push({
      x: Math.random() * (W - 60) + 30,
      y: -20,
      vy: 0.8 + Math.random() * 0.5,
      val: coinVal,
      age: 0
    });
  }
  // Update & draw ammo coins
  for (var ci = ammoCoins.length - 1; ci >= 0; ci--) {
    var ac = ammoCoins[ci];
    ac.y += ac.vy;
    ac.age++;
    if (ac.y > H + 20) { ammoCoins.splice(ci, 1); continue; }
    // Bob
    var bobX = ac.x + Math.sin(ac.age * 0.05) * 8;
    // Draw
    var cSize = ac.val >= 40 ? 16 : ac.val >= 30 ? 14 : 12;
    // Glow
    ctx.fillStyle = 'rgba(50,200,255,0.12)';
    ctx.beginPath(); ctx.arc(bobX, ac.y, cSize + 8, 0, Math.PI * 2); ctx.fill();
    // Body
    ctx.fillStyle = ac.val >= 40 ? 'rgba(50,220,255,0.9)' : ac.val >= 30 ? 'rgba(80,200,240,0.85)' : 'rgba(100,180,220,0.8)';
    ctx.beginPath(); ctx.arc(bobX, ac.y, cSize, 0, Math.PI * 2); ctx.fill();
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(bobX - 3, ac.y - 3, cSize * 0.35, 0, Math.PI * 2); ctx.fill();
    // Label
    ctx.fillStyle = '#000';
    ctx.font = 'bold ' + (cSize * 0.7) + 'px Courier New';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('+' + ac.val, bobX, ac.y + 1);
    // Collision with ship
    var adx = ship.x - bobX, ady = ship.y - ac.y;
    if (Math.sqrt(adx * adx + ady * ady) < cSize + 20) {
      ammo = Math.min(ammo + ac.val, 99);
      ammoCoins.splice(ci, 1);
      spawnPx(bobX, ac.y, 8, '#44ccff');
      snd(880, 0.1, 0.05, 'sine');
      setTimeout(function() { snd(1100, 0.08, 0.04, 'sine'); }, 80);
      // Floating text
      showAmmoPopup(bobX, ac.y, ac.val);
      continue;
    }
  }

  drawStarship();
  updateHUD();
  updateDist();
  raf = requestAnimationFrame(loop);
}

// === START ===
function startGame() {
  document.getElementById('ov-start').classList.add('hide');
  document.getElementById('ov-over').classList.add('hide');
  document.getElementById('ov-land').classList.add('hide');
  document.getElementById('ov-cert').classList.add('hide');
  document.getElementById('hud').style.opacity = '1';
  document.getElementById('dist-bar').style.opacity = '1';
  var glow = document.getElementById('mars-glow');
  glow.style.width = '200px'; glow.style.height = '200px'; glow.style.bottom = '-200px'; glow.style.opacity = '0.2';
  resize(); initGame(); running = true;
  if (raf) cancelAnimationFrame(raf);
  loop();
}

// === END GAME ===
function endGame() {
  running = false; cancelAnimationFrame(raf);
  var pts = score * 10 + kills * 25;
  totalPts += pts; localStorage.setItem('mm_pts', totalPts);
  if (score > best) { best = score; localStorage.setItem('mm_best', best); }
  document.getElementById('nav-pts').textContent = totalPts + ' pts';
  document.getElementById('final-score').textContent = score;
  document.getElementById('over-summary').textContent = 'Reached Level ' + (level + 1) + ' · ' + kills + ' asteroids destroyed · ' + Math.floor(gameTime) + 's survived';
  document.getElementById('pts-earned').textContent = '+' + pts + ' Mission Points';
  document.getElementById('ov-over').classList.remove('hide');
  snd(80, 0.5, 0.08, 'sawtooth');
  gtag('event', 'approach_failed', { score: score, kills: kills, level: level + 1, time: Math.floor(gameTime) });
}

// === APPROACH COMPLETE — all 5 levels done ===
function approachComplete() {
  running = false; cancelAnimationFrame(raf);
  var pts = score * 10 + kills * 25 + 1000;
  totalPts += pts; localStorage.setItem('mm_pts', totalPts);
  // Mark approach complete for certificate flow
  localStorage.setItem('mm_approach_done', JSON.stringify({ score: score, kills: kills, lives: lives, time: Math.floor(gameTime), pts: pts }));
  if (score > best) { best = score; localStorage.setItem('mm_best', best); }
  document.getElementById('nav-pts').textContent = totalPts + ' pts';
  document.getElementById('land-score').textContent = score;
  document.getElementById('land-pts').textContent = '+' + pts + ' Mission Points (includes +1000 approach bonus)';
  document.getElementById('ov-land').classList.remove('hide');
  // Victory chime
  snd(523, 0.12, 0.05); setTimeout(function() { snd(659, 0.12, 0.05); }, 130);
  setTimeout(function() { snd(784, 0.18, 0.05); }, 260);
  gtag('event', 'approach_complete', { score: score, kills: kills, lives: lives, time: Math.floor(gameTime) });
}

// === KEYBOARD ===
document.addEventListener('keydown', function(e) {
  keys[e.key] = true;
  if (e.key === ' ' && running) { e.preventDefault(); shoot(); }
});
document.addEventListener('keyup', function(e) { keys[e.key] = false; });

// === TOUCH ===
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault(); if (!running) return;
  var now = Date.now();
  if (now - lastTap < 300) { shoot(); lastTap = 0; return; }
  lastTap = now;
  var t = e.touches[0];
  touchDx = 0; touchDy = 0;
  if (t.clientX < W * 0.33) touchDx = -ship.spd;
  else if (t.clientX > W * 0.67) touchDx = ship.spd;
  if (t.clientY < H * 0.4) touchDy = -ship.spd * 0.7;
  else if (t.clientY > H * 0.7) touchDy = ship.spd * 0.7;
}, { passive: false });
canvas.addEventListener('touchmove', function(e) {
  e.preventDefault(); if (!running) return;
  var t = e.touches[0];
  touchDx = 0; touchDy = 0;
  if (t.clientX < W * 0.33) touchDx = -ship.spd;
  else if (t.clientX > W * 0.67) touchDx = ship.spd;
  if (t.clientY < H * 0.4) touchDy = -ship.spd * 0.7;
  else if (t.clientY > H * 0.7) touchDy = ship.spd * 0.7;
}, { passive: false });
canvas.addEventListener('touchend', function(e) {
  e.preventDefault(); touchDx = 0; touchDy = 0;
}, { passive: false });


// === AMMO POPUP ===
function showAmmoPopup(x, y, val) {
  var el = document.createElement('div');
  el.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;z-index:25;font-family:Courier New,monospace;font-size:1.1rem;font-weight:700;color:#44ccff;pointer-events:none;text-shadow:0 0 10px #44ccff;text-align:center;';
  el.textContent = '+' + val + ' AMMO';
  document.getElementById('game-wrap').appendChild(el);
  var start = Date.now();
  function anim() {
    var t = (Date.now() - start) / 1000;
    if (t > 1.5) { el.remove(); return; }
    el.style.top = (y - t * 40) + 'px';
    el.style.opacity = 1 - t / 1.5;
    el.style.transform = 'scale(' + (1 + t * 0.3) + ')';
    requestAnimationFrame(anim);
  }
  anim();
}
