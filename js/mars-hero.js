// Mars Hero — Starship right-aligned, responsive, Mars sky
(function(){
  var c = document.getElementById('mars-bg');
  if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  var stars = [], vapor = [], frame = 0;
  for (var i = 0; i < 120; i++) stars.push({ x: Math.random(), y: Math.random() * 0.5, r: Math.random() * 1.2 + 0.2, o: Math.random() * 0.4 + 0.1, s: Math.random() * 0.008 + 0.002 });
  for (var v = 0; v < 30; v++) vapor.push({ x: Math.random(), y: 0.85 + Math.random() * 0.15, r: Math.random() * 20 + 8, vx: (Math.random() - 0.5) * 0.3, o: Math.random() * 0.06 + 0.02 });

  function draw() {
    var w = c.width, h = c.height;
    frame++;

    // Responsive ship sizing
    var isSmall = w < 600;
    var isMed = w < 900;
    var shipW = isSmall ? w * 0.08 : isMed ? w * 0.07 : Math.min(w * 0.065, 70);
    var shipX = isSmall ? w * 0.75 : isMed ? w * 0.7 : w * 0.68;
    var groundY = h * 0.87;
    var shipBot = groundY;
    var shipTop = h * 0.08;
    var shipH = shipBot - shipTop;

    // === MARS SKY ===
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#000003');
    sky.addColorStop(0.2, '#050108');
    sky.addColorStop(0.45, '#120508');
    sky.addColorStop(0.65, '#2a0e08');
    sky.addColorStop(0.8, '#4a1a0c');
    sky.addColorStop(0.9, '#6b2a14');
    sky.addColorStop(1, '#8b3a1a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // Stars
    stars.forEach(function(s) {
      s.o += s.s; if (s.o > 0.5 || s.o < 0.1) s.s *= -1;
      ctx.fillStyle = 'rgba(255,255,255,' + s.o.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
    });

    // Mars terrain at bottom
    ctx.fillStyle = '#2a0e06'; ctx.beginPath(); ctx.moveTo(0, h);
    for (var t = 0; t <= w; t += 6) ctx.lineTo(t, h * 0.87 + Math.sin(t * 0.008) * 12 + Math.sin(t * 0.003) * 20);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1a0804'; ctx.beginPath(); ctx.moveTo(0, h);
    for (var f = 0; f <= w; f += 4) ctx.lineTo(f, h * 0.92 + Math.sin(f * 0.012) * 6 + Math.sin(f * 0.005) * 10);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();

    // === STARSHIP — right side, full height ===
    var bodyG = ctx.createLinearGradient(shipX - shipW, 0, shipX + shipW, 0);
    bodyG.addColorStop(0, '#9a9aa5'); bodyG.addColorStop(0.1, '#c0c0cc');
    bodyG.addColorStop(0.25, '#dcdce8'); bodyG.addColorStop(0.4, '#eeeef5');
    bodyG.addColorStop(0.55, '#e8e8f0'); bodyG.addColorStop(0.7, '#d0d0dc');
    bodyG.addColorStop(0.85, '#b0b0bc'); bodyG.addColorStop(1, '#808090');

    ctx.fillStyle = bodyG; ctx.beginPath();
    ctx.moveTo(shipX - shipW, shipBot);
    ctx.lineTo(shipX - shipW, shipTop + shipH * 0.12);
    ctx.quadraticCurveTo(shipX - shipW, shipTop + shipH * 0.04, shipX - shipW * 0.5, shipTop + shipH * 0.02);
    ctx.quadraticCurveTo(shipX, shipTop - shipH * 0.01, shipX + shipW * 0.5, shipTop + shipH * 0.02);
    ctx.quadraticCurveTo(shipX + shipW, shipTop + shipH * 0.04, shipX + shipW, shipTop + shipH * 0.12);
    ctx.lineTo(shipX + shipW, shipBot); ctx.closePath(); ctx.fill();

    // Weld lines
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 0.5;
    for (var wl = shipTop + shipH * 0.15; wl < shipBot; wl += 35) {
      ctx.beginPath(); ctx.moveTo(shipX - shipW, wl); ctx.lineTo(shipX + shipW, wl); ctx.stroke();
    }

    // Heat tiles — bottom 35%
    var tileStart = shipBot - shipH * 0.35;
    ctx.fillStyle = 'rgba(15,15,18,0.7)';
    ctx.fillRect(shipX - shipW, tileStart, shipW * 2, shipH * 0.35);
    var tileSize = isSmall ? 8 : 12;
    ctx.strokeStyle = 'rgba(30,30,35,0.5)'; ctx.lineWidth = 0.5;
    for (var tx = shipX - shipW; tx < shipX + shipW; tx += tileSize) {
      for (var ty = tileStart; ty < shipBot; ty += tileSize) {
        ctx.strokeRect(tx, ty, tileSize, tileSize);
      }
    }

    // Windows
    var winStartY = shipTop + shipH * 0.1;
    var winCount = isSmall ? 4 : 6;
    for (var wi = 0; wi < winCount; wi++) {
      var wy = winStartY + wi * (isSmall ? 18 : 22);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.arc(shipX, wy, isSmall ? 3.5 : 5, 0, Math.PI * 2); ctx.fill();
      var winGlow = 0.5 + Math.sin(frame * 0.02 + wi) * 0.2;
      ctx.fillStyle = 'rgba(80,180,255,' + winGlow.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(shipX, wy, isSmall ? 2.5 : 3.5, 0, Math.PI * 2); ctx.fill();
    }

    // Forward flaps
    var flapY = shipTop + shipH * 0.18;
    var flapW = isSmall ? 18 : 30;
    ctx.fillStyle = '#909098'; ctx.beginPath();
    ctx.moveTo(shipX - shipW, flapY); ctx.lineTo(shipX - shipW - flapW, flapY + 12);
    ctx.lineTo(shipX - shipW - flapW + 4, flapY + 45); ctx.lineTo(shipX - shipW, flapY + 35);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a0a0a8'; ctx.beginPath();
    ctx.moveTo(shipX + shipW, flapY); ctx.lineTo(shipX + shipW + flapW, flapY + 12);
    ctx.lineTo(shipX + shipW + flapW - 4, flapY + 45); ctx.lineTo(shipX + shipW, flapY + 35);
    ctx.closePath(); ctx.fill();

    // Aft fins
    var aftY = shipBot - shipH * 0.15;
    var aftW = isSmall ? 20 : 38;
    ctx.fillStyle = '#808088'; ctx.beginPath();
    ctx.moveTo(shipX - shipW, aftY); ctx.lineTo(shipX - shipW - aftW, shipBot + 8);
    ctx.lineTo(shipX - shipW - aftW + 16, shipBot + 12); ctx.lineTo(shipX - shipW, shipBot);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#909098'; ctx.beginPath();
    ctx.moveTo(shipX + shipW, aftY); ctx.lineTo(shipX + shipW + aftW, shipBot + 8);
    ctx.lineTo(shipX + shipW + aftW - 16, shipBot + 12); ctx.lineTo(shipX + shipW, shipBot);
    ctx.closePath(); ctx.fill();

    // Raptor engines
    var engSize = isSmall ? 5 : 8;
    for (var ei = -1; ei <= 1; ei++) {
      var engX = shipX + ei * shipW * 0.5;
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(engX, shipBot - 3, engSize, 0, Math.PI); ctx.fill();
      var engGlow = 0.15 + Math.sin(frame * 0.06 + ei) * 0.08;
      ctx.fillStyle = 'rgba(255,150,50,' + engGlow.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(engX, shipBot, engSize * 0.5, 0, Math.PI); ctx.fill();
    }

    // STARSHIP text
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.font = (isSmall ? '7' : '9') + 'px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('STARSHIP', shipX, shipTop + shipH * 0.38);

    // Steel reflection
    var refG = ctx.createLinearGradient(shipX - shipW * 0.3, 0, shipX + shipW * 0.1, 0);
    refG.addColorStop(0, 'rgba(255,255,255,0)'); refG.addColorStop(0.4, 'rgba(255,255,255,0.08)');
    refG.addColorStop(0.6, 'rgba(255,255,255,0.1)'); refG.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = refG; ctx.fillRect(shipX - shipW * 0.3, shipTop + shipH * 0.05, shipW * 0.4, shipH * 0.9);

    // Launch tower — left of ship
    if (!isSmall) {
      var towerX = shipX - shipW - (isMed ? 35 : 55);
      ctx.fillStyle = '#444'; ctx.fillRect(towerX, h * 0.12, 9, h * 0.78);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      for (var tb = h * 0.15; tb < h * 0.9; tb += 40) {
        ctx.beginPath(); ctx.moveTo(towerX, tb); ctx.lineTo(towerX + 10, tb + 20); ctx.stroke();
      }
      var armY = shipTop + shipH * 0.3;
      ctx.fillStyle = '#555'; ctx.fillRect(towerX + 10, armY, shipX - shipW - towerX - 10, 5);
      var tLight = Math.sin(frame * 0.04) > 0;
      ctx.fillStyle = tLight ? 'rgba(255,30,10,0.9)' : 'rgba(255,30,10,0.15)';
      ctx.beginPath(); ctx.arc(towerX + 5, h * 0.08, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Ground pad — flat area under ship
    ctx.fillStyle = '#1a0c0a'; ctx.fillRect(0, h * 0.92, w, h * 0.08);
    // Pad marking under ship
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(shipX - shipW * 2, groundY - 2, shipW * 4, 3);

    // Vapor
    vapor.forEach(function(vp) {
      vp.x += vp.vx * 0.001; if (vp.x > 1.1 || vp.x < -0.1) vp.vx *= -1;
      ctx.fillStyle = 'rgba(180,180,190,' + (vp.o + Math.sin(frame * 0.015 + vp.x * 10) * 0.02).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(vp.x * w, vp.y * h, vp.r, 0, Math.PI * 2); ctx.fill();
    });

    // Ambient light
    var ambG = ctx.createLinearGradient(0, h, 0, h * 0.7);
    ambG.addColorStop(0, 'rgba(255,100,40,0.04)'); ambG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ambG; ctx.fillRect(0, h * 0.7, w, h * 0.3);

    requestAnimationFrame(draw);
  }
  draw();
})();
