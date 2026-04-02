// Mars Landing — Core Game Engine
// Phaser 3 scene with real Mars gravity, thrust, fuel, wind, terrain

var MARS_G = 3.72;
var SAFE_VSPD = 2.0;
var SAFE_HSPD = 1.5;
var SAFE_ANGLE = 10;
var GOOD_VSPD = 3.5;
var GOOD_ANGLE = 20;

// 5 MARS ZONES — each visually and mechanically distinct
var ZONES = [
  { name:'Jezero Crater',    fuel:100, wind:0.6,  padW:90, thrust:9.0, fuelBurn:0.12, rotSpd:2.8, terrain:'smooth', color:0x3d1a0a, sky:'#0a0505',
    surfLine:0x6b3015, rockColor:0x4a2010, desc:'Flat ancient lake bed — easiest landing zone',
    skyStops:['#000000','#0a0204','#1a0808','#3d1510','#6b2a15'] },
  { name:'Valles Marineris',  fuel:85,  wind:1.0,  padW:72, thrust:8.5, fuelBurn:0.14, rotSpd:2.5, terrain:'medium', color:0x4a1f0c, sky:'#0c0604',
    surfLine:0x8b4020, rockColor:0x5a2a12, desc:'Deep canyon walls — watch the crosswinds',
    skyStops:['#000000','#08020a','#1a0510','#4a1520','#7b3525'] },
  { name:'Olympus Mons Base', fuel:75,  wind:1.5,  padW:60, thrust:8.0, fuelBurn:0.16, rotSpd:2.3, terrain:'rough',  color:0x2e1208, sky:'#080303',
    surfLine:0x553018, rockColor:0x3a1a0a, desc:'Volcanic slopes — rough terrain, thin air',
    skyStops:['#000000','#050102','#120505','#2e1208','#4a2010'] },
  { name:'Hellas Basin',      fuel:65,  wind:2.0,  padW:50, thrust:7.5, fuelBurn:0.18, rotSpd:2.0, terrain:'jagged', color:0x1e0d06, sky:'#060202',
    surfLine:0x442210, rockColor:0x2a1008, desc:'Impact crater — jagged rocks, heavy gusts',
    skyStops:['#000000','#040101','#0e0404','#1e0d06','#3a1a0c'] },
  { name:'Polar Ice Cap',     fuel:55,  wind:2.5,  padW:42, thrust:7.0, fuelBurn:0.20, rotSpd:1.8, terrain:'extreme',color:0x1a2030, sky:'#040608',
    surfLine:0x3a4a5a, rockColor:0x2a3545, desc:'Frozen wasteland — ice, storms, tiny pad',
    skyStops:['#000000','#020308','#0a1020','#1a2030','#2a3545'] }
];

function getZone(lvl) { return ZONES[Math.min(lvl - 1, ZONES.length - 1)]; }

var gameState = {
  fuel: 100,
  vx: 0, vy: 0,
  angle: 0,
  thrusting: false,
  rotLeft: false,
  rotRight: false,
  wind: 0,
  windTimer: 0,
  landed: false,
  crashed: false,
  level: parseInt(localStorage.getItem('mm_level') || '1'),
  totalPts: parseInt(localStorage.getItem('mm_pts') || '0')
};

document.getElementById('nav-pts').textContent = 'Mission Points: ' + gameState.totalPts;

var config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  transparent: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: { preload: preload, create: create, update: update }
};

var game = new Phaser.Game(config);
var ship, terrain, pad, padMarkerL, padMarkerR, stars, thrustParticles, keys, W, H, zoneLabelText;
var coins = [], coinTimer = 0, coinScore = 0, coinGfxList = [];

function preload() {
  // All graphics created procedurally — no assets to load
}

