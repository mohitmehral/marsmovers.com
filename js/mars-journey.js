// Mars Journey — Cinematic Earth to Mars Animation
// Milky way background, nebula, visible orbits, 30-second smooth transit
(function(){
  var c = document.getElementById('journey-canvas');
  if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  var frame = 0;
  var CYCLE = 1800; // 30 seconds at 60fps

  // Pre-generate background elements
  var bgStars = [], nebula = [];
  for (var i = 0; i < 500; i++) {
    bgStars.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.2,
      base: Math.random(),
      color: Math.random() > 0.92 ? 'blue' : Math.random() > 0.88 ? 'warm' : 'white'
    });
  }
  for (var n = 0; n < 60; n++) {
    nebula.push({
      x: 0.15 + Math.random() * 0.7,
      y: 0.1 + Math.random() * 0.8,
      r: Math.random() * 80 + 20,
      o: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.5 ? 'purple' : 'blue'
    });
  }

  function draw() {
    var w = c.width, h = c.height;
    frame++;
    var tP = (frame % CYCLE) / CYCLE; // 0→1 over 30 seconds

    // === BACKGROUND — deep space + milky way ===
    var bg = ctx.createRadialGradient(w * 0.4, h * 0.5, 0, w * 0.4, h * 0.5, w * 0.8);
    bg.addColorStop(0, '#080812'); bg.addColorStop(0.4, '#040408'); bg.addColorStop(1, '#010102');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // Milky way band — diagonal glow
    ctx.save();
    ctx.translate(w * 0.5, h * 0.5); ctx.rotate(-0.35);
    var mw = ctx.createLinearGradient(-w * 0.7, 0, w * 0.7, 0);
    mw.addColorStop(0, 'rgba(0,0,0,0)'); mw.addColorStop(0.25, 'rgba(50,40,70,0.035)');
    mw.addColorStop(0.45, 'rgba(70,60,100,0.06)'); mw.addColorStop(0.55, 'rgba(80,70,110,0.07)');
    mw.addColorStop(0.75, 'rgba(50,40,70,0.035)'); mw.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mw; ctx.fillRect(-w * 0.8, -h * 0.18, w * 1.6, h * 0.36);
    ctx.restore();

    // Nebula clouds
    nebula.forEach(function(np) {
      var col = np.hue === 'purple' ? 'rgba(80,40,120,' : 'rgba(40,60,130,';
      ctx.fillStyle = col + np.o + ')';
      ctx.beginPath(); ctx.arc(np.x * w, np.y * h, np.r, 0, Math.PI * 2); ctx.fill();
    });

    // Stars — twinkling, some colored, bright ones get cross-shine
    bgStars.forEach(function(s) {
      var twinkle = 0.25 + Math.sin(frame * 0.015 + s.base * 200) * 0.25;
      var col;
      if (s.color === 'blue') col = 'rgba(150,180,255,';
      else if (s.color === 'warm') col = 'rgba(255,210,170,';
      else col = 'rgba(255,255,255,';
      ctx.fillStyle = col + twinkle.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
      if (s.r > 1.4) {
        ctx.strokeStyle = col + (twinkle * 0.25).toFixed(2) + ')';
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(s.x * w - 5, s.y * h); ctx.lineTo(s.x * w + 5, s.y * h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x * w, s.y * h - 5); ctx.lineTo(s.x * w, s.y * h + 5); ctx.stroke();
      }
    });

    // === SOLAR SYSTEM ===
    var cx = w * 0.38, cy = h * 0.48;
    var eR = Math.min(w, h) * 0.22;
    var mR = Math.min(w, h) * 0.43;

    // Orbit rings — glowing
    // Earth orbit
    ctx.strokeStyle = 'rgba(80,140,255,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, eR, eR * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,140,255,0.04)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(cx, cy, eR, eR * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
    // Earth orbit label
    ctx.fillStyle = 'rgba(80,140,255,0.2)'; ctx.font = '10px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('Earth Orbit · 150M km', cx + eR * 0.7, cy - eR * 0.32);

    // Mars orbit
    ctx.strokeStyle = 'rgba(255,90,40,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, mR, mR * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,90,40,0.04)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(cx, cy, mR, mR * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,90,40,0.2)'; ctx.font = '10px Courier New';
    ctx.fillText('Mars Orbit · 228M km', cx + mR * 0.65, cy - mR * 0.33);

    // === SUN ===
    var sunG = ctx.createRadialGradient(cx, cy, 2, cx, cy, 55);
    sunG.addColorStop(0, 'rgba(255,240,120,1)'); sunG.addColorStop(0.1, 'rgba(255,210,70,0.7)');
    sunG.addColorStop(0.3, 'rgba(255,170,40,0.15)'); sunG.addColorStop(1, 'rgba(255,120,20,0)');
    ctx.fillStyle = sunG; ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe880'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('☀ Sun', cx, cy + 26);

    // === EARTH ===
    var eAngle = frame * 0.0012;
    var ex = cx + Math.cos(eAngle) * eR, ey = cy + Math.sin(eAngle) * eR * 0.38;
    // Glow
    ctx.fillStyle = 'rgba(60,130,255,0.08)'; ctx.beginPath(); ctx.arc(ex, ey, 28, 0, Math.PI * 2); ctx.fill();
    // Planet
    ctx.fillStyle = '#3377ee'; ctx.beginPath(); ctx.arc(ex, ey, 12, 0, Math.PI * 2); ctx.fill();
    // Continents
    ctx.fillStyle = 'rgba(60,180,60,0.35)'; ctx.beginPath(); ctx.arc(ex + 3, ey - 3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(60,160,60,0.25)'; ctx.beginPath(); ctx.arc(ex - 4, ey + 2, 3, 0, Math.PI * 2); ctx.fill();
    // Ice caps
    ctx.fillStyle = 'rgba(220,230,255,0.3)'; ctx.beginPath(); ctx.arc(ex, ey - 10, 4, 0, Math.PI * 2); ctx.fill();
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 13px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('🌍 Earth', ex, ey + 30);

    // === MARS ===
    var mAngle = frame * 0.0006 + 1.8;
    var mx = cx + Math.cos(mAngle) * mR, my = cy + Math.sin(mAngle) * mR * 0.38;
    // Glow
    ctx.fillStyle = 'rgba(255,70,20,0.06)'; ctx.beginPath(); ctx.arc(mx, my, 26, 0, Math.PI * 2); ctx.fill();
    // Planet
    ctx.fillStyle = '#e84420'; ctx.beginPath(); ctx.arc(mx, my, 11, 0, Math.PI * 2); ctx.fill();
    // Dark features
    ctx.fillStyle = 'rgba(100,30,10,0.3)'; ctx.beginPath(); ctx.arc(mx + 3, my + 2, 4, 0, Math.PI * 2); ctx.fill();
    // Polar cap
    ctx.fillStyle = 'rgba(220,225,235,0.3)'; ctx.beginPath(); ctx.arc(mx, my - 8, 4, 0, Math.PI * 2); ctx.fill();
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 13px Courier New';
    ctx.fillText('🔴 Mars', mx, my + 28);

    // Satellites orbiting Mars
    for (var si = 0; si < 4; si++) {
      var sa = frame * 0.005 + si * 1.6, sr = 18 + si * 6;
      var satx = mx + Math.cos(sa) * sr, saty = my + Math.sin(sa) * sr * 0.4;
      ctx.fillStyle = 'rgba(200,210,230,0.5)'; ctx.fillRect(satx - 2, saty - 1, 4, 2);
      ctx.strokeStyle = 'rgba(100,160,255,0.2)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(satx - 6, saty); ctx.lineTo(satx + 6, saty); ctx.stroke();
    }

    // === TRANSFER ORBIT — ship travels Earth → Mars ===
    var launchA = eAngle - tP * Math.PI * 0.25;

    // Ghost path (full trajectory, always visible)
    ctx.strokeStyle = 'rgba(255,200,60,0.05)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var g = 0; g <= 1; g += 0.004) {
      var gr = eR + (mR - eR) * g, ga = launchA + Math.PI * g;
      var gx = cx + Math.cos(ga) * gr, gy2 = cy + Math.sin(ga) * gr * 0.38;
      g === 0 ? ctx.moveTo(gx, gy2) : ctx.lineTo(gx, gy2);
    }
    ctx.stroke();

    // Active path — bright golden line
    ctx.strokeStyle = 'rgba(255,210,70,0.5)'; ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255,200,50,0.3)'; ctx.shadowBlur = 8;
    ctx.beginPath();
    for (var t = 0; t <= tP; t += 0.002) {
      var tr = eR + (mR - eR) * t, ta = launchA + Math.PI * t;
      var tx = cx + Math.cos(ta) * tr, ty = cy + Math.sin(ta) * tr * 0.38;
      t === 0 ? ctx.moveTo(tx, ty) : ctx.lineTo(tx, ty);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Ship position on path
    var shipR = eR + (mR - eR) * tP;
    var shipA = launchA + Math.PI * tP;
    var sx = cx + Math.cos(shipA) * shipR, sy = cy + Math.sin(shipA) * shipR * 0.38;

    // Engine trail — fading glow behind ship
    for (var tr = 0; tr < 8; tr++) {
      var trT = Math.max(0, tP - tr * 0.006);
      var trR = eR + (mR - eR) * trT, trA = launchA + Math.PI * trT;
      var trx = cx + Math.cos(trA) * trR, try2 = cy + Math.sin(trA) * trR * 0.38;
      var trAlpha = (1 - tr / 8) * 0.3;
      ctx.fillStyle = 'rgba(255,200,50,' + trAlpha.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(trx, try2, 3 - tr * 0.3, 0, Math.PI * 2); ctx.fill();
    }

    // Ship — drawn rocket instead of emoji for clarity
    ctx.save(); ctx.translate(sx, sy);
    // Body
    ctx.fillStyle = '#ddd';
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
    // Nose
    ctx.fillStyle = '#ff5014';
    ctx.beginPath(); ctx.moveTo(-3, -8); ctx.quadraticCurveTo(0, -16, 3, -8); ctx.fill();
    // Window
    ctx.fillStyle = 'rgba(100,200,255,0.8)'; ctx.beginPath(); ctx.arc(0, -4, 1.5, 0, Math.PI * 2); ctx.fill();
    // Flame
    var fl = 4 + Math.random() * 5;
    ctx.fillStyle = 'rgba(255,200,50,0.9)';
    ctx.beginPath(); ctx.moveTo(-3, 6); ctx.lineTo(3, 6); ctx.lineTo(0, 6 + fl); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Distance line to Mars (fades as ship approaches)
    var dist = Math.sqrt((sx - mx) * (sx - mx) + (sy - my) * (sy - my));
    if (dist > 25) {
      var lineAlpha = Math.min(0.1, dist / 1000);
      ctx.strokeStyle = 'rgba(255,255,255,' + lineAlpha.toFixed(3) + ')';
      ctx.lineWidth = 0.5; ctx.setLineDash([3, 8]);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.stroke();
      ctx.setLineDash([]);
    }

    // === ARRIVAL EFFECT ===
    if (tP > 0.9) {
      var arrivalT = (tP - 0.9) / 0.1;
      // Golden pulse around Mars
      ctx.strokeStyle = 'rgba(255,200,50,' + (arrivalT * 0.3).toFixed(2) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mx, my, 20 + arrivalT * 25, 0, Math.PI * 2); ctx.stroke();
      // Inner glow
      ctx.fillStyle = 'rgba(255,200,50,' + (arrivalT * 0.08).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(mx, my, 30 + arrivalT * 15, 0, Math.PI * 2); ctx.fill();
    }
    if (tP > 0.97) {
      // "ARRIVED" flash
      ctx.fillStyle = 'rgba(255,220,80,' + ((tP - 0.97) / 0.03 * 0.12).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(mx, my, 50, 0, Math.PI * 2); ctx.fill();
    }

    // === MONTH MARKERS along path ===
    for (var m = 1; m <= 6; m++) {
      var mT = m / 7;
      var mmR = eR + (mR - eR) * mT, mmA = launchA + Math.PI * mT;
      var mmx = cx + Math.cos(mmA) * mmR, mmy = cy + Math.sin(mmA) * mmR * 0.38;
      if (mT < tP) {
        ctx.fillStyle = 'rgba(255,200,50,0.25)';
        ctx.beginPath(); ctx.arc(mmx, mmy, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '8px Courier New'; ctx.textAlign = 'center';
        ctx.fillText(m + 'mo', mmx, mmy - 8);
      }
    }

    // === MISSION DATA PANEL ===
    var months = tP * 7;
    var kmDone = Math.floor(tP * 480);
    var kmLeft = 480 - kmDone;
    var pW = 240, pH = 200;

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(w - pW - 16, 16, pW, pH);
    ctx.strokeStyle = 'rgba(255,80,20,0.2)'; ctx.lineWidth = 1;
    ctx.strokeRect(w - pW - 16, 16, pW, pH);

    var px = w - pW - 6;
    ctx.fillStyle = '#ff5014'; ctx.font = 'bold 11px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('● LIVE MISSION DATA', px, 36);

    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '9px Courier New';
    ctx.fillText('Time Elapsed', px, 56);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Courier New';
    ctx.fillText(months.toFixed(1) + ' months', px, 80);

    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '9px Courier New';
    ctx.fillText('Distance Covered', px, 100);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Courier New';
    ctx.fillText(kmDone + 'M km', px, 124);

    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '9px Courier New';
    ctx.fillText('Remaining to Mars', px, 144);
    ctx.fillStyle = kmLeft < 60 ? '#ff5014' : '#fff'; ctx.font = 'bold 22px Courier New';
    ctx.fillText(kmLeft + 'M km', px, 168);

    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '9px Courier New';
    ctx.fillText('Speed: 11.6 km/s · 41,760 km/h', px, 190);

    // Progress bar inside panel
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(px, 198, pW - 20, 4);
    ctx.fillStyle = '#ff5014';
    ctx.fillRect(px, 198, (pW - 20) * tP, 4);

    // === STATUS TEXT ===
    ctx.textAlign = 'center';
    if (tP < 0.04) {
      ctx.fillStyle = 'rgba(100,200,255,0.7)'; ctx.font = 'bold 14px Courier New';
      ctx.fillText('▲ LAUNCH FROM EARTH', w / 2, h - 36);
    } else if (tP > 0.93) {
      ctx.fillStyle = 'rgba(255,120,50,0.9)'; ctx.font = 'bold 16px Courier New';
      ctx.fillText('★ ARRIVING AT MARS ★', w / 2, h - 36);
    } else {
      ctx.fillStyle = 'rgba(255,200,50,0.3)'; ctx.font = '11px Courier New';
      ctx.fillText('In transit · Hohmann Transfer Orbit · Minimum energy path', w / 2, h - 36);
    }

    // Bottom info
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '9px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('Earth → Mars · Elliptical Transfer', 14, h - 12);
    ctx.textAlign = 'right';
    ctx.fillText('480M km · 7 months · Next window: Nov 2026', w - 14, h - 12);

    requestAnimationFrame(draw);
  }
  draw();
})();
