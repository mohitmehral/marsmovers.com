// Mars Landing — Effects, Sound, Scoring
// Web Audio API sounds, screen shake, result calculation

// === DAILY MISSION ===
var DAILY_MISSIONS = [
  { id:'survive90',   text:'Land with 40%+ fuel remaining',     check: function(g,f){ return f >= 40; } },
  { id:'perfect_day', text:'Achieve a PERFECT landing today',   check: function(g){ return g === 'PERFECT'; } },
  { id:'steep_land',  text:'Land at 8°+ angle (still safe)',    check: function(g,f,a){ return Math.abs(a) >= 8 && g !== 'CRASH'; } },
  { id:'low_fuel',    text:'Land with less than 15% fuel',      check: function(g,f){ return f < 15 && g !== 'CRASH'; } },
  { id:'soft_touch',  text:'Land under 1.0 m/s vertical speed', check: function(g,f,a,vy){ return vy < 1.0 && g !== 'CRASH'; } },
  { id:'zone_up',     text:'Complete a new zone today',         check: function(g){ return g !== 'CRASH'; } },
  { id:'double_land', text:'Land successfully twice today',     check: function(){ return getDailyLands() >= 2; } }
];

function getTodayKey() { return 'mm_daily_' + new Date().toISOString().split('T')[0]; }

function getDailyMission() {
  var saved = localStorage.getItem(getTodayKey());
  if (saved) return JSON.parse(saved);
  var dayIndex = Math.floor(Date.now() / 86400000) % DAILY_MISSIONS.length;
  var mission = { index: dayIndex, completed: false, lands: 0 };
  localStorage.setItem(getTodayKey(), JSON.stringify(mission));
  return mission;
}

function getDailyLands() {
  var m = getDailyMission();
  return m.lands || 0;
}

function recordDailyLand() {
  var m = getDailyMission();
  m.lands = (m.lands || 0) + 1;
  localStorage.setItem(getTodayKey(), JSON.stringify(m));
}

function checkDailyMission(grade, fuel, angle, vy) {
  var m = getDailyMission();
  if (m.completed) return;
  var mission = DAILY_MISSIONS[m.index];
  if (mission.check(grade, fuel, angle, vy)) {
    m.completed = true;
    localStorage.setItem(getTodayKey(), JSON.stringify(m));
    // Bonus points
    gameState.totalPts += 500;
    localStorage.setItem('mm_pts', gameState.totalPts);
    document.getElementById('nav-pts').textContent = 'Mission Points: ' + gameState.totalPts;
    showDailyPopup(mission);
  }
}

function showDailyPopup(mission) {
  var popup = document.createElement('div');
  popup.style.cssText = 'position:fixed;top:70px;left:20px;z-index:200;background:rgba(0,255,136,0.12);border:1px solid rgba(0,255,136,0.5);padding:14px 20px;max-width:280px;animation:badgeIn .4s ease;font-family:Courier New,monospace;';
  popup.innerHTML = '<div style="font-size:1.3rem;margin-bottom:6px">\u2705</div>' +
    '<div style="font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:#00ff88;margin-bottom:4px">Daily Mission Complete!</div>' +
    '<div style="font-size:.8rem;font-weight:700;color:#fff;margin-bottom:2px">' + mission.text + '</div>' +
    '<div style="font-size:.65rem;color:rgba(255,255,255,.5)">+500 Bonus Points</div>';
  document.body.appendChild(popup);
  setTimeout(function() { popup.style.opacity = '0'; popup.style.transition = 'opacity .5s'; }, 3500);
  setTimeout(function() { popup.remove(); }, 4100);
}

function updateDailyDisplay() {
  var el = document.getElementById('daily-mission-text');
  if (!el) return;
  var m = getDailyMission();
  var mission = DAILY_MISSIONS[m.index];
  if (m.completed) {
    el.textContent = '\u2705 ' + mission.text;
    el.style.color = '#00ff88';
  } else {
    el.textContent = '\u25cb ' + mission.text;
    el.style.color = 'rgba(255,200,100,.7)';
  }
}