function create() {
  var scene = this;
  W = scene.scale.width;
  H = scene.scale.height;

  scene.scale.on('resize', function(sz) {
    W = sz.width; H = sz.height;
  });

  // 3-layer parallax stars
  stars = [[],[],[]];
  var layers = [{count:60,maxR:0.6,alpha:0.15,depth:0},{count:50,maxR:1.0,alpha:0.3,depth:0},{count:30,maxR:1.6,alpha:0.55,depth:0}];
  for (var li = 0; li < 3; li++) {
    var cfg = layers[li];
    for (var i = 0; i < cfg.count; i++) {
      var s = scene.add.circle(
        Math.random() * W, Math.random() * H * 0.65,
        Math.random() * cfg.maxR + 0.2, 0xffffff, cfg.alpha + Math.random() * 0.1
      );
      s.setDepth(0);
      s.setData('speed', (li + 1) * 0.08);
      s.setData('baseY', s.y);
      stars[li].push(s);
    }
  }

  // Zone label
  zoneLabelText = scene.add.text(W/2, H*0.15, '', {
    fontFamily:'Courier New', fontSize:'13px', color:'#ff5014',
    align:'center', letterSpacing:4
  }).setOrigin(0.5).setDepth(1).setAlpha(0.5);

  // Generate terrain
  generateTerrain(scene);

  // Landing pad
  var z = getZone(gameState.level);
  var padX = W * 0.3 + Math.random() * W * 0.4;
  pad = scene.add.rectangle(padX, 0, z.padW, 6, 0x00ff88);
  pad.setDepth(3);
  positionPad(padX);

  // Pad markers
  padMarkerL = scene.add.rectangle(padX - z.padW/2 - 5, pad.y - 8, 4, 16, 0x00ff88).setDepth(3);
  padMarkerR = scene.add.rectangle(padX + z.padW/2 + 5, pad.y - 8, 4, 16, 0x00ff88).setDepth(3);

  // Ship — Starship-style lander (bigger, cylindrical, fins)
  ship = scene.add.container(W / 2, 60);
  ship.setDepth(5);

  var body = scene.add.graphics();
  // Main fuselage — tall rounded rectangle
  body.fillStyle(0xd8d8d8, 1);
  body.fillRoundedRect(-12, -32, 24, 52, 6);
  // Dark panel stripe
  body.fillStyle(0x222222, 0.6);
  body.fillRect(-10, -20, 20, 8);
  // Window strip — 3 small blue circles
  body.fillStyle(0x66ccff, 0.9);
  body.fillCircle(0, -24, 3);
  body.fillCircle(0, -16, 2.5);
  body.fillCircle(0, -8, 2.5);
  // Nose cone accent
  body.fillStyle(0xff5014, 1);
  body.fillTriangle(-8, -32, 8, -32, 0, -42);
  // Side fins
  body.fillStyle(0x999999, 0.9);
  body.fillTriangle(-12, 10, -12, 22, -22, 24);
  body.fillTriangle(12, 10, 12, 22, 22, 24);
  // Bottom fin
  body.fillStyle(0x888888, 0.8);
  body.fillTriangle(-4, 20, 4, 20, 0, 28);
  // Landing legs
  body.lineStyle(2, 0x777777, 0.9);
  body.lineBetween(-12, 20, -18, 30);
  body.lineBetween(12, 20, 18, 30);
  body.lineBetween(-18, 30, -22, 30);
  body.lineBetween(18, 30, 22, 30);
  // SpaceX-style black heat shield band
  body.fillStyle(0x111111, 0.5);
  body.fillRect(-12, 14, 24, 6);
  ship.add(body);

  // Thrust flame (hidden initially)
  var flame = scene.add.graphics();
  flame.setVisible(false);
  flame.setData('base', flame);
  ship.add(flame);
  ship.setData('flame', flame);

  // Input
  keys = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    w: Phaser.Input.Keyboard.KeyCodes.W,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    space: Phaser.Input.Keyboard.KeyCodes.SPACE
  });

  // Touch controls
  setupTouch();

  // Init state
  resetState();

  // Hide HUD until game starts
  document.getElementById('hud').style.opacity = '0';
  document.getElementById('wind-box').style.opacity = '0';
}

