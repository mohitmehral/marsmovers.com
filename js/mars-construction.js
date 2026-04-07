// Mars Construction Animation — 60 seconds, 6 phases
// Shows robots building a data center on Mars surface
(function(){
  var c = document.getElementById('construction-canvas');
  if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  var frame = 0, TOTAL = 3600; // 60 seconds at 60fps
  var dust = [];
  for (var d = 0; d < 20; d++) dust.push({ x: Math.random(), y: Math.random() * 0.1, r: Math.random() * 3 + 1, vx: Math.random() * 0.2 + 0.05, o: Math.random() * 0.03 + 0.01 });

  // 6 phases, each 10 seconds
  var PHASES = [
    { name: 'Site Survey', start: 0 },
    { name: 'Foundation Prep', start: 600 },
    { name: 'Module Delivery', start: 1200 },
    { name: 'Robotic Assembly', start: 1800 },
    { name: 'Power & Connectivity', start: 2400 },
    { name: 'Operational', start: 3000 }
  ];

  function getPhase(f) {
    for (var i = PHASES.length - 1; i >= 0; i--) { if (f >= PHASES[i].start) return i; }
    return 0;
  }

  function draw() {
    var w = c.width, h = c.height;
    frame = (frame + 1) % TOTAL;
    var phase = getPhase(frame);
    var phaseT = (frame - PHASES[phase].start) / 600; // 0-1 within phase

    // Update UI
    var sec = Math.floor(frame / 60);
    document.getElementById('construction-phase').textContent = 'Phase ' + (phase + 1) + ': ' + PHASES[phase].name;
    document.getElementById('construction-timer').textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0') + ' / 1:00';

    // === SKY ===
    var sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#0a0204'); sky.addColorStop(0.5, '#1a0808'); sky.addColorStop(1, '#2a0e06');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (var si = 0; si < 30; si++) {
      ctx.beginPath(); ctx.arc(((si * 137) % w), ((si * 97) % (h * 0.4)), 0.6, 0, Math.PI * 2); ctx.fill();
    }

    // === TERRAIN ===
    var groundY = h * 0.7;
    ctx.fillStyle = '#2a0e06'; ctx.beginPath(); ctx.moveTo(0, h);
    for (var t = 0; t <= w; t += 4) ctx.lineTo(t, groundY + Math.sin(t * 0.008) * 8 + Math.sin(t * 0.02) * 3);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1e0a04'; ctx.fillRect(0, groundY + 10, w, h);

    // === BUILD SITE — center ===
    var siteX = w * 0.5, siteY = groundY;

    // Flat pad (always visible)
    ctx.fillStyle = '#1a0c08'; ctx.fillRect(siteX - 120, siteY - 2, 240, 4);

    // === PHASE 0: SURVEY — rover scanning ===
    if (phase >= 0) {
      var surveyDone = phase > 0 ? 1 : phaseT;
      // Survey rover
      var rvX = siteX - 100 + surveyDone * 200;
      var rvY = siteY - 6;
      drawRover(ctx, rvX, rvY, 0.8, frame);
      // Scan beam
      if (phase === 0) {
        ctx.strokeStyle = 'rgba(0,255,136,' + (0.15 + Math.sin(frame * 0.1) * 0.1).toFixed(2) + ')';
        ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(rvX, rvY - 15); ctx.lineTo(rvX, siteY - 40); ctx.stroke();
        ctx.setLineDash([]);
        // Scan dots on ground
        for (var sd = 0; sd < 5; sd++) {
          var sdx = siteX - 80 + sd * 40;
          if (sdx < rvX) {
            ctx.fillStyle = 'rgba(0,255,136,0.3)';
            ctx.beginPath(); ctx.arc(sdx, siteY - 1, 2, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    }

    // === PHASE 1: FOUNDATION — excavation + flat pad ===
    if (phase >= 1) {
      var foundT = phase > 1 ? 1 : phaseT;
      // Foundation growing
      var fW = 100 * foundT;
      ctx.fillStyle = '#333'; ctx.fillRect(siteX - fW, siteY - 3, fW * 2, 6);
      // Excavation robot
      if (phase === 1) {
        var exX = siteX - 100 + foundT * 200;
        drawBot(ctx, exX, siteY - 8, frame, '#ff8800');
        // Dirt particles
        for (var dp = 0; dp < 3; dp++) {
          ctx.fillStyle = 'rgba(100,50,20,0.3)';
          ctx.beginPath(); ctx.arc(exX + Math.sin(frame * 0.2 + dp) * 10, siteY - 12 - dp * 4, 2, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // === PHASE 2: MODULE DELIVERY — Starship lands, modules unload ===
    if (phase >= 2) {
      var delivT = phase > 2 ? 1 : phaseT;
      // Starship landing / landed
      var shipLandY = phase === 2 ? siteY - 120 - (1 - delivT) * 200 : siteY - 120;
      if (phase === 2 && delivT < 0.4) {
        // Ship descending
        drawStarship(ctx, siteX + 140, shipLandY, 0.5);
        // Engine flame
        var fl = 10 + Math.random() * 8;
        ctx.fillStyle = 'rgba(255,200,50,0.7)';
        ctx.beginPath(); ctx.moveTo(siteX + 137, shipLandY + 25); ctx.lineTo(siteX + 143, shipLandY + 25); ctx.lineTo(siteX + 140, shipLandY + 25 + fl); ctx.closePath(); ctx.fill();
      } else {
        // Ship landed
        drawStarship(ctx, siteX + 140, siteY - 120, 0.5);
      }
      // Modules being unloaded (appear after ship lands)
      if (delivT > 0.5) {
        var modT = (delivT - 0.5) / 0.5;
        var modCount = Math.floor(modT * 3);
        for (var mi = 0; mi < modCount; mi++) {
          var modX = siteX + 80 - mi * 50;
          var modTargetX = siteX - 40 + mi * 40;
          var modCurX = modX + (modTargetX - modX) * Math.min(1, (modT - mi * 0.3) * 3);
          drawModule(ctx, modCurX, siteY - 12, mi);
        }
        // Transport rover
        if (phase === 2) {
          drawRover(ctx, modCurX + 20, siteY - 6, 0.6, frame);
        }
      }
    }

    // === PHASE 3: ASSEMBLY — robots building structure ===
    if (phase >= 3) {
      var asmT = phase > 3 ? 1 : phaseT;
      // Structure growing
      var structH = 50 * asmT;
      var structW = 80;
      // Main building
      ctx.fillStyle = '#444'; ctx.fillRect(siteX - structW / 2, siteY - 3 - structH, structW, structH);
      // Roof
      if (asmT > 0.6) {
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(siteX - structW / 2 - 5, siteY - 3 - structH);
        ctx.lineTo(siteX, siteY - 3 - structH - 15 * ((asmT - 0.6) / 0.4));
        ctx.lineTo(siteX + structW / 2 + 5, siteY - 3 - structH);
        ctx.closePath(); ctx.fill();
      }
      // Windows appearing
      if (asmT > 0.4) {
        var winCount = Math.floor((asmT - 0.4) / 0.15);
        for (var wi = 0; wi < Math.min(winCount, 4); wi++) {
          ctx.fillStyle = 'rgba(80,180,255,' + (0.3 + Math.sin(frame * 0.02 + wi) * 0.15).toFixed(2) + ')';
          ctx.fillRect(siteX - 30 + wi * 18, siteY - structH + 10, 8, 6);
        }
      }
      // Assembly robots
      if (phase === 3) {
        drawBot(ctx, siteX - structW / 2 - 15, siteY - 3 - structH * 0.5, frame, '#4488ff');
        drawBot(ctx, siteX + structW / 2 + 10, siteY - 3 - structH * 0.3, frame, '#4488ff');
        // Welding sparks
        if (Math.sin(frame * 0.15) > 0) {
          for (var sp = 0; sp < 4; sp++) {
            ctx.fillStyle = 'rgba(255,220,100,0.6)';
            ctx.beginPath(); ctx.arc(siteX - structW / 2 - 5 + Math.random() * 10, siteY - 3 - structH * 0.5 + Math.random() * 10 - 5, 1, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      // Placed modules inside
      for (var pm = 0; pm < 3; pm++) {
        drawModule(ctx, siteX - 30 + pm * 30, siteY - 12, pm);
      }
    }

    // === PHASE 4: POWER & CONNECTIVITY ===
    if (phase >= 4) {
      var pwrT = phase > 4 ? 1 : phaseT;
      // Solar panels
      var panelCount = Math.floor(pwrT * 4);
      for (var pi = 0; pi < panelCount; pi++) {
        var px = siteX - 100 - pi * 25;
        ctx.fillStyle = '#223388'; ctx.fillRect(px - 10, siteY - 8, 20, 3);
        ctx.fillStyle = '#444'; ctx.fillRect(px - 1, siteY - 5, 2, 5);
      }
      // Nuclear reactor (right side)
      if (pwrT > 0.3) {
        ctx.fillStyle = '#555'; ctx.fillRect(siteX + 60, siteY - 20, 16, 20);
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(siteX + 68, siteY - 22, 8, Math.PI, 0); ctx.fill();
        // Glow
        var rGlow = 0.1 + Math.sin(frame * 0.04) * 0.05;
        ctx.fillStyle = 'rgba(100,255,150,' + rGlow.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(siteX + 68, siteY - 22, 4, 0, Math.PI * 2); ctx.fill();
      }
      // Antenna / Starlink dish
      if (pwrT > 0.6) {
        ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(siteX, siteY - 68); ctx.lineTo(siteX, siteY - 90); ctx.stroke();
        ctx.fillStyle = '#aaa';
        ctx.beginPath(); ctx.arc(siteX, siteY - 92, 6, Math.PI, 0); ctx.fill();
        // Signal waves
        if (phase === 4 || phase === 5) {
          for (var sw = 0; sw < 3; sw++) {
            var swR = 10 + sw * 8 + (frame % 30);
            ctx.strokeStyle = 'rgba(100,200,255,' + (0.15 - sw * 0.04).toFixed(2) + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.arc(siteX, siteY - 92, swR, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke();
          }
        }
      }
    }

    // === PHASE 5: OPERATIONAL — lights on, data flowing ===
    if (phase >= 5) {
      var opT = phaseT;
      // All windows lit
      for (var ow = 0; ow < 4; ow++) {
        var owGlow = 0.5 + Math.sin(frame * 0.03 + ow * 0.5) * 0.2;
        ctx.fillStyle = 'rgba(80,180,255,' + owGlow.toFixed(2) + ')';
        ctx.fillRect(siteX - 30 + ow * 18, siteY - 53 + 10, 8, 6);
      }
      // Status light on roof
      var statusOn = Math.sin(frame * 0.05) > 0;
      ctx.fillStyle = statusOn ? 'rgba(0,255,136,0.8)' : 'rgba(0,255,136,0.15)';
      ctx.beginPath(); ctx.arc(siteX, siteY - 70, 3, 0, Math.PI * 2); ctx.fill();
      if (statusOn) {
        ctx.fillStyle = 'rgba(0,255,136,0.1)';
        ctx.beginPath(); ctx.arc(siteX, siteY - 70, 10, 0, Math.PI * 2); ctx.fill();
      }
      // Data flow particles going up to antenna
      for (var df = 0; df < 3; df++) {
        var dfY = siteY - 55 - ((frame * 2 + df * 20) % 40);
        ctx.fillStyle = 'rgba(100,200,255,0.4)';
        ctx.beginPath(); ctx.arc(siteX, dfY, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      // "OPERATIONAL" text
      ctx.fillStyle = 'rgba(0,255,136,0.4)'; ctx.font = 'bold 9px Courier New'; ctx.textAlign = 'center';
      ctx.fillText('● OPERATIONAL', siteX, siteY + 20);
    }

    // === DUST ===
    dust.forEach(function(dp) {
      dp.x += dp.vx * 0.001; if (dp.x > 1.1) dp.x = -0.1;
      ctx.fillStyle = 'rgba(150,80,40,' + dp.o.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(dp.x * w, groundY - 5 + dp.y * h, dp.r, 0, Math.PI * 2); ctx.fill();
    });

    // === PHASE PROGRESS BAR ===
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(10, 10, w - 20, 4);
    ctx.fillStyle = 'rgba(255,80,20,0.5)'; ctx.fillRect(10, 10, (w - 20) * (frame / TOTAL), 4);
    // Phase markers
    for (var pm2 = 0; pm2 < PHASES.length; pm2++) {
      var pmX = 10 + (w - 20) * (PHASES[pm2].start / TOTAL);
      ctx.fillStyle = pm2 <= phase ? 'rgba(255,80,20,0.6)' : 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.arc(pmX, 12, 3, 0, Math.PI * 2); ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  // === HELPER: Draw rover ===
  function drawRover(ctx, x, y, scale, f) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = '#bbb'; ctx.fillRect(-10, -6, 20, 7);
    ctx.fillStyle = '#999'; ctx.fillRect(-6, -12, 12, 6);
    ctx.fillStyle = '#666';
    ctx.beginPath(); ctx.arc(-8, 2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, 2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(-8, 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, 2, 2, 0, Math.PI * 2); ctx.fill();
    // Antenna
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(4, -12); ctx.lineTo(6, -20); ctx.stroke();
    var blink = Math.sin(f * 0.06) > 0;
    ctx.fillStyle = blink ? 'rgba(255,50,20,0.8)' : 'rgba(255,50,20,0.15)';
    ctx.beginPath(); ctx.arc(6, -20, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // === HELPER: Draw construction bot ===
  function drawBot(ctx, x, y, f, color) {
    ctx.fillStyle = color || '#4488ff';
    ctx.fillRect(x - 5, y - 8, 10, 10);
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 3, y + 2, 2, 4);
    ctx.fillRect(x + 1, y + 2, 2, 4);
    // Arm
    ctx.strokeStyle = color || '#4488ff'; ctx.lineWidth = 1.5;
    var armAngle = Math.sin(f * 0.08) * 0.4;
    ctx.beginPath(); ctx.moveTo(x + 5, y - 4);
    ctx.lineTo(x + 5 + Math.cos(armAngle) * 10, y - 4 + Math.sin(armAngle) * 10);
    ctx.stroke();
    // Eye
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(x, y - 4, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  // === HELPER: Draw data center module ===
  function drawModule(ctx, x, y, index) {
    var colors = ['#556', '#565', '#655'];
    ctx.fillStyle = colors[index % 3];
    ctx.fillRect(x - 8, y - 10, 16, 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(x - 8, y - 10, 16, 10);
    // Indicator light
    ctx.fillStyle = 'rgba(0,255,136,0.4)';
    ctx.beginPath(); ctx.arc(x, y - 5, 1, 0, Math.PI * 2); ctx.fill();
  }

  // === HELPER: Draw mini Starship ===
  function drawStarship(ctx, x, y, scale) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(-8, 50); ctx.lineTo(-8, -30);
    ctx.quadraticCurveTo(-8, -45, 0, -50);
    ctx.quadraticCurveTo(8, -45, 8, -30);
    ctx.lineTo(8, 50); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5014';
    ctx.beginPath(); ctx.moveTo(-5, -35); ctx.quadraticCurveTo(0, -52, 5, -35); ctx.fill();
    ctx.fillStyle = '#222'; ctx.fillRect(-8, 30, 16, 15);
    ctx.fillStyle = 'rgba(80,180,255,0.5)';
    ctx.beginPath(); ctx.arc(0, -25, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.moveTo(-8, 45); ctx.lineTo(-14, 54); ctx.lineTo(-8, 50); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, 45); ctx.lineTo(14, 54); ctx.lineTo(8, 50); ctx.fill();
    ctx.restore();
  }

  // Start when visible
  var started = false;
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !started) { started = true; draw(); }
  }, { threshold: 0.2 });
  obs.observe(c);
})();