// === ACHIEVEMENT BADGES ===
var ACHIEVEMENTS = [
  { id:'first_land',   name:'First Contact',    desc:'Land successfully for the first time', icon:'🎯' },
  { id:'perfect',      name:'Feather Touch',    desc:'Achieve a PERFECT landing', icon:'🪶' },
  { id:'perfect5',     name:'Ace Pilot',         desc:'Get 5 PERFECT landings', icon:'🏆' },
  { id:'no_fuel',      name:'Fumes Only',        desc:'Land with less than 5% fuel', icon:'⛽' },
  { id:'zone3',        name:'Mountain Climber',  desc:'Reach Olympus Mons (Zone 3)', icon:'⛰️' },
  { id:'zone5',        name:'Polar Explorer',    desc:'Reach Polar Ice Cap (Zone 5)', icon:'❄️' },
  { id:'pts10k',       name:'10K Club',          desc:'Earn 10,000 total mission points', icon:'💫' },
  { id:'streak3',      name:'Hat Trick',         desc:'Land 3 times in a row without crashing', icon:'🎩' }
];

var unlockedBadges = JSON.parse(localStorage.getItem('mm_badges') || '[]');
var perfectCount = parseInt(localStorage.getItem('mm_perfects') || '0');
var landStreak = parseInt(localStorage.getItem('mm_streak') || '0');

function unlockBadge(id) {
  if (unlockedBadges.indexOf(id) !== -1) return false;
  unlockedBadges.push(id);
  localStorage.setItem('mm_badges', JSON.stringify(unlockedBadges));
  var badge = ACHIEVEMENTS.find(function(a) { return a.id === id; });
  if (badge) showBadgePopup(badge);
  return true;
}

function showBadgePopup(badge) {
  var popup = document.createElement('div');
  popup.style.cssText = 'position:fixed;top:70px;right:20px;z-index:200;background:rgba(255,80,20,0.15);border:1px solid rgba(255,80,20,0.5);padding:14px 20px;max-width:260px;animation:badgeIn .4s ease;font-family:Courier New,monospace;';
  popup.innerHTML = '<div style="font-size:1.5rem;margin-bottom:6px">' + badge.icon + '</div>' +
    '<div style="font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:#ff5014;margin-bottom:4px">Achievement Unlocked</div>' +
    '<div style="font-size:.85rem;font-weight:700;color:#fff;margin-bottom:2px">' + badge.name + '</div>' +
    '<div style="font-size:.65rem;color:rgba(255,255,255,.4)">' + badge.desc + '</div>';
  document.body.appendChild(popup);
  setTimeout(function() { popup.style.opacity = '0'; popup.style.transition = 'opacity .5s'; }, 3000);
  setTimeout(function() { popup.remove(); }, 3600);
}

function checkAchievements(grade, fuel, level) {
  unlockBadge('first_land');
  if (grade === 'PERFECT') {
    unlockBadge('perfect');
    perfectCount++;
    localStorage.setItem('mm_perfects', perfectCount);
    if (perfectCount >= 5) unlockBadge('perfect5');
  }
  if (fuel < 5) unlockBadge('no_fuel');
  if (level >= 3) unlockBadge('zone3');
  if (level >= 5) unlockBadge('zone5');
  if (gameState.totalPts >= 10000) unlockBadge('pts10k');
  landStreak++;
  localStorage.setItem('mm_streak', landStreak);
  if (landStreak >= 3) unlockBadge('streak3');
}

function resetStreak() {
  landStreak = 0;
  localStorage.setItem('mm_streak', 0);
}

// Inject badge animation CSS
var badgeStyle = document.createElement('style');
badgeStyle.textContent = '@keyframes badgeIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}';
document.head.appendChild(badgeStyle);

// === PILOT RANK SYSTEM ===
var RANKS = [
  { name:'Cadet',      minPts:0,     badge:'☆' },
  { name:'Pilot',      minPts:1000,  badge:'★' },
  { name:'Navigator',  minPts:5000,  badge:'★★' },
  { name:'Commander',  minPts:15000, badge:'★★★' },
  { name:'Legend',     minPts:40000, badge:'★★★★' }
];

function getPilotRank(pts) {
  var rank = RANKS[0];
  for (var i = RANKS.length - 1; i >= 0; i--) {
    if (pts >= RANKS[i].minPts) { rank = RANKS[i]; break; }
  }
  return rank;
}