function generateTerrain(scene) {
  if (terrain) terrain.destroy();
  var gfx = scene.add.graphics();
  gfx.setDepth(2);

  var z = getZone(gameState.level);
  var groundY = H * 0.78;
  var points = [];
  var segments = 40;
  var segW = W / segments;

  // Terrain roughness based on zone
  var roughness = {smooth:0.6, medium:1.0, rough:1.5, jagged:2.2, extreme:3.0};
  var r = roughness[z.terrain] || 1.0;

  for (var i = 0; i <= segments; i++) {
    var x = i * segW;
    var variation = (Math.sin(i*0.5)*30 + Math.sin(i*1.3)*15 + Math.random()*20) * r;
    var y = groundY + variation;
    points.push({ x: x, y: y });
  }

  // Draw terrain fill
  gfx.fillStyle(z.color, 1);
  gfx.beginPath();
  gfx.moveTo(0, H);
  points.forEach(function(p) { gfx.lineTo(p.x, p.y); });
  gfx.lineTo(W, H);
  gfx.closePath();
  gfx.fillPath();

  // Surface line
  gfx.lineStyle(2, 0x6b3015, 1);
  gfx.beginPath();
  gfx.moveTo(points[0].x, points[0].y);
  for (var j = 1; j < points.length; j++) {
    gfx.lineTo(points[j].x, points[j].y);
  }
  gfx.strokePath();

  // Surface detail — small rocks
  for (var k = 0; k < 30; k++) {
    var rx = Math.random() * W;
    var idx = Math.floor(rx / segW);
    idx = Math.min(idx, points.length - 2);
    var t = (rx - points[idx].x) / segW;
    var ry = points[idx].y + (points[idx + 1].y - points[idx].y) * t;
    gfx.fillStyle(0x4a2010, 0.6);
    gfx.fillCircle(rx, ry - 2, Math.random() * 3 + 1);
  }

  terrain = gfx;
  terrain.setData('points', points);
  terrain.setData('segW', segW);
}

function positionPad(px) {
  var points = terrain.getData('points');
  var segW = terrain.getData('segW');
  var idx = Math.floor(px / segW);
  idx = Math.min(idx, points.length - 2);
  var t = (px - points[idx].x) / segW;
  var py = points[idx].y + (points[idx + 1].y - points[idx].y) * t;
  pad.setPosition(px, py - 3);
}

function getTerrainY(px) {
  var points = terrain.getData('points');
  var segW = terrain.getData('segW');
  var idx = Math.floor(px / segW);
  idx = Math.max(0, Math.min(idx, points.length - 2));
  var t = (px - points[idx].x) / segW;
  t = Math.max(0, Math.min(1, t));
  return points[idx].y + (points[idx + 1].y - points[idx].y) * t;
}

function resetState() {
  var z = getZone(gameState.level);
  gameState.fuel = z.fuel;
  gameState.vx = (Math.random() - 0.5) * 1.5;
  gameState.vy = 0.5;
  gameState.angle = 0;
  gameState.thrusting = false;
  gameState.rotLeft = false;
  gameState.rotRight = false;
  gameState.wind = (Math.random() - 0.5) * z.wind;
  gameState.windTimer = 0;
  gameState.landed = false;
  gameState.crashed = false;
  if (ship) {
    ship.setPosition(W / 2, 60);
    ship.setAngle(0);
    ship.setAlpha(1);
    ship.setVisible(true);
  }
  // Update zone label + HUD
  if (zoneLabelText) zoneLabelText.setText('ZONE ' + gameState.level + ' — ' + z.name.toUpperCase());
  var lvlEl = document.getElementById('h-level');
  if (lvlEl) lvlEl.textContent = gameState.level + '/5';
  var zoneEl = document.getElementById('h-zone');
  if (zoneEl) zoneEl.textContent = z.name;
  document.body.style.background = z.sky;
}

