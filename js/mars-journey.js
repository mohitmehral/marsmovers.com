// Mars Journey — Centered orbits, visible, ship reaches Mars
(function(){
  var c = document.getElementById('journey-canvas');
  if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  var frame = 0, CYCLE = 1800;
  var stars = [], neb = [];
  for (var i = 0; i < 400; i++) stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.2, b: Math.random(), t: Math.random() > 0.92 ? 1 : Math.random() > 0.88 ? 2 : 0 });
  for (var n = 0; n < 40; n++) neb.push({ x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8, r: Math.random() * 60 + 20, o: Math.random() * 0.02 + 0.005, p: Math.random() > 0.5 });

  function draw() {
    var w = c.width, h = c.height;
    frame++;
    var tP = (frame % CYCLE) / CYCLE;

    // === BACKGROUND ===
    ctx.fillStyle = '#040408'; ctx.fillRect(0, 0, w, h);

    // Milky way
    ctx.save(); ctx.translate(w * 0.5, h * 0.5); ctx.rotate(-0.3);
    var mw = ctx.createLinearGradient(-w * 0.7, 0, w * 0.7, 0);
    mw.addColorStop(0, 'rgba(0,0,0,0)'); mw.addColorStop(0.35, 'rgba(50,40,80,0.04)');
    mw.addColorStop(0.5, 'rgba(70,60,110,0.06)'); mw.addColorStop(0.65, 'rgba(50,40,80,0.04)');
    mw.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mw; ctx.fillRect(-w, -h * 0.2, w * 2, h * 0.4); ctx.restore();

    neb.forEach(function(np) {
      ctx.fillStyle = (np.p ? 'rgba(70,35,120,' : 'rgba(35,55,130,') + np.o + ')';
      ctx.beginPath(); ctx.arc(np.x * w, np.y * h, np.r, 0, Math.PI * 2); ctx.fill();
    });

    stars.forEach(function(s) {
      var tw = 0.2 + Math.sin(frame * 0.012 + s.b * 200) * 0.2;
      var cl = s.t === 1 ? 'rgba(140,170,255,' : s.t === 2 ? 'rgba(255,210,170,' : 'rgba(255,255,255,';
      ctx.fillStyle = cl + tw.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
    });

    // === CENTERED SOLAR SYSTEM ===
    var cx = w * 0.5, cy = h * 0.5;
    var scale = Math.min(w, h);
    var eR = scale * 0.18;       // Earth orbit radius
    var mR = scale * 0.38;       // Mars orbit radius
    var FLAT = 0.55;              // Ellipse ratio — rounder than before

    // === ORBIT RINGS — bright, clearly visible ===
    // Earth orbit — blue
    ctx.strokeStyle = 'rgba(70,140,255,0.08)'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.ellipse(cx, cy, eR, eR * FLAT, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(70,140,255,0.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, eR, eR * FLAT, 0, 0, Math.PI * 2); ctx.stroke();

    // Mars orbit — red
    ctx.strokeStyle = 'rgba(255,80,30,0.06)'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.ellipse(cx, cy, mR, mR * FLAT, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,80,30,0.28)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, mR, mR * FLAT, 0, 0, Math.PI * 2); ctx.stroke();

    // Orbit distance labels — on the rings
    ctx.fillStyle = 'rgba(70,140,255,0.4)'; ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('Earth Orbit · 150M km', cx, cy + eR * FLAT + 16);
    ctx.fillStyle = 'rgba(255,80,30,0.4)';
    ctx.fillText('Mars Orbit · 228M km', cx, cy + mR * FLAT + 16);

    // === SUN — center ===
    var sg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 45);
    sg.addColorStop(0, 'rgba(255,240,120,1)'); sg.addColorStop(0.12, 'rgba(255,210,70,0.5)');
    sg.addColorStop(0.4, 'rgba(255,170,40,0.1)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe880'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 11px Courier New';
    ctx.fillText('Sun', cx, cy + 22);

    // === EARTH — fixed position on left of orbit ===
    var eAng = Math.PI * 0.85;
    var ex = cx + Math.cos(eAng) * eR, ey = cy + Math.sin(eAng) * eR * FLAT;

    ctx.fillStyle = 'rgba(60,130,255,0.1)'; ctx.beginPath(); ctx.arc(ex, ey, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3377ee'; ctx.beginPath(); ctx.arc(ex, ey, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(50,180,50,0.35)'; ctx.beginPath(); ctx.arc(ex + 3, ey - 3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220,230,255,0.3)'; ctx.beginPath(); ctx.arc(ex, ey - 11, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Courier New';
    ctx.fillText('\uD83C\uDF0D Earth', ex, ey + 32);

    // === MARS — fixed position on right of orbit ===
    var mAng = -Math.PI * 0.15;
    var mx = cx + Math.cos(mAng) * mR, my = cy + Math.sin(mAng) * mR * FLAT;

    ctx.fillStyle = 'rgba(255,60,20,0.08)'; ctx.beginPath(); ctx.arc(mx, my, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e84420'; ctx.beginPath(); ctx.arc(mx, my, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(100,30,10,0.3)'; ctx.beginPath(); ctx.arc(mx + 4, my + 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(220,225,235,0.3)'; ctx.beginPath(); ctx.arc(mx, my - 10, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Courier New';
    ctx.fillText('\uD83D\uDD34 Mars', mx, my + 30);

    // Mars satellites
    for (var si = 0; si < 3; si++) {
      var sa = frame * 0.005 + si * 2.1, sr = 20 + si * 6;
      var satx = mx + Math.cos(sa) * sr, saty = my + Math.sin(sa) * sr * 0.4;
      ctx.fillStyle = 'rgba(200,210,230,0.5)'; ctx.fillRect(satx - 2, saty - 1, 4, 2);
    }

    // Launch label
    if (tP < 0.08) {
      ctx.fillStyle = 'rgba(100,200,255,' + (0.7 - tP * 8).toFixed(2) + ')';
      ctx.font = 'bold 11px Courier New';
      ctx.fillText('\u25B2 LAUNCH', ex, ey - 28);
    }
    // Arrival label
    if (tP > 0.88) {
      ctx.fillStyle = 'rgba(255,200,50,' + ((tP - 0.88) / 0.12 * 0.8).toFixed(2) + ')';
      ctx.font = 'bold 12px Courier New';
      ctx.fillText('\u2605 ARRIVING', mx, my - 26);
    }

    // === BEZIER PATH — Earth to Mars exactly ===
    var cpx = cx + (mx - ex) * 0.4 - (ey - my) * 0.5;
    var cpy = cy - scale * 0.22;

    function pathAt(t) {
      var u = 1 - t;
      return { x: u * u * ex + 2 * u * t * cpx + t * t * mx, y: u * u * ey + 2 * u * t * cpy + t * t * my };
    }

    // Ghost path — full trajectory
    ctx.strokeStyle = 'rgba(255,200,60,0.07)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var g = 0; g <= 1; g += 0.004) { var gp = pathAt(g); g === 0 ? ctx.moveTo(gp.x, gp.y) : ctx.lineTo(gp.x, gp.y); }
    ctx.stroke();

    // Active path — bright
    ctx.strokeStyle = 'rgba(255,210,70,0.55)'; ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255,200,50,0.3)'; ctx.shadowBlur = 10;
    ctx.beginPath();
    for (var t = 0; t <= tP; t += 0.003) { var tp = pathAt(t); t === 0 ? ctx.moveTo(tp.x, tp.y) : ctx.lineTo(tp.x, tp.y); }
    ctx.stroke(); ctx.shadowBlur = 0;

    // Ship position
    var sp = pathAt(tP);
    var spN = pathAt(Math.min(1, tP + 0.01));
    var ang = Math.atan2(spN.y - sp.y, spN.x - sp.x) + Math.PI / 2;

    // Engine trail
    for (var tr = 0; tr < 12; tr++) {
      var trP = pathAt(Math.max(0, tP - tr * 0.007));
      ctx.fillStyle = 'rgba(255,200,50,' + ((1 - tr / 12) * 0.3).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(trP.x, trP.y, Math.max(0.5, 4 - tr * 0.3), 0, Math.PI * 2); ctx.fill();
    }

    // Ship — rotated along path
    ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(ang);
    ctx.fillStyle = '#ddd';
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(7, 10); ctx.lineTo(-7, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5014';
    ctx.beginPath(); ctx.moveTo(-4, -12); ctx.quadraticCurveTo(0, -22, 4, -12); ctx.fill();
    ctx.fillStyle = 'rgba(100,200,255,0.8)'; ctx.beginPath(); ctx.arc(0, -5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#999';
    ctx.beginPath(); ctx.moveTo(-7, 8); ctx.lineTo(-11, 13); ctx.lineTo(-7, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, 8); ctx.lineTo(11, 13); ctx.lineTo(7, 10); ctx.fill();
    var fl = 6 + Math.random() * 8;
    ctx.fillStyle = 'rgba(255,200,50,0.9)';
    ctx.beginPath(); ctx.moveTo(-5, 10); ctx.lineTo(5, 10); ctx.lineTo(0, 10 + fl); ctx.closePath(); ctx.fill();
    ctx.restore();

    // Month markers
    for (var m = 1; m <= 6; m++) {
      var mp = pathAt(m / 7);
      ctx.fillStyle = m / 7 <= tP ? 'rgba(255,200,50,0.4)' : 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.arc(mp.x, mp.y, m / 7 <= tP ? 3 : 1.5, 0, Math.PI * 2); ctx.fill();
      if (m / 7 <= tP) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '9px Courier New'; ctx.textAlign = 'center';
        ctx.fillText(m + ' mo', mp.x, mp.y - 10);
      }
    }

    // Arrival effect
    if (tP > 0.88) {
      var aT = (tP - 0.88) / 0.12;
      ctx.strokeStyle = 'rgba(255,200,50,' + (aT * 0.4).toFixed(2) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mx, my, 22 + aT * 30, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,200,50,' + (aT * 0.06).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(mx, my, 35 + aT * 20, 0, Math.PI * 2); ctx.fill();
    }

    // === DATA PANEL ===
    var mo = tP * 7, kmD = Math.floor(tP * 480), kmL = 480 - kmD;
    var pW = 220, pH = 200, px = w - pW - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(px - 6, 12, pW, pH);
    ctx.strokeStyle = 'rgba(255,80,20,0.15)'; ctx.lineWidth = 1; ctx.strokeRect(px - 6, 12, pW, pH);

    ctx.fillStyle = '#ff5014'; ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('\u25CF MISSION DATA', px, 30);

    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px Courier New'; ctx.fillText('Time', px, 48);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Courier New'; ctx.fillText(mo.toFixed(1) + ' months', px, 70);

    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px Courier New'; ctx.fillText('Covered', px, 88);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Courier New'; ctx.fillText(kmD + 'M km', px, 110);

    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '8px Courier New'; ctx.fillText('Remaining', px, 128);
    ctx.fillStyle = kmL < 60 ? '#ff5014' : '#fff'; ctx.font = 'bold 22px Courier New'; ctx.fillText(kmL + 'M km', px, 150);

    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px Courier New';
    ctx.fillText('Speed: 11.6 km/s', px, 170);
    ctx.fillText('41,760 km/h', px, 182);

    // Progress bar
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(px, 192, pW - 18, 4);
    ctx.fillStyle = '#ff5014'; ctx.fillRect(px, 192, (pW - 18) * tP, 4);

    // Status
    ctx.textAlign = 'center';
    if (tP < 0.05) { ctx.fillStyle = 'rgba(100,200,255,0.8)'; ctx.font = 'bold 14px Courier New'; ctx.fillText('\u25B2 LAUNCH FROM EARTH', w / 2, h - 30); }
    else if (tP > 0.92) { ctx.fillStyle = 'rgba(255,120,50,0.9)'; ctx.font = 'bold 16px Courier New'; ctx.fillText('\u2605 ARRIVING AT MARS \u2605', w / 2, h - 30); }
    else { ctx.fillStyle = 'rgba(255,200,50,0.3)'; ctx.font = '11px Courier New'; ctx.fillText('In transit \u00b7 ' + kmD + 'M of 480M km', w / 2, h - 30); }

    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '9px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('Hohmann Transfer \u00b7 ~7 months \u00b7 Next window: Nov 2026', 14, h - 10);

    requestAnimationFrame(draw);
  }
  draw();
})();