function getNextRank(pts) {
  for (var i = 0; i < RANKS.length; i++) {
    if (pts < RANKS[i].minPts) return RANKS[i];
  }
  return null;
}

function updateRankDisplay() {
  var rank = getPilotRank(gameState.totalPts);
  var el = document.getElementById('pilot-rank');
  if (el) el.textContent = rank.badge + ' ' + rank.name;
  var next = getNextRank(gameState.totalPts);
  var nel = document.getElementById('rank-progress');
  if (nel && next) {
    var pct = Math.floor((gameState.totalPts / next.minPts) * 100);
    nel.textContent = pct + '% to ' + next.name;
  } else if (nel) {
    nel.textContent = 'Max rank achieved';
  }
}

// === FUEL WARNING SOUND ===
var fuelWarnLevel = 0;
var fuelWarnOsc = null;
var fuelWarnGain = null;

window.playFuelWarning = function(level) {
  if (level === fuelWarnLevel) return;
  fuelWarnLevel = level;
  initAudio();
  if (level === 0) {
    if (fuelWarnGain) fuelWarnGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    return;
  }
  if (!fuelWarnOsc) {
    fuelWarnOsc = audioCtx.createOscillator();
    fuelWarnGain = audioCtx.createGain();
    fuelWarnOsc.type = 'square';
    fuelWarnOsc.connect(fuelWarnGain);
    fuelWarnGain.connect(audioCtx.destination);
    fuelWarnOsc.start();
  }
  if (level === 1) {
    fuelWarnOsc.frequency.value = 440;
    fuelWarnGain.gain.setTargetAtTime(0.03, audioCtx.currentTime, 0.05);
    // Beep pattern — on/off
    var now = audioCtx.currentTime;
    fuelWarnGain.gain.setValueAtTime(0.03, now);
    fuelWarnGain.gain.setValueAtTime(0, now + 0.1);
    fuelWarnGain.gain.setValueAtTime(0.03, now + 0.6);
    fuelWarnGain.gain.setValueAtTime(0, now + 0.7);
  } else if (level === 2) {
    fuelWarnOsc.frequency.value = 660;
    var now2 = audioCtx.currentTime;
    fuelWarnGain.gain.setValueAtTime(0.05, now2);
    fuelWarnGain.gain.setValueAtTime(0, now2 + 0.08);
    fuelWarnGain.gain.setValueAtTime(0.05, now2 + 0.2);
    fuelWarnGain.gain.setValueAtTime(0, now2 + 0.28);
    fuelWarnGain.gain.setValueAtTime(0.05, now2 + 0.4);
    fuelWarnGain.gain.setValueAtTime(0, now2 + 0.48);
  }
};

// === COIN POPUP ===
window.showCoinPopup = function(x, y, val) {
  var popup = document.createElement('div');
  var color = val >= 100 ? '#ffd700' : val >= 20 ? '#ffaa00' : '#ffcc44';
  popup.style.cssText = 'position:absolute;left:'+x+'px;top:'+y+'px;z-index:25;font-family:Courier New,monospace;font-size:'+(val>=100?'1.4rem':'1rem')+';font-weight:700;color:'+color+';pointer-events:none;text-shadow:0 0 10px '+color+';';
  popup.textContent = '+' + val;
  document.getElementById('game-container').appendChild(popup);
  var start = Date.now();
  function anim() {
    var t = (Date.now() - start) / 1000;
    if (t > 1.2) { popup.remove(); return; }
    popup.style.top = (y - t * 50) + 'px';
    popup.style.opacity = 1 - t / 1.2;
    if (val >= 100) popup.style.transform = 'scale(' + (1 + t * 0.5) + ')';
    requestAnimationFrame(anim);
  }
  anim();
  // Play coin sound
  if (audioCtx) {
    var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = val >= 100 ? 880 : val >= 20 ? 660 : 520;
    g.gain.value = 0.06;
    osc.connect(g); g.connect(audioCtx.destination);
    g.gain.setTargetAtTime(0, audioCtx.currentTime + 0.15, 0.05);
    osc.start(); osc.stop(audioCtx.currentTime + 0.25);
  }
};