function setupTouch() {
  // Hide button controls
  var btns = document.getElementById('touch-controls');
  if (btns) btns.style.display = 'none';

  var canvas = document.querySelector('#game-container canvas');
  if (!canvas) return;

  var tStartX = 0, tStartY = 0, tStartTime = 0, isHolding = false, holdTimer = null;

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    tStartX = t.clientX;
    tStartY = t.clientY;
    tStartTime = Date.now();
    isHolding = false;
    // Long press = thrust (after 150ms)
    holdTimer = setTimeout(function() {
      isHolding = true;
      gameState.thrusting = true;
    }, 150);
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    var dx = t.clientX - tStartX;
    // Slide left/right = rotate
    if (dx > 25) {
      gameState.rotRight = true;
      gameState.rotLeft = false;
    } else if (dx < -25) {
      gameState.rotLeft = true;
      gameState.rotRight = false;
    } else {
      gameState.rotLeft = false;
      gameState.rotRight = false;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    clearTimeout(holdTimer);
    gameState.thrusting = false;
    gameState.rotLeft = false;
    gameState.rotRight = false;
    isHolding = false;
  }, { passive: false });

  // Mobile tooltip — auto disappear
  if ('ontouchstart' in window) {
    var tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;bottom:50px;left:50%;transform:translateX(-50%);z-index:200;background:rgba(255,80,20,0.15);border:1px solid rgba(255,80,20,0.4);padding:12px 20px;font-family:Courier New,monospace;font-size:.7rem;color:rgba(255,255,255,.7);text-align:center;letter-spacing:.06em;line-height:1.6;max-width:300px;transition:opacity .5s;border-radius:6px;';
    tip.innerHTML = 'Hold = Thrust \u00b7 Slide Left/Right = Rotate<br>Land slow & level on the green pad';
    document.body.appendChild(tip);
    setTimeout(function() { tip.style.opacity = '0'; }, 4000);
    setTimeout(function() { tip.remove(); }, 4600);
  }
}

