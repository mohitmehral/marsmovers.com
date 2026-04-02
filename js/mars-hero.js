// Mars Hero — Closeup Starship with stainless steel detail
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

    // === SKY — dark gradient with Mars atmosphere tint ===
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#000005');
    sky.addColorStop(0.3, '#030208');
    sky.addColorStop(0.6, '#0a0510');
    sky.addColorStop(0.8, '#150a12');
    sky.addColorStop(1, '#1a0c0a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // Stars
    stars.forEach(function(s) {
      s.o += s.s; if (s.o > 0.5 || s.o < 0.1) s.s *= -1;
      ctx.fillStyle = 'rgba(255,255,255,' + s.o.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
    });

    // === STARSHIP — massive closeup, right-center ===
    var shipX = w * 0.62;
    var shipTop = h * 0.02;
    var shipBot = h * 0.92;
    var shipH = shipBot - shipTop;
    var shipW = Math.min(w * 0.14, 90);

    // === STAINLESS STEEL BODY ===
    // Main fuselage gradient — brushed steel look
    var bodyG = ctx.createLinearGradient(shipX - shipW, 0, shipX + shipW, 0);
    bodyG.addColorStop(0, '#888890');
    bodyG.addColorStop(0.15, '#b0b0b8');
    bodyG.addColorStop(0.3, '#d0d0d8');
    bodyG.addColorStop(0.5, '#e0e0e8');
    bodyG.addColorStop(0.65, '#c8c8d0');
    bodyG.addColorStop(0.85, '#a0a0a8');
    bodyG.addColorStop(1, '#707078');

    // Body shape — tall cylinder with nose cone
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(shipX - shipW, shipBot);
    ctx.lineTo(shipX - shipW, shipTop + shipH * 0.12);
    // Nose cone curve
    ctx.quadraticCurveTo(shipX - shipW, shipTop + shipH * 0.04, shipX - shipW * 0.5, shipTop + shipH * 0.02);
    ctx.quadraticCurveTo(shipX, shipTop - shipH * 0.01, shipX + shipW * 0.5, shipTop + shipH * 0.02);
    ctx.quadraticCurveTo(shipX + shipW, shipTop + shipH * 0.04, shipX + shipW, shipTop + shipH * 0.12);
    ctx.lineTo(shipX + shipW, shipBot);
    ctx.closePath();
    ctx.fill();

    // === WELD LINES — horizontal seams every ~40px ===
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 0.5;
    for (var wl = shipTop + shipH * 0.15; wl < shipBot; wl += 35) {
      ctx.beginPath(); ctx.moveTo(shipX - shipW, wl); ctx.lineTo(shipX + shipW, wl); ctx.stroke();
    }

    // === HEAT SHIELD TILES — bottom 35% ===
    var tileStart = shipBot - shipH * 0.35;
    ctx.fillStyle = 'rgba(15,15,18,0.7)';
    ctx.fillRect(shipX - shipW, tileStart, shipW * 2, shipH * 0.35);

    // Tile grid
    var tileSize = 12;
    ctx.strokeStyle = 'rgba(30,30,35,0.5)'; ctx.lineWidth = 0.5;
    for (var tx = shipX - shipW; tx < shipX + shipW; tx += tileSize) {
      for (var ty = tileStart; ty < shipBot; ty += tileSize) {
        ctx.strokeRect(tx, ty, tileSize, tileSize);
        // Slight color variation per tile
        if (Math.random() > 0.7) {
          ctx.fillStyle = 'rgba(20,20,25,' + (Math.random() * 0.15 + 0.05).toFixed(2) + ')';
          ctx.fillRect(tx, ty, tileSize, tileSize);
        }
      }
    }

    // === WINDOWS — row of small blue circles ===
    var winStartY = shipTop + shipH * 0.1;
    for (var wi = 0; wi < 6; wi++) {
      var wy = winStartY + wi * 22;
      // Window frame
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.arc(shipX, wy, 5, 0, Math.PI * 2); ctx.fill();
      // Glass
      var winGlow = 0.5 + Math.sin(frame * 0.02 + wi) * 0.2;
      ctx.fillStyle = 'rgba(80,180,255,' + winGlow.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(shipX, wy, 3.5, 0, Math.PI * 2); ctx.fill();
      // Reflection
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.arc(shipX - 1, wy - 1, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    // === FORWARD FLAPS — two canards near nose ===
    var flapY = shipTop + shipH * 0.18;
    // Left flap
    ctx.fillStyle = '#909098';
    ctx.beginPath();
    ctx.moveTo(shipX - shipW, flapY);
    ctx.lineTo(shipX - shipW - 35, flapY + 15);
    ctx.lineTo(shipX - shipW - 30, flapY + 50);
    ctx.lineTo(shipX - shipW, flapY + 40);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1; ctx.stroke();

    // Right flap
    ctx.fillStyle = '#a0a0a8';
    ctx.beginPath();
    ctx.moveTo(shipX + shipW, flapY);
    ctx.lineTo(shipX + shipW + 35, flapY + 15);
    ctx.lineTo(shipX + shipW + 30, flapY + 50);
    ctx.lineTo(shipX + shipW, flapY + 40);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.stroke();

    // === AFT FLAPS — two large fins at bottom ===
    var aftY = shipBot - shipH * 0.15;
    // Left aft
    ctx.fillStyle = '#808088';
    ctx.beginPath();
    ctx.moveTo(shipX - shipW, aftY);
    ctx.lineTo(shipX - shipW - 45, shipBot + 10);
    ctx.lineTo(shipX - shipW - 20, shipBot + 15);
    ctx.lineTo(shipX - shipW, shipBot);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.stroke();

    // Right aft
    ctx.fillStyle = '#909098';
    ctx.beginPath();
    ctx.moveTo(shipX + shipW, aftY);
    ctx.lineTo(shipX + shipW + 45, shipBot + 10);
    ctx.lineTo(shipX + shipW + 20, shipBot + 15);
    ctx.lineTo(shipX + shipW, shipBot);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.stroke();

    // === RAPTOR ENGINES — 3 visible at bottom ===
    var engY = shipBot - 5;
    for (var ei = -1; ei <= 1; ei++) {
      var engX = shipX + ei * shipW * 0.5;
      // Nozzle
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(engX, engY, 10, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(engX, engY, 7, 0, Math.PI); ctx.fill();
      // Inner glow — idle
      var engGlow = 0.15 + Math.sin(frame * 0.06 + ei) * 0.08;
      ctx.fillStyle = 'rgba(255,150,50,' + engGlow.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(engX, engY + 2, 5, 0, Math.PI); ctx.fill();
    }

    // === SPACEX LOGO AREA — dark band ===
    var logoY = shipTop + shipH * 0.35;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(shipX - shipW, logoY, shipW * 2, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('STARSHIP', shipX, logoY + 18);

    // === STEEL REFLECTION — vertical highlight ===
    var refG = ctx.createLinearGradient(shipX - shipW * 0.3, 0, shipX + shipW * 0.1, 0);
    refG.addColorStop(0, 'rgba(255,255,255,0)');
    refG.addColorStop(0.5, 'rgba(255,255,255,0.04)');
    refG.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = refG;
    ctx.fillRect(shipX - shipW * 0.3, shipTop + shipH * 0.05, shipW * 0.4, shipH * 0.9);

    // === LAUNCH TOWER — left side ===
    var towerX = shipX - shipW - 60;
    var towerW = 12;
    // Main column
    ctx.fillStyle = '#444';
    ctx.fillRect(towerX, h * 0.1, towerW, h * 0.85);
    // Cross beams
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5;
    for (var tb = h * 0.15; tb < h * 0.9; tb += 40) {
      ctx.beginPath(); ctx.moveTo(towerX, tb); ctx.lineTo(towerX + towerW, tb + 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(towerX + towerW, tb); ctx.lineTo(towerX, tb + 20); ctx.stroke();
    }
    // Arm connecting to ship
    var armY = shipTop + shipH * 0.3;
    ctx.fillStyle = '#555';
    ctx.fillRect(towerX + towerW, armY, shipX - shipW - towerX - towerW, 6);
    ctx.fillRect(towerX + towerW, armY + 30, shipX - shipW - towerX - towerW, 4);
    // Tower top
    ctx.fillStyle = '#555';
    ctx.fillRect(towerX - 4, h * 0.08, towerW + 8, 8);
    // Red warning lights on tower
    var tLight = Math.sin(frame * 0.04) > 0;
    ctx.fillStyle = tLight ? 'rgba(255,30,10,0.9)' : 'rgba(255,30,10,0.15)';
    ctx.beginPath(); ctx.arc(towerX + towerW / 2, h * 0.08, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = tLight ? 'rgba(255,30,10,0.6)' : 'rgba(255,30,10,0.1)';
    ctx.beginPath(); ctx.arc(towerX + towerW / 2, h * 0.5, 2.5, 0, Math.PI * 2); ctx.fill();

    // === GROUND / PAD ===
    ctx.fillStyle = '#1a0c0a';
    ctx.fillRect(0, h * 0.93, w, h * 0.07);
    ctx.fillStyle = '#0f0806';
    ctx.fillRect(0, h * 0.95, w, h * 0.05);
    // Pad markings
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(shipX - 80, h * 0.93, 160, 3);

    // === VAPOR / STEAM at base ===
    vapor.forEach(function(vp) {
      vp.x += vp.vx * 0.001;
      if (vp.x > 1.1 || vp.x < -0.1) vp.vx *= -1;
      var vpAlpha = vp.o + Math.sin(frame * 0.015 + vp.x * 10) * 0.02;
      ctx.fillStyle = 'rgba(180,180,190,' + vpAlpha.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(vp.x * w, vp.y * h, vp.r, 0, Math.PI * 2); ctx.fill();
    });

    // === AMBIENT LIGHT on ship from ground ===
    var ambG = ctx.createLinearGradient(0, h, 0, h * 0.7);
    ambG.addColorStop(0, 'rgba(255,100,40,0.04)');
    ambG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ambG; ctx.fillRect(0, h * 0.7, w, h * 0.3);

    requestAnimationFrame(draw);
  }
  draw();
})();