// === WEB AUDIO SOUND ENGINE ===
var audioCtx = null;
var thrustOsc = null;
var thrustGain = null;
var thrustActive = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Thrust oscillator — always running, gain controls volume
  thrustOsc = audioCtx.createOscillator();
  thrustGain = audioCtx.createGain();
  thrustOsc.type = 'sawtooth';
  thrustOsc.frequency.value = 80;
  thrustGain.gain.value = 0;
  thrustOsc.connect(thrustGain);
  thrustGain.connect(audioCtx.destination);
  thrustOsc.start();
}

window.playThrustSound = function(on) {
  initAudio();
  if (on && !thrustActive) {
    thrustGain.gain.setTargetAtTime(0.06, audioCtx.currentTime, 0.05);
    thrustOsc.frequency.setTargetAtTime(80 + Math.random() * 20, audioCtx.currentTime, 0.1);
    thrustActive = true;
  } else if (!on && thrustActive) {
    thrustGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
    thrustActive = false;
  }
};

function playExplosion() {
  initAudio();
  var dur = 0.4;
  var bufSize = audioCtx.sampleRate * dur;
  var buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
  }
  var src = audioCtx.createBufferSource();
  src.buffer = buf;
  var g = audioCtx.createGain();
  g.gain.value = 0.15;
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start();
}

function playSuccess() {
  initAudio();
  var osc = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  osc.type = 'sine';
  g.gain.value = 0.08;
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(523, audioCtx.currentTime);
  osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.12);
  osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.24);
  g.gain.setTargetAtTime(0, audioCtx.currentTime + 0.4, 0.1);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
}

// === SCREEN SHAKE ===
function screenShake(el, intensity, duration) {
  var start = Date.now();
  function shake() {
    var elapsed = Date.now() - start;
    if (elapsed > duration) {
      el.style.transform = '';
      return;
    }
    var decay = 1 - elapsed / duration;
    var x = (Math.random() - 0.5) * intensity * decay;
    var y = (Math.random() - 0.5) * intensity * decay;
    el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    requestAnimationFrame(shake);
  }
  shake();
}

// === PARTICLE EXPLOSION (CSS-based, no Phaser dependency) ===
function spawnParticles(x, y, color, count) {
  var container = document.getElementById('game-container');
  for (var i = 0; i < count; i++) {
    var p = document.createElement('div');
    var size = Math.random() * 5 + 2;
    var angle = Math.random() * Math.PI * 2;
    var speed = Math.random() * 120 + 40;
    var vx = Math.cos(angle) * speed;
    var vy = Math.sin(angle) * speed - 30;
    var life = Math.random() * 600 + 400;

    p.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;background:' + color + ';border-radius:50%;pointer-events:none;z-index:15;opacity:1;';
    container.appendChild(p);

    animateParticle(p, vx, vy, life);
  }
}

function animateParticle(el, vx, vy, life) {
  var start = Date.now();
  var sx = parseFloat(el.style.left);
  var sy = parseFloat(el.style.top);
  function tick() {
    var t = (Date.now() - start) / 1000;
    if (t * 1000 > life) { el.remove(); return; }
    var decay = 1 - (t * 1000 / life);
    el.style.left = (sx + vx * t) + 'px';
    el.style.top = (sy + vy * t + 1.86 * t * t * 50) + 'px';
    el.style.opacity = decay;
    requestAnimationFrame(tick);
  }
  tick();
}

function spawnDust(x, y) {
  for (var i = 0; i < 12; i++) {
    var p = document.createElement('div');
    var size = Math.random() * 8 + 4;
    var dir = Math.random() > 0.5 ? 1 : -1;
    var speed = Math.random() * 60 + 20;

    p.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + (size * 0.6) + 'px;background:rgba(160,100,60,0.5);border-radius:50%;pointer-events:none;z-index:15;opacity:0.7;';
    document.getElementById('game-container').appendChild(p);

    animateDust(p, dir * speed, y);
  }
}

function animateDust(el, vx, baseY) {
  var start = Date.now();
  var sx = parseFloat(el.style.left);
  function tick() {
    var t = (Date.now() - start) / 1000;
    if (t > 1.2) { el.remove(); return; }
    el.style.left = (sx + vx * t) + 'px';
    el.style.top = (baseY - t * 15) + 'px';
    el.style.opacity = 0.7 * (1 - t / 1.2);
    el.style.transform = 'scale(' + (1 + t * 1.5) + ')';
    requestAnimationFrame(tick);
  }
  tick();
}