function update(time, delta) {
  if (gameState.landed || gameState.crashed) return;
  if (document.getElementById('ov-start').classList.contains('hide') === false) return;

  var dt = delta / 1000;
  dt = Math.min(dt, 0.05); // cap delta

  var z = getZone(gameState.level);

  // Input
  var thrustOn = gameState.thrusting || keys.up.isDown || keys.w.isDown || keys.space.isDown;
  var thrustDown = keys.down.isDown || keys.s.isDown;
  var rotL = gameState.rotLeft || keys.left.isDown || keys.a.isDown;
  var rotR = gameState.rotRight || keys.right.isDown || keys.d.isDown;

  // Rotation
  if (rotL) gameState.angle -= z.rotSpd;
  if (rotR) gameState.angle += z.rotSpd;
  gameState.angle = Math.max(-90, Math.min(90, gameState.angle));
  ship.setAngle(gameState.angle);

  // Thrust UP
  var flame = ship.getData('flame');
  if (thrustOn && gameState.fuel > 0) {
    var rad = Phaser.Math.DegToRad(gameState.angle - 90);
    gameState.vx += Math.cos(rad) * z.thrust * dt;
    gameState.vy += Math.sin(rad) * z.thrust * dt;
    gameState.fuel -= z.fuelBurn;
    gameState.fuel = Math.max(0, gameState.fuel);

    flame.setVisible(true);
    flame.clear();
    var fl = 8 + Math.random() * 10;
    flame.fillStyle(0xffcc33, 0.9);
    flame.fillTriangle(-8, 22, 8, 22, 0, 22 + fl);
    flame.fillStyle(0xff5014, 0.5);
    flame.fillTriangle(-5, 22, 5, 22, 0, 22 + fl * 0.7);
    flame.fillStyle(0xffaa00, 0.3);
    flame.fillTriangle(-10, 22, -6, 22, -8, 22 + fl * 0.4);
    flame.fillTriangle(6, 22, 10, 22, 8, 22 + fl * 0.4);

    if (window.playThrustSound) window.playThrustSound(true);
  } else if (thrustDown && gameState.fuel > 0) {
    // Thrust DOWN — push ship downward faster (costs fuel)
    gameState.vy += z.thrust * 0.5 * dt;
    gameState.fuel -= z.fuelBurn * 0.5;
    gameState.fuel = Math.max(0, gameState.fuel);
    flame.setVisible(false);
    if (window.playThrustSound) window.playThrustSound(false);
  } else {
    flame.setVisible(false);
    if (window.playThrustSound) window.playThrustSound(false);
  }

  // Gravity
  gameState.vy += MARS_G * dt;

  // Wind
  gameState.windTimer += dt;
  if (gameState.windTimer > 3) {
    gameState.wind = (Math.random() - 0.5) * z.wind;
    gameState.windTimer = 0;
  }
  gameState.vx += gameState.wind * dt;

  // Move ship
  ship.x += gameState.vx;
  ship.y += gameState.vy;

  // Parallax stars
  if (stars && stars.length === 3) {
    for (var li = 0; li < 3; li++) {
      stars[li].forEach(function(s) {
        s.y += s.getData('speed');
        if (s.y > H * 0.65) { s.y = -5; s.x = Math.random() * W; }
      });
    }
  }

  // Wrap horizontal
  if (ship.x < -20) ship.x = W + 20;
  if (ship.x > W + 20) ship.x = -20;

  // Update HUD
  var alt = Math.max(0, getTerrainY(ship.x) - ship.y - 30);
  document.getElementById('h-alt').textContent = Math.floor(alt) + 'm';
  document.getElementById('h-vspd').textContent = gameState.vy.toFixed(1);
  document.getElementById('h-hspd').textContent = Math.abs(gameState.vx).toFixed(1);
  var fuelPct = Math.floor(gameState.fuel / z.fuel * 100);
  document.getElementById('h-fuel').style.width = fuelPct + '%';
  var fuelPctEl = document.getElementById('h-fuel-pct');
  if (fuelPctEl) fuelPctEl.textContent = fuelPct + '%';
  document.getElementById('h-angle').textContent = Math.floor(gameState.angle) + '°';

  // Fuel color + warning
  var fuelEl = document.getElementById('h-fuel');
  var fuelBox = document.getElementById('fuel-box');
  if (fuelPct < 15) {
    fuelEl.style.background = '#ff3333';
    if (fuelPctEl) fuelPctEl.style.color = '#ff3333';
    if (fuelBox) { fuelBox.classList.remove('fuel-low'); fuelBox.classList.add('fuel-critical'); }
    if (window.playFuelWarning) window.playFuelWarning(2);
  } else if (fuelPct < 30) {
    fuelEl.style.background = '#ffcc00';
    if (fuelPctEl) fuelPctEl.style.color = '#ffcc00';
    if (fuelBox) { fuelBox.classList.add('fuel-low'); fuelBox.classList.remove('fuel-critical'); }
    if (window.playFuelWarning) window.playFuelWarning(1);
  } else {
    fuelEl.style.background = '#ff5014';
    if (fuelPctEl) fuelPctEl.style.color = '#ff5014';
    if (fuelBox) { fuelBox.classList.remove('fuel-low','fuel-critical'); }
    if (window.playFuelWarning) window.playFuelWarning(0);
  }

  // Wind indicator
  var windArrow = document.getElementById('wind-arrow');
  if (Math.abs(gameState.wind) < 0.2) windArrow.textContent = '·';
  else if (gameState.wind > 0) windArrow.textContent = gameState.wind > 0.7 ? '⟫' : '›';
  else windArrow.textContent = gameState.wind < -0.7 ? '⟪' : '‹';

  // === BONUS COINS ===
  coinTimer += dt;
  // Spawn coins: first at 20s, then every 8-15s
  var firstSpawn = coins.length === 0 ? 20 : (8 + Math.random() * 7);
  if (coinTimer > firstSpawn) {
    coinTimer = 0;
    // Rarity: 60% = 5pts, 25% = 10pts, 10% = 20pts, 5% = 100pts
    var roll = Math.random();
    var val = roll < 0.05 ? 100 : roll < 0.15 ? 20 : roll < 0.40 ? 10 : 5;
    var cx = Math.random() * (W - 80) + 40;
    var cy = 40 + Math.random() * (H * 0.5);
    var scene = game.scene.scenes[0];
    var coinGfx = scene.add.graphics();
    coinGfx.setDepth(4);
    coins.push({ x: cx, y: cy, val: val, gfx: coinGfx, age: 0, maxAge: 6 + Math.random() * 4 });
  }
  // Update & draw coins
  for (var ci = coins.length - 1; ci >= 0; ci--) {
    var coin = coins[ci];
    coin.age += dt;
    // Bob up and down
    var bobY = coin.y + Math.sin(coin.age * 3) * 5;
    // Fade out near end
    var fadeAlpha = coin.age > coin.maxAge - 1.5 ? (coin.maxAge - coin.age) / 1.5 : 1;
    if (fadeAlpha <= 0) { coin.gfx.destroy(); coins.splice(ci, 1); continue; }
    // Draw coin
    coin.gfx.clear();
    var cSize = coin.val >= 100 ? 16 : coin.val >= 20 ? 13 : 10;
    var cColor = coin.val >= 100 ? 0xffd700 : coin.val >= 20 ? 0xffaa00 : coin.val >= 10 ? 0xff8800 : 0xffcc44;
    // Glow
    coin.gfx.fillStyle(cColor, 0.15 * fadeAlpha);
    coin.gfx.fillCircle(coin.x, bobY, cSize + 6);
    // Coin body
    coin.gfx.fillStyle(cColor, 0.9 * fadeAlpha);
    coin.gfx.fillCircle(coin.x, bobY, cSize);
    // Inner shine
    coin.gfx.fillStyle(0xffffff, 0.3 * fadeAlpha);
    coin.gfx.fillCircle(coin.x - 2, bobY - 2, cSize * 0.4);
    // Value text
    coin.gfx.fillStyle(0x000000, 0.8 * fadeAlpha);
    // Collision with ship
    var dx = ship.x - coin.x, dy = ship.y - coin.y;
    if (Math.sqrt(dx * dx + dy * dy) < cSize + 20) {
      coinScore += coin.val;
      // Show floating text
      if (window.showCoinPopup) window.showCoinPopup(coin.x, coin.y, coin.val);
      coin.gfx.destroy();
      coins.splice(ci, 1);
      continue;
    }
  }
  // Update coin HUD
  var coinEl = document.getElementById('h-coins');
  if (coinEl) coinEl.textContent = coinScore;

  // Check landing / crash
  var terrainY = getTerrainY(ship.x);
  var shipBottom = ship.y + 30;

  if (shipBottom >= terrainY) {
    var onPad = Math.abs(ship.x - pad.x) < 40;
    var absAngle = Math.abs(gameState.angle);
    var absVy = Math.abs(gameState.vy);
    var absVx = Math.abs(gameState.vx);

    if (onPad && absVy < GOOD_VSPD && absAngle < GOOD_ANGLE) {
      gameState.landed = true;
      ship.y = terrainY - 30;
      // Advance level on success
      if (gameState.level < 5) {
        gameState.level++;
        localStorage.setItem('mm_level', gameState.level);
      }
      if (window.onLanded) window.onLanded(absVy, absVx, absAngle, gameState.fuel, z, coinScore);
    } else {
      gameState.crashed = true;
      if (window.onCrashed) window.onCrashed(absVy, absVx, absAngle, z, coinScore);
    }
  }
}