// === SCORING ===
function calcScore(vy, vx, angle, fuelLeft) {
  var base = 800;
  // Speed penalty
  var spdPenalty = Math.floor(vy * 80 + Math.abs(vx) * 40);
  // Angle penalty
  var angPenalty = Math.floor(Math.abs(angle) * 8);
  // Fuel bonus
  var fuelBonus = Math.floor(fuelLeft * 3);
  var total = Math.max(0, base - spdPenalty - angPenalty + fuelBonus);
  return total;
}

function getGrade(vy, angle) {
  if (vy < 2.0 && Math.abs(angle) < 10) return 'PERFECT';
  if (vy < 3.5 && Math.abs(angle) < 20) return 'GOOD';
  return 'ROUGH';
}

// === RESULT HANDLERS ===
window.onLanded = function(vy, vx, angle, fuel, zone, coinBonus) {
  window.playThrustSound(false);
  playSuccess();

  var cx = ship.x;
  var cy = ship.y + 18;
  spawnDust(cx, cy);

  var grade = getGrade(vy, angle);
  var zoneMultiplier = zone ? (ZONES.indexOf(zone) + 1) : gameState.level;
  var pts = Math.floor(calcScore(vy, vx, angle, fuel) * (1 + zoneMultiplier * 0.3)) + (coinBonus || 0);

  gameState.totalPts += pts;
  localStorage.setItem('mm_pts', gameState.totalPts);
  document.getElementById('nav-pts').textContent = 'Mission Points: ' + gameState.totalPts;

  var gradeEl = document.getElementById('result-grade');
  gradeEl.textContent = grade;
  gradeEl.className = 'result-grade';
  if (grade === 'PERFECT') gradeEl.classList.add('grade-perfect');
  else if (grade === 'GOOD') gradeEl.classList.add('grade-good');
  else gradeEl.classList.add('grade-crash');

  var zoneName = zone ? zone.name : 'Mars';
  document.getElementById('result-title').innerHTML = zoneName + ' — Landing <em>Complete</em>';
  document.getElementById('r-vspd').textContent = vy.toFixed(1);
  document.getElementById('r-hspd').textContent = vx.toFixed(1);
  document.getElementById('r-angle').textContent = Math.floor(angle);
  document.getElementById('r-fuel').textContent = Math.floor(fuel);
  document.getElementById('r-pts').textContent = '+' + pts;
  document.getElementById('h-score').textContent = pts;

  // Show next zone info
  var nextInfo = document.getElementById('next-zone-info');
  if (nextInfo) {
    if (gameState.level <= 5) {
      var nz = getZone(gameState.level);
      nextInfo.textContent = 'Next: Zone ' + gameState.level + ' — ' + nz.name;
      nextInfo.style.display = 'block';
    } else {
      nextInfo.textContent = 'All zones conquered!';
      nextInfo.style.display = 'block';
    }
  }

  setTimeout(function() {
    var btn = document.getElementById('result-main-btn');
    if (btn) { btn.textContent = 'Next Zone \u2192'; }
    document.getElementById('ov-result').classList.remove('hide');
  }, 800);

  gtag('event', 'mars_landing', { grade: grade, points: pts, zone: zoneName, level: gameState.level, vy: vy.toFixed(1), angle: Math.floor(angle) });
  updateRankDisplay();
  checkAchievements(grade, fuel, gameState.level - 1);
  recordDailyLand();
  checkDailyMission(grade, fuel, angle, vy);
  updateDailyDisplay();

  // Check if this landing completes a full approach+landing run
  var approachData = localStorage.getItem('mm_approach_done');
  if (approachData && grade !== 'CRASH') {
    var ad = JSON.parse(approachData);
    localStorage.removeItem('mm_approach_done');
    // STAR PILOT — completed full mission in one flow!
    setTimeout(function() { showStarPilotCert(ad, pts, grade); }, 1200);
  }
};

// === STAR PILOT CELEBRATION ===
function showStarPilotCert(approachData, landingPts, grade) {
  // Confetti
  var colors = ['#ff5014','#ffd700','#ff3333','#00ff88','#4488ff','#ff44ff'];
  for (var i = 0; i < 60; i++) {
    var c = document.createElement('div');
    c.style.cssText = 'position:fixed;top:-20px;left:' + (Math.random() * 100) + '%;width:' + (Math.random() * 8 + 4) + 'px;height:' + (Math.random() * 8 + 4) + 'px;background:' + colors[Math.floor(Math.random() * colors.length)] + ';z-index:200;pointer-events:none;border-radius:' + (Math.random() > 0.5 ? '50%' : '0') + ';animation:starConfetti ' + (Math.random() * 2 + 2) + 's ease-in ' + (Math.random() * 1.5) + 's forwards;';
    document.body.appendChild(c);
    setTimeout(function(el) { el.remove(); }.bind(null, c), 5000);
  }
  // Inject confetti animation if not exists
  if (!document.getElementById('star-confetti-css')) {
    var style = document.createElement('style');
    style.id = 'star-confetti-css';
    style.textContent = '@keyframes starConfetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}';
    document.head.appendChild(style);
  }
  // Build certificate popup
  var totalPtsEarned = approachData.pts + landingPts;
  var roster = 'MM-' + String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
  var popup = document.createElement('div');
  popup.style.cssText = 'position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;font-family:Courier New,monospace;';
  popup.innerHTML = '<p style="font-size:.6rem;letter-spacing:.35em;text-transform:uppercase;color:#ffd700;margin-bottom:10px">★ ★ ★ Star Pilot Certificate ★ ★ ★</p>' +
    '<h2 style="font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;margin-bottom:16px;color:#fff">MISSION <span style="color:#ffd700">COMPLETE</span></h2>' +
    '<div style="border:2px solid rgba(255,200,50,.5);padding:28px 36px;background:rgba(255,200,50,.04);max-width:400px;width:100%;margin-bottom:20px">' +
    '<p style="font-size:.5rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,200,50,.5);margin-bottom:10px">Mars Movers · Full Mission · MM-2031</p>' +
    '<p style="font-size:.7rem;color:rgba(255,255,255,.5);margin-bottom:6px">This certifies that</p>' +
    '<p style="font-size:1.4rem;font-weight:700;color:#ffd700;letter-spacing:.1em;margin-bottom:6px">★ STAR PILOT ★</p>' +
    '<p style="font-size:.65rem;color:rgba(255,255,255,.4);margin-bottom:16px">has completed the full Mars approach and landing in a single mission</p>' +
    '<p style="font-size:2rem;font-weight:700;color:#ff5014;letter-spacing:.25em;margin-bottom:14px">' + roster + '</p>' +
    '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">' +
    '<div style="text-align:center"><div style="font-size:1rem;font-weight:700;color:#ff5014">' + (approachData.score + Math.floor(landingPts / 10)) + '</div><div style="font-size:.4rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4)">Total Score</div></div>' +
    '<div style="text-align:center"><div style="font-size:1rem;font-weight:700;color:#ff5014">' + approachData.kills + '</div><div style="font-size:.4rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4)">Destroyed</div></div>' +
    '<div style="text-align:center"><div style="font-size:1rem;font-weight:700;color:#ff5014">' + approachData.time + 's</div><div style="font-size:.4rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4)">Flight Time</div></div>' +
    '<div style="text-align:center"><div style="font-size:1rem;font-weight:700;color:#ff5014">' + grade + '</div><div style="font-size:.4rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4)">Landing Grade</div></div>' +
    '</div></div>' +
    '<p style="font-size:.75rem;color:#ffd700;letter-spacing:.15em;margin-bottom:20px">You deserve a seat on the first Starship 🚀</p>' +
    '<button onclick="this.parentElement.remove()" style="background:#ffd700;color:#000;border:none;cursor:pointer;font-family:inherit;font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;padding:14px 36px">Accept Certificate</button>';
  document.body.appendChild(popup);
  // Victory sound
  playSuccess();
  setTimeout(function() { playSuccess(); }, 500);
  gtag('event', 'star_pilot', { roster: roster, score: approachData.score, kills: approachData.kills, grade: grade });
}