// Start mission — called from overlay button
window.startMission = function() {
  document.getElementById('ov-start').classList.add('hide');
  document.getElementById('ov-result').classList.add('hide');
  var certEl = document.getElementById('ov-cert');
  if (certEl) certEl.classList.add('hide');
  document.getElementById('hud').style.opacity = '1';
  document.getElementById('wind-box').style.opacity = '1';

  var scene = game.scene.scenes[0];
  var z = getZone(gameState.level);

  generateTerrain(scene);

  // Resize pad for this zone
  var padX = W * 0.25 + Math.random() * W * 0.5;
  pad.setSize(z.padW, 6);
  positionPad(padX);
  if (padMarkerL) { padMarkerL.setPosition(padX - z.padW/2 - 5, pad.y - 8); }
  if (padMarkerR) { padMarkerR.setPosition(padX + z.padW/2 + 5, pad.y - 8); }

  resetState();
  // Clear coins
  coins.forEach(function(c){ if(c.gfx) c.gfx.destroy(); });
  coins = []; coinTimer = 0; coinScore = 0;
  var coinEl = document.getElementById('h-coins');
  if (coinEl) coinEl.textContent = '0';
};

// Reset to zone 1
window.resetProgress = function() {
  gameState.level = 1;
  localStorage.setItem('mm_level', 1);
};