window.onCrashed = function(vy, vx, angle, zone, coinBonus) {
  window.playThrustSound(false);
  playExplosion();

  var cx = ship.x;
  var cy = ship.y;
  spawnParticles(cx, cy, '#ff5014', 25);
  spawnParticles(cx, cy, '#ffcc33', 15);
  spawnParticles(cx, cy, '#ff3333', 10);

  screenShake(document.getElementById('game-container'), 12, 500);
  ship.setVisible(false);

  // Keep half of coins on crash
  var keptCoins = Math.floor((coinBonus || 0) * 0.5);
  if (keptCoins > 0) {
    gameState.totalPts += keptCoins;
    localStorage.setItem('mm_pts', gameState.totalPts);
    document.getElementById('nav-pts').textContent = 'Mission Points: ' + gameState.totalPts;
  }

  var zoneName = zone ? zone.name : 'Mars';
  document.getElementById('result-title').innerHTML = zoneName + ' — Ship <em>Destroyed</em>';
  var gradeEl = document.getElementById('result-grade');
  gradeEl.textContent = 'CRASH';
  gradeEl.className = 'result-grade grade-crash';
  document.getElementById('r-vspd').textContent = vy.toFixed(1);
  document.getElementById('r-hspd').textContent = vx.toFixed(1);
  document.getElementById('r-angle').textContent = Math.floor(angle);
  document.getElementById('r-fuel').textContent = Math.floor(gameState.fuel);
  document.getElementById('r-pts').textContent = '+0';
  document.getElementById('h-score').textContent = '0';

  var nextInfo = document.getElementById('next-zone-info');
  if (nextInfo) { nextInfo.textContent = 'Retry Zone ' + gameState.level; nextInfo.style.display = 'block'; }

  setTimeout(function() {
    var btn = document.getElementById('result-main-btn');
    if (btn) { btn.textContent = 'Retry Zone ' + gameState.level; }
    document.getElementById('ov-result').classList.remove('hide');
  }, 1000);

  gtag('event', 'mars_crash', { zone: zoneName, level: gameState.level, vy: vy.toFixed(1), angle: Math.floor(angle) });
  updateRankDisplay();
  resetStreak();
};


// === BOARDING CERTIFICATE ===
function showCertificate() {
  document.getElementById('ov-result').classList.add('hide');
  var rank = getPilotRank(gameState.totalPts);
  document.getElementById('cert-rank').textContent = rank.badge + ' ' + rank.name;
  document.getElementById('cert-roster-num').textContent = 'MM-' + String(Math.floor(Math.random()*900)+100).padStart(4,'0');
  document.getElementById('cert-total-pts').textContent = gameState.totalPts;
  document.getElementById('cert-zone-reached').textContent = gameState.level;
  document.getElementById('cert-badge-count').textContent = unlockedBadges.length;
  document.getElementById('ov-cert').classList.remove('hide');
}

function claimCertificate() {
  var name = document.getElementById('cert-name-input').value.trim();
  if (!name) { document.getElementById('cert-name-input').focus(); return; }
  // Save certificate
  var cert = {
    name: name,
    roster: document.getElementById('cert-roster-num').textContent,
    pts: gameState.totalPts,
    rank: getPilotRank(gameState.totalPts).name,
    zone: gameState.level,
    badges: unlockedBadges.length,
    date: new Date().toISOString().split('T')[0]
  };
  localStorage.setItem('mm_cert', JSON.stringify(cert));

  // Replace input with confirmed name
  var input = document.getElementById('cert-name-input');
  var nameDiv = document.createElement('p');
  nameDiv.style.cssText = 'font-size:1.4rem;font-weight:700;letter-spacing:.1em;color:#fff;margin-bottom:8px';
  nameDiv.textContent = name.toUpperCase();
  input.parentNode.replaceChild(nameDiv, input);

  // Change button
  var btn = document.querySelector('#ov-cert .btn-go');
  btn.textContent = 'Train Again';
  btn.onclick = function() { window.startMission(); };

  playSuccess();
  gtag('event', 'claim_certificate', { pilot: name, roster: cert.roster, points: cert.pts, rank: cert.rank });
}

// Make functions global
window.showCertificate = showCertificate;
window.claimCertificate = claimCertificate;

// Init rank display on load
updateRankDisplay();
updateDailyDisplay();
