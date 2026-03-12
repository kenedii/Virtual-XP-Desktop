import * as T from 'three';

// ============================================================
//  SPACESHIP INTERIOR  —  Y2K Chrome aesthetic
//  Two modes: SKY (blue sky + clouds) / SPACE (galaxy + stars)
// ============================================================

const instances = new Map();

// ---- Canvas helpers ----
function getSize(canvas) {
  const r = canvas.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { w: r.width, h: r.height } : { w: 800, h: 560 };
}

// ============================================================
//  SKY TEXTURE  — bright blue sky with fluffy white clouds
// ============================================================
function makeSkyViewTexture() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,    '#1a6ed8');
  sky.addColorStop(0.35, '#3a99f5');
  sky.addColorStop(0.65, '#74c2ff');
  sky.addColorStop(0.88, '#b8e4ff');
  sky.addColorStop(1,    '#dff3ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun
  const sx = W * 0.72, sy = H * 0.18;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 180);
  sg.addColorStop(0,   'rgba(255,255,230,0.8)');
  sg.addColorStop(0.25,'rgba(255,245,200,0.4)');
  sg.addColorStop(1,   'rgba(255,230,160,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, H);
  ctx.beginPath();
  ctx.arc(sx, sy, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,230,0.98)';
  ctx.fill();

  // Pure white fluffy clouds
  function drawCloud(cx, cy, sc, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const puffs = [
      [0,0,1.0],[-0.55,0.1,0.75],[0.55,0.08,0.78],
      [-0.25,-0.25,0.60],[0.28,-0.22,0.65],[0,-0.3,0.55],
      [-0.82,0.2,0.5],[0.82,0.18,0.52],[0,0.28,0.48],
      [-0.42,0.38,0.42],[0.42,0.34,0.45],[-1.05,0.04,0.36],[1.05,0.0,0.38],
    ];
    puffs.forEach(([px, py, pr]) => {
      const r = pr * sc;
      const g = ctx.createRadialGradient(cx+px*sc-r*0.2, cy+py*sc-r*0.2, 0, cx+px*sc, cy+py*sc, r);
      g.addColorStop(0,    'rgba(255,255,255,1)');
      g.addColorStop(0.45, 'rgba(255,255,255,0.97)');
      g.addColorStop(0.82, 'rgba(248,252,255,0.7)');
      g.addColorStop(1,    'rgba(240,250,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx+px*sc, cy+py*sc, r, r*0.7, 0, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawCloud(180,  180, 100, 0.97);
  drawCloud(600,  155, 130, 0.95);
  drawCloud(380,  220,  80, 0.92);
  drawCloud(870,  195, 110, 0.93);
  drawCloud(780,  300,  65, 0.87);
  drawCloud(100,  310,  75, 0.85);
  drawCloud(500,  340,  55, 0.82);
  drawCloud(950,  340,  50, 0.78);
  for (let i = 0; i < 10; i++) {
    drawCloud(60 + Math.random()*(W-120), 80 + Math.random()*200, 16+Math.random()*28, 0.5+Math.random()*0.25);
  }

  // Horizon haze
  const hz = ctx.createLinearGradient(0, H*0.65, 0, H);
  hz.addColorStop(0, 'rgba(255,255,255,0)');
  hz.addColorStop(1, 'rgba(230,248,255,0.5)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, 0, W, H);

  const tex = new T.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  SPACE TEXTURE  — galaxy, nebula, stars
// ============================================================
function makeSpaceViewTexture() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Deep space background
  ctx.fillStyle = '#000408';
  ctx.fillRect(0, 0, W, H);

  // Nebula clouds — layered colour blobs
  const nebulas = [
    { x: W*0.15, y: H*0.45, r: 200, c1: 'rgba(60,0,120,0.38)', c2: 'rgba(120,0,80,0.22)' },
    { x: W*0.55, y: H*0.35, r: 260, c1: 'rgba(0,40,120,0.32)', c2: 'rgba(0,80,160,0.18)' },
    { x: W*0.82, y: H*0.55, r: 190, c1: 'rgba(0,120,100,0.30)', c2: 'rgba(0,160,80,0.14)' },
    { x: W*0.35, y: H*0.65, r: 150, c1: 'rgba(100,0,60,0.28)', c2: 'rgba(180,60,0,0.15)' },
    { x: W*0.70, y: H*0.25, r: 140, c1: 'rgba(40,0,100,0.35)', c2: 'rgba(100,20,180,0.18)' },
  ];
  nebulas.forEach(({ x, y, r, c1, c2 }) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c1);
    g.addColorStop(0.5, c2);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  });

  // Milky Way band — faint bright streak
  ctx.save();
  ctx.globalAlpha = 0.12;
  const mw = ctx.createLinearGradient(0, H*0.2, W, H*0.8);
  mw.addColorStop(0, 'rgba(200,210,255,0)');
  mw.addColorStop(0.3, 'rgba(200,210,255,0.45)');
  mw.addColorStop(0.5, 'rgba(180,200,255,0.6)');
  mw.addColorStop(0.7, 'rgba(200,210,255,0.45)');
  mw.addColorStop(1, 'rgba(200,210,255,0)');
  ctx.fillStyle = mw;
  ctx.beginPath();
  ctx.ellipse(W*0.5, H*0.5, W*0.52, H*0.22, 0.2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // Stars — varying size and brightness
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random();
    let size, alpha;
    if (r > 0.992) { size = 2.5; alpha = 0.95; }       // bright star
    else if (r > 0.97) { size = 1.5; alpha = 0.85; }   // medium
    else if (r > 0.88) { size = 1.0; alpha = 0.65; }   // small
    else { size = 0.5; alpha = 0.35 + Math.random()*0.35; } // dim

    // Tint variation
    const tints = ['rgba(255,255,255,', 'rgba(200,220,255,', 'rgba(255,240,200,', 'rgba(180,210,255,'];
    const tint = tints[Math.floor(Math.random() * tints.length)];
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2);
    ctx.fillStyle = tint + alpha + ')';
    ctx.fill();

    // Diffraction spikes on brightest stars
    if (r > 0.995) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = 'rgba(200,220,255,0.6)';
      ctx.lineWidth = 0.5;
      [[-5,0,5,0],[0,-5,0,5],[-3,-3,3,3],[-3,3,3,-3]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x+x1,y+y1); ctx.lineTo(x+x2,y+y2); ctx.stroke();
      });
      ctx.restore();
    }
  }

  // Bright planets / distant objects
  function hexToRgba(hex, a) {
    const h = hex.replace('#', '');
    const r2 = parseInt(h.slice(0,2), 16);
    const g2 = parseInt(h.slice(2,4), 16);
    const b2 = parseInt(h.slice(4,6), 16);
    return `rgba(${r2},${g2},${b2},${a})`;
  }

  const planets = [
    { x: W*0.12, y: H*0.22, r: 14, c: '#e8c870', rim: '#ffaa20' },
    { x: W*0.88, y: H*0.68, r: 9,  c: '#9bbcde', rim: '#b8d4f0' },
    { x: W*0.42, y: H*0.15, r: 6,  c: '#d4806a', rim: '#ff9966' },
  ];
  planets.forEach(({ x, y, r, c, rim }) => {
    const g = ctx.createRadialGradient(x-r*0.3, y-r*0.3, 0, x, y, r);
    g.addColorStop(0, rim);
    g.addColorStop(0.6, c);
    g.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
    // glow halo
    const halo = ctx.createRadialGradient(x, y, r, x, y, r*3);
    halo.addColorStop(0, hexToRgba(c, 0.35));
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(x, y, r*3, 0, Math.PI*2);
    ctx.fillStyle = halo;
    ctx.fill();
  });

  const tex = new T.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  CHROME NORMAL MAP
// ============================================================
function makeChromeNormal() {
  const S = 128;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8080ff'; ctx.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 2) {
    const v = 0.5 + (Math.random()-0.5)*0.05;
    ctx.fillStyle = `rgba(${Math.floor(v*255)},${Math.floor(v*255)},255,1)`;
    ctx.fillRect(0, y, S, 2);
  }
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(4, 8);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  PANEL TEXTURE  — brushed metal grid with rivets
// ============================================================
function makePanelTexture(tint = '#8899bb') {
  const S = 256;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');

  // Base metal fill
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0,   '#b8ccdd');
  bg.addColorStop(0.3, '#8899bb');
  bg.addColorStop(0.6, '#99aabb');
  bg.addColorStop(1,   '#6677aa');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);

  // Brushed horizontal lines
  for (let y = 0; y < S; y += 3) {
    const v = 0.65 + Math.random()*0.18;
    ctx.fillStyle = `rgba(255,255,255,${(v-0.65)*0.4})`;
    ctx.fillRect(0, y, S, 1);
    ctx.fillStyle = `rgba(0,0,0,${(0.83-v)*0.3})`;
    ctx.fillRect(0, y+1, S, 1);
  }

  // Panel seam lines — grid
  ctx.strokeStyle = 'rgba(40,55,80,0.55)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(i*(S/3), 0); ctx.lineTo(i*(S/3), S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*(S/3)); ctx.lineTo(S, i*(S/3)); ctx.stroke();
  }
  // Highlight seams
  ctx.strokeStyle = 'rgba(200,220,255,0.25)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(i*(S/3)+1.5, 0); ctx.lineTo(i*(S/3)+1.5, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*(S/3)+1.5); ctx.lineTo(S, i*(S/3)+1.5); ctx.stroke();
  }

  // Rivets at intersections
  for (let ix = 1; ix < 4; ix++) {
    for (let iy = 1; iy < 4; iy++) {
      const rx = ix*(S/3), ry = iy*(S/3);
      const rg = ctx.createRadialGradient(rx-1, ry-1, 0, rx, ry, 5);
      rg.addColorStop(0, 'rgba(220,235,255,0.9)');
      rg.addColorStop(0.4, 'rgba(140,160,200,0.7)');
      rg.addColorStop(1, 'rgba(60,80,120,0.5)');
      ctx.beginPath(); ctx.arc(rx, ry, 4.5, 0, Math.PI*2);
      ctx.fillStyle = rg; ctx.fill();
      ctx.beginPath(); ctx.arc(rx, ry, 4.5, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(40,60,100,0.6)'; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }

  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  FLOOR TEXTURE  — dark chrome tile
// ============================================================
function makeFloorTexture() {
  const S = 256;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');

  const tile = S / 4;
  for (let tx = 0; tx < 4; tx++) {
    for (let ty = 0; ty < 4; ty++) {
      const x = tx * tile, y = ty * tile;
      const even = (tx + ty) % 2 === 0;
      const bg2 = ctx.createLinearGradient(x, y, x+tile, y+tile);
      if (even) {
        bg2.addColorStop(0, '#1c2635'); bg2.addColorStop(1, '#131c28');
      } else {
        bg2.addColorStop(0, '#0e1620'); bg2.addColorStop(1, '#0a1018');
      }
      ctx.fillStyle = bg2;
      ctx.fillRect(x, y, tile, tile);
      // Tile highlight
      ctx.fillStyle = 'rgba(100,140,200,0.07)';
      ctx.fillRect(x+1, y+1, tile-2, tile-2);
    }
  }
  // Grout lines
  ctx.strokeStyle = 'rgba(80,120,180,0.28)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(i*tile, 0); ctx.lineTo(i*tile, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*tile); ctx.lineTo(S, i*tile); ctx.stroke();
  }

  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  CEILING TEXTURE  — light panels + chrome grid
// ============================================================
function makeCeilingTexture() {
  const S = 256;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8899bb'; ctx.fillRect(0, 0, S, S);

  // Light panel cells
  const cell = S / 3;
  for (let cx = 0; cx < 3; cx++) {
    for (let cy = 0; cy < 3; cy++) {
      const x = cx*cell + 4, y = cy*cell + 4;
      const w2 = cell - 8, h2 = cell - 8;
      const cg = ctx.createRadialGradient(x+w2/2, y+h2/2, 0, x+w2/2, y+h2/2, w2*0.6);
      cg.addColorStop(0, 'rgba(200,230,255,0.9)');
      cg.addColorStop(0.5, 'rgba(160,200,240,0.6)');
      cg.addColorStop(1, 'rgba(100,140,200,0.2)');
      ctx.fillStyle = cg;
      ctx.fillRect(x, y, w2, h2);
      ctx.strokeStyle = 'rgba(160,185,220,0.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w2, h2);
    }
  }

  // Chrome frame grid
  ctx.strokeStyle = 'rgba(80,100,150,0.6)';
  ctx.lineWidth = 3;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(i*cell, 0); ctx.lineTo(i*cell, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*cell); ctx.lineTo(S, i*cell); ctx.stroke();
  }

  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  SCREEN / HUD TEXTURE  — Y2K computer displays
// ============================================================
function makeScreenTexture(label = 'SYS', color = '#00ffcc') {
  const W = 200, H = 130;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#020d1a'; ctx.fillRect(0, 0, W, H);
  // Scanlines
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, y, W, 1);
  }
  // CRT glow border
  const crtg = ctx.createLinearGradient(0, 0, 0, H);
  crtg.addColorStop(0, 'rgba(0,180,150,0.05)');
  crtg.addColorStop(0.5, 'rgba(0,255,200,0.03)');
  crtg.addColorStop(1, 'rgba(0,180,150,0.05)');
  ctx.fillStyle = crtg; ctx.fillRect(0, 0, W, H);

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;

  // Fake data lines
  const lines = [
    `[${label}] INITIALIZING...`,
    `CORE TEMP:  288K   OK`,
    `THRUST:  98.4%    ████`,
    `SHIELDS:  NOMINAL ████`,
    `NAV: LOCKED  [AUTO]`,
    `ALT: 14,220 M`,
    `SPD: MACH 2.8`,
    `> SYSTEM ONLINE_`,
  ];
  lines.forEach((line, i) => {
    ctx.globalAlpha = 0.75 + Math.random()*0.2;
    ctx.fillText(line, 8, 18 + i * 14);
  });

  // Bottom progress bar
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = 'rgba(0,60,50,0.8)'; ctx.fillRect(8, H-16, W-16, 8);
  ctx.fillStyle = color;
  ctx.fillRect(8, H-16, (W-16) * (0.6 + Math.random()*0.3), 8);
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = color; ctx.lineWidth = 0.8;
  ctx.strokeRect(8, H-16, W-16, 8);

  const tex = new T.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  MATERIALS  — uses MeshStandardMaterial (Three r134 safe)
// ============================================================
function createMaterials(envTex) {
  const panel = makePanelTexture();
  const floor = makeFloorTexture();
  const ceil  = makeCeilingTexture();

  const chromBase = { metalness: 0.95, roughness: 0.05, envMap: envTex, envMapIntensity: 4.0 };
  return {
    chrome:      new T.MeshStandardMaterial({ ...chromBase, color: 0x8899bb }),
    chromeSilv:  new T.MeshStandardMaterial({ ...chromBase, color: 0xaabbd0, envMapIntensity: 4.5 }),
    chromeBlue:  new T.MeshStandardMaterial({ ...chromBase, color: 0x445577, envMapIntensity: 4.5 }),
    chromeDark:  new T.MeshStandardMaterial({ ...chromBase, color: 0x1a2233, roughness: 0.12 }),
    chromeGold:  new T.MeshStandardMaterial({ ...chromBase, color: 0xbb8844, envMapIntensity: 3.5 }),
    mirror:      new T.MeshStandardMaterial({ color: 0x6688aa, metalness: 1.0, roughness: 0.0, envMap: envTex, envMapIntensity: 6.0 }),
    glass:       new T.MeshStandardMaterial({ color: 0x88ccff, metalness: 0.0, roughness: 0.0, transparent: true, opacity: 0.35, envMap: envTex, envMapIntensity: 3.0 }),
    panel:       new T.MeshPhongMaterial({ map: panel, shininess: 80, specular: 0x445577 }),
    floor:       new T.MeshStandardMaterial({ map: floor, metalness: 0.8, roughness: 0.12, envMap: envTex, envMapIntensity: 2.5 }),
    ceiling:     new T.MeshPhongMaterial({ map: ceil, shininess: 40, specular: 0x334455 }),
    neonCyan:    new T.MeshBasicMaterial({ color: 0x00ffee }),
    neonBlue:    new T.MeshBasicMaterial({ color: 0x0077ff }),
    neonPink:    new T.MeshBasicMaterial({ color: 0xff33cc }),
    neonGold:    new T.MeshBasicMaterial({ color: 0xffcc44 }),
    neonWhite:   new T.MeshBasicMaterial({ color: 0xeeffff }),
    screen1:     new T.MeshBasicMaterial({ map: makeScreenTexture('NAV', '#00ffcc') }),
    screen2:     new T.MeshBasicMaterial({ map: makeScreenTexture('PWR', '#44aaff') }),
    screen3:     new T.MeshBasicMaterial({ map: makeScreenTexture('COM', '#ff44aa') }),
    screen4:     new T.MeshBasicMaterial({ map: makeScreenTexture('ENG', '#ffaa00') }),
  };
}

// ============================================================
//  HELPERS
// ============================================================
function addPipe(g, pts, r, mat, segs = 24) {
  if (pts.length < 2) return;
  const curve = new T.CatmullRomCurve3(pts);
  const mesh = new T.Mesh(new T.TubeGeometry(curve, segs, r, 7, false), mat);
  g.add(mesh);
  return mesh;
}

function box(g, x, y, z, w, h, d, mat) {
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); g.add(m);
  return m;
}

function cyl(g, x, y, z, rt, rb, h, segs, mat) {
  const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, segs), mat);
  m.position.set(x, y, z); g.add(m);
  return m;
}

function torus(g, x, y, z, R, r, mat, rotX = Math.PI/2) {
  const m = new T.Mesh(new T.TorusGeometry(R, r, 8, 40), mat);
  m.rotation.x = rotX; m.position.set(x, y, z); g.add(m);
  return m;
}

function sphere(g, x, y, z, r, mat) {
  const m = new T.Mesh(new T.SphereGeometry(r, 12, 8), mat);
  m.position.set(x, y, z); g.add(m);
  return m;
}

function neonStrip(g, pts, r, mat) {
  return addPipe(g, pts, r, mat, 10);
}

// ============================================================
//  WINDOW FRAME  — porthole-style oval chrome frame with glass plane
// ============================================================
function addPorthole(scene, x, y, z, w, h, viewTex, mats, rotY = 0) {
  const g = new T.Group();
  g.rotation.y = rotY;

  // Outer chrome ring / bezel
  const frameW = w + 0.6, frameH = h + 0.6;
  const outerBox = new T.Mesh(new T.BoxGeometry(frameW, frameH, 0.6), mats.chrome);
  outerBox.position.z = -0.3; g.add(outerBox);

  // Chamfered inner reveal — thin inset box
  const revealMat = new T.MeshStandardMaterial({ color: 0x1a2233, metalness: 0.95, roughness: 0.08,
    envMap: mats.chrome.envMap, envMapIntensity: 2.5 });
  const revealBox = new T.Mesh(new T.BoxGeometry(w+0.1, h+0.1, 0.3), revealMat);
  revealBox.position.z = 0.1; g.add(revealBox);

  // Chrome structural ribs — cross dividers
  const ribMat = new T.MeshStandardMaterial({ color: 0x8899bb, metalness: 0.95, roughness: 0.04,
    envMap: mats.chrome.envMap, envMapIntensity: 4.0 });
  // Horizontal rib
  const hrib = new T.Mesh(new T.BoxGeometry(w, 0.22, 0.25), ribMat);
  hrib.position.z = 0.25; g.add(hrib);
  // Vertical rib
  const vrib = new T.Mesh(new T.BoxGeometry(0.22, h, 0.25), ribMat);
  vrib.position.z = 0.25; g.add(vrib);

  // Corner bolt spheres
  [[-w/2, -h/2],[-w/2, h/2],[w/2, -h/2],[w/2, h/2]].forEach(([bx, by]) => {
    sphere(g, bx, by, 0.4, 0.28, mats.chromeSilv);
  });

  // Neon edge glow strip around bezel
  const neonPts = [
    new T.Vector3(-frameW/2, -frameH/2, 0.36),
    new T.Vector3( frameW/2, -frameH/2, 0.36),
    new T.Vector3( frameW/2,  frameH/2, 0.36),
    new T.Vector3(-frameW/2,  frameH/2, 0.36),
    new T.Vector3(-frameW/2, -frameH/2, 0.36),
  ];
  addPipe(g, neonPts, 0.07, mats.neonCyan, 8);

  // Glass pane with view texture
  const viewMat = new T.MeshBasicMaterial({ map: viewTex, side: T.FrontSide });
  const glass = new T.Mesh(new T.PlaneGeometry(w, h), viewMat);
  glass.position.z = 0.32;
  glass.name = 'window-glass';
  g.add(glass);

  // Glass glare overlay
  const glareMat = new T.MeshStandardMaterial({
    color: 0x88ccff, metalness: 0.0, roughness: 0.0,
    transparent: true, opacity: 0.15,
    envMap: mats.chrome.envMap, envMapIntensity: 1.5,
  });
  const glare = new T.Mesh(new T.PlaneGeometry(w, h), glareMat);
  glare.position.z = 0.35; g.add(glare);

  g.position.set(x, y, z);
  scene.add(g);
  return g;
}

// ============================================================
//  CONTROL CONSOLE  — instrument cluster
// ============================================================
function addConsole(scene, x, y, z, rotY, mats) {
  const g = new T.Group();
  g.rotation.y = rotY;

  // Main console body — angled top
  const body = new T.Mesh(new T.BoxGeometry(3.8, 1.0, 1.2), mats.chromeDark);
  body.position.y = 0; g.add(body);

  // Angled panel face
  const face = new T.Mesh(new T.BoxGeometry(3.8, 0.85, 0.08), mats.panel);
  face.rotation.x = -0.45; face.position.set(0, 0.35, 0.6); g.add(face);

  // Screen on console
  const scr = new T.Mesh(new T.PlaneGeometry(1.1, 0.72), mats.screen2);
  scr.rotation.x = -0.45; scr.position.set(-1.0, 0.42, 0.58); g.add(scr);
  const scr2 = new T.Mesh(new T.PlaneGeometry(1.1, 0.72), mats.screen4);
  scr2.rotation.x = -0.45; scr2.position.set(0.2, 0.42, 0.58); g.add(scr2);

  // Knobs
  for (let i = 0; i < 5; i++) {
    cyl(g, -1.6+i*0.72, 0.54, 0.68, 0.12, 0.14, 0.18, 8, mats.chromeSilv);
    // Knob indicator line
    const ind = new T.Mesh(new T.BoxGeometry(0.04, 0.1, 0.04), mats.neonCyan);
    ind.position.set(-1.6+i*0.72, 0.66, 0.68); g.add(ind);
  }

  // Toggle switches
  for (let i = 0; i < 6; i++) {
    const sw = new T.Mesh(new T.BoxGeometry(0.1, 0.22, 0.1), mats.chrome);
    sw.position.set(-1.5+i*0.55, 0.56, 0.72); sw.rotation.x = (Math.random()-0.5)*0.5; g.add(sw);
  }

  // Status LEDs
  const ledColors = [mats.neonCyan, mats.neonGold, mats.neonPink, mats.neonBlue, mats.neonCyan, mats.neonGold];
  for (let i = 0; i < 6; i++) {
    sphere(g, -1.4+i*0.5, 0.5, 0.74, 0.06, ledColors[i]);
    // Point light for each LED
    const pl = new T.PointLight(0x00ffcc, 0.12, 1.2);
    pl.position.set(-1.4+i*0.5, 0.5, 0.85); g.add(pl);
  }

  // Neon edge strip along top of console
  neonStrip(g, [
    new T.Vector3(-1.9, 0.55, 0.8),
    new T.Vector3( 1.9, 0.55, 0.8),
  ], 0.05, mats.neonCyan);
  neonStrip(g, [
    new T.Vector3(-1.9, 0.55, -0.55),
    new T.Vector3( 1.9, 0.55, -0.55),
  ], 0.05, mats.neonBlue);

  // Pipe bundle beneath console
  for (let i = 0; i < 3; i++) {
    addPipe(g, [
      new T.Vector3(-1.8+i*1.6, -0.5, -0.5),
      new T.Vector3(-1.8+i*1.6, -0.5,  0.8),
    ], 0.06, mats.chromeDark, 6);
  }

  // ── Support legs — 4 corner chrome cylinders grounding console to floor ──
  // The group is placed at y=0.5, so legs reach from local y=-0.5 down to y=-y (world 0)
  [[-1.6, -0.5], [1.6, -0.5], [-1.6, 0.5], [1.6, 0.5]].forEach(([lx, lz]) => {
    cyl(g, lx, -0.75, lz, 0.08, 0.10, 0.50, 8, mats.chrome);
    // Foot disc
    cyl(g, lx, -1.01, lz, 0.18, 0.18, 0.04, 8, mats.chromeSilv);
  });
  // Under-console neon glow strip
  neonStrip(g, [
    new T.Vector3(-1.85, -0.52, -0.56),
    new T.Vector3( 1.85, -0.52, -0.56),
  ], 0.03, mats.neonBlue);
  neonStrip(g, [
    new T.Vector3(-1.85, -0.52, 0.55),
    new T.Vector3( 1.85, -0.52, 0.55),
  ], 0.03, mats.neonCyan);

  g.position.set(x, y, z);
  scene.add(g);
  return g;
}

// ============================================================
//  WALL PANEL SECTION  — instrument cluster + pipes
// ============================================================
function addWallPanel(scene, x, y, z, rotY, w, h, mats) {
  const g = new T.Group();
  g.rotation.y = rotY;

  // Panel face
  const pn = new T.Mesh(new T.BoxGeometry(w, h, 0.16), mats.panel);
  g.add(pn);

  // Horizontal trim strips
  [-h*0.38, 0, h*0.38].forEach(oy => {
    const strip = new T.Mesh(new T.BoxGeometry(w, 0.12, 0.12), mats.chrome);
    strip.position.set(0, oy, 0.1); g.add(strip);
    const neon = new T.Mesh(new T.BoxGeometry(w*0.85, 0.05, 0.05), mats.neonCyan);
    neon.position.set(0, oy-0.04, 0.14); g.add(neon);
  });

  // Vertical trim ribs
  for (let i = -2; i <= 2; i++) {
    const rib = new T.Mesh(new T.BoxGeometry(0.1, h, 0.1), mats.chromeBlue);
    rib.position.set(i*(w/4.5), 0, 0.1); g.add(rib);
  }

  // Mounted screen
  const scr = new T.Mesh(new T.PlaneGeometry(w*0.35, h*0.35), mats.screen1);
  scr.position.set(-w*0.2, h*0.12, 0.1); g.add(scr);

  // Instrument gauges — circular dials
  for (let i = 0; i < 3; i++) {
    torus(g, w*0.18+i*w*0.1, -h*0.18, 0.1, 0.22, 0.05, mats.chrome);
    const needle = new T.Mesh(new T.BoxGeometry(0.02, 0.18, 0.03), mats.neonCyan);
    needle.position.set(w*0.18+i*w*0.1, -h*0.18, 0.12);
    needle.rotation.z = -0.5 + Math.random()*1.2; g.add(needle);
    // Gauge face
    sphere(g, w*0.18+i*w*0.1, -h*0.18, 0.08, 0.18, mats.chromeDark);
  }

  g.position.set(x, y, z);
  scene.add(g);
  return g;
}

// ============================================================
//  STRUCTURAL COLUMN  — floor-to-ceiling with pipes and rings
// ============================================================
function addColumn(scene, x, z, h, mats) {
  const g = new T.Group();

  // Main column body
  cyl(g, 0, h/2, 0, 0.28, 0.32, h, 12, mats.chrome);

  // Base and cap flares
  cyl(g, 0, 0.2, 0, 0.55, 0.35, 0.4, 12, mats.chromeSilv);
  cyl(g, 0, h-0.2, 0, 0.35, 0.55, 0.4, 12, mats.chromeSilv);

  // Decorative rings
  [h*0.25, h*0.5, h*0.75].forEach(hy => {
    torus(g, 0, hy, 0, 0.38, 0.07, mats.chromeBlue);
    const neonRing = new T.Mesh(new T.TorusGeometry(0.32, 0.035, 6, 30), mats.neonCyan);
    neonRing.rotation.x = Math.PI/2; neonRing.position.set(0, hy, 0); g.add(neonRing);
  });

  // Pipe running alongside
  addPipe(g, [
    new T.Vector3(0.4, 0, 0),
    new T.Vector3(0.42, h*0.5, 0.05),
    new T.Vector3(0.38, h, 0),
  ], 0.06, mats.chromeDark, 12);

  g.position.set(x, 0, z);
  scene.add(g);
  return g;
}

// ============================================================
//  CEILING LIGHT BOX
// ============================================================
function addCeilingLight(scene, x, y, z, mats) {
  const g = new T.Group();
  // Housing
  box(g, 0, 0, 0, 1.4, 0.12, 0.5, mats.chromeDark);
  // Emissive panel
  const glow = new T.Mesh(new T.PlaneGeometry(1.2, 0.4),
    new T.MeshBasicMaterial({ color: 0xddf0ff, transparent: true, opacity: 0.92 }));
  glow.rotation.x = Math.PI/2; glow.position.y = -0.07; g.add(glow);
  // Neon edges
  neonStrip(g, [new T.Vector3(-0.72, -0.07, -0.26), new T.Vector3(0.72, -0.07, -0.26)], 0.04, mats.neonCyan);
  neonStrip(g, [new T.Vector3(-0.72, -0.07,  0.26), new T.Vector3(0.72, -0.07,  0.26)], 0.04, mats.neonCyan);
  // Area light
  const pl = new T.PointLight(0xaaddff, 1.2, 10);
  pl.position.set(0, -0.3, 0); g.add(pl);
  g.position.set(x, y, z);
  scene.add(g);
  return g;
}

// ============================================================
//  SEAT / COCKPIT CHAIR  — futuristic single-pedestal pod chair
// ============================================================
function addSeat(scene, x, y, z, rotY, mats) {
  const g = new T.Group();
  g.rotation.y = rotY;

  // ── Pedestal base — wide chrome disc on floor ──
  cyl(g, 0, 0.045, 0, 0.42, 0.38, 0.09, 16, mats.chromeSilv);
  // Pedestal stem — tapered cylinder
  cyl(g, 0, 0.34, 0, 0.12, 0.22, 0.55, 12, mats.chrome);
  // Stem collar rings
  [0.12, 0.28, 0.44].forEach(hy => {
    torus(g, 0, hy, 0, 0.16, 0.04, mats.chromeBlue);
  });

  // ── Seat pan — wide saucer shape, slightly cupped ──
  // Main pan disc
  cyl(g, 0, 0.62, 0, 0.52, 0.46, 0.10, 20, mats.chromeDark);
  // Cushion — dark padded inset
  const cushionMat = new T.MeshPhongMaterial({ color: 0x0d1a2a, shininess: 60, specular: 0x223355 });
  cyl(g, 0, 0.685, 0, 0.44, 0.44, 0.055, 20, cushionMat);
  // Seat lip rim (chrome edge ring)
  torus(g, 0, 0.63, 0, 0.50, 0.055, mats.chrome);
  // Neon underlighting strip on seat pan
  torus(g, 0, 0.60, 0, 0.48, 0.025, mats.neonCyan);

  // ── Back support — swept curved shell ──
  // Main backrest shell (angled box standing proud of seat)
  const backShell = new T.Mesh(new T.BoxGeometry(0.80, 0.90, 0.09), mats.chromeDark);
  backShell.position.set(0, 1.12, -0.38);
  backShell.rotation.x = 0.18;
  g.add(backShell);
  // Backrest cushion inset
  const backCush = new T.Mesh(new T.BoxGeometry(0.70, 0.80, 0.05), cushionMat);
  backCush.position.set(0, 1.12, -0.34);
  backCush.rotation.x = 0.18;
  g.add(backCush);
  // Lateral lumbar wings (two swept side flares)
  [-0.42, 0.42].forEach(ox => {
    const wing = new T.Mesh(new T.BoxGeometry(0.12, 0.55, 0.14), mats.chrome);
    wing.position.set(ox, 1.02, -0.32);
    wing.rotation.x = 0.18;
    wing.rotation.z = ox < 0 ? 0.18 : -0.18;
    g.add(wing);
    // Wing neon edge
    neonStrip(g, [
      new T.Vector3(ox, 0.76, -0.20),
      new T.Vector3(ox * 1.05, 1.02, -0.34),
      new T.Vector3(ox, 1.28, -0.38),
    ], 0.025, mats.neonBlue);
  });

  // ── Headrest — oval chrome pod ──
  cyl(g, 0, 1.61, -0.40, 0.20, 0.22, 0.28, 16, mats.chromeDark);
  cyl(g, 0, 1.61, -0.36, 0.17, 0.17, 0.18, 16, cushionMat);
  // Headrest halo ring
  torus(g, 0, 1.62, -0.40, 0.25, 0.025, mats.neonCyan);

  // ── Armrests — cantilevered swept arms ──
  [-0.46, 0.46].forEach(ox => {
    // Arm support strut from side of seat pan
    addPipe(g, [
      new T.Vector3(ox * 0.92, 0.68, 0.0),
      new T.Vector3(ox, 0.88, 0.10),
      new T.Vector3(ox, 0.88, 0.38),
    ], 0.055, mats.chrome, 8);
    // Arm pad (flat capsule)
    const pad = new T.Mesh(new T.BoxGeometry(0.13, 0.05, 0.42), mats.chromeSilv);
    pad.position.set(ox, 0.92, 0.28);
    g.add(pad);
    // Pad neon edge
    neonStrip(g, [
      new T.Vector3(ox, 0.92, 0.08),
      new T.Vector3(ox, 0.92, 0.50),
    ], 0.018, mats.neonCyan);
    // Control button cluster on armrest
    [0.10, 0.22, 0.34].forEach((bz, bi) => {
      sphere(g, ox, 0.96, bz,  0.038,
        bi === 0 ? mats.neonCyan : bi === 1 ? mats.neonGold : mats.neonPink);
    });
  });

  // ── Back support strut connecting seat to backrest ──
  addPipe(g, [
    new T.Vector3(0, 0.66, -0.35),
    new T.Vector3(0, 0.90, -0.46),
    new T.Vector3(0, 1.20, -0.50),
  ], 0.06, mats.chrome, 8);

  // ── Neon accent stripe on backrest spine ──
  neonStrip(g, [
    new T.Vector3(0, 0.72, -0.34),
    new T.Vector3(0, 1.12, -0.44),
    new T.Vector3(0, 1.52, -0.42),
  ], 0.022, mats.neonCyan);

  g.position.set(x, y, z);
  scene.add(g);
  return g;
}

// ============================================================
//  HOLOGRAPHIC DISPLAY RING  — floating torus + projected screen
// ============================================================
function addHoloDisplay(scene, x, y, z, mats) {
  const g = new T.Group();

  // Outer support ring
  torus(g, 0, 0, 0, 0.9, 0.06, mats.chrome);
  // Inner glowing ring
  torus(g, 0, 0, 0, 0.78, 0.04, mats.neonCyan);
  // Inner glowing ring 2
  torus(g, 0, 0, 0, 0.62, 0.03, mats.neonBlue);

  // Projected plane — the holo screen
  const holMat = new T.MeshBasicMaterial({
    map: makeScreenTexture('HUD', '#44ffcc'),
    transparent: true, opacity: 0.82, side: T.DoubleSide
  });
  const hol = new T.Mesh(new T.PlaneGeometry(1.3, 0.85), holMat);
  hol.rotation.x = Math.PI/2; g.add(hol);

  // 3 support struts from ring to center
  for (let i = 0; i < 3; i++) {
    const a = (i/3)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(0, 0, 0),
      new T.Vector3(Math.cos(a)*0.82, 0, Math.sin(a)*0.82),
    ], 0.025, mats.chromeDark, 4);
  }

  // Glow point light
  const pl = new T.PointLight(0x00ffcc, 0.6, 5);
  pl.position.set(0, 0.3, 0); g.add(pl);

  g.position.set(x, y, z);
  g.userData = { baseY: y, rotSpeed: 0.005 };
  scene.add(g);
  return g;
}

// ============================================================
//  OVERHEAD PIPE/CONDUIT RUN
// ============================================================
function addCeilingConduit(scene, x1, y, z1, x2, z2, mats) {
  const g = new T.Group();
  const pts = [
    new T.Vector3(x1, y, z1),
    new T.Vector3((x1+x2)/2, y, (z1+z2)/2),
    new T.Vector3(x2, y, z2),
  ];

  // Main conduit pipe
  addPipe(g, pts, 0.12, mats.chromeDark, 16);
  // Side cables
  [0.15, -0.15].forEach(off => {
    addPipe(g, pts.map(p => new T.Vector3(p.x+off, p.y-0.05, p.z)), 0.04, mats.neonCyan, 10);
  });
  // Clamp rings at intervals
  [0.25, 0.5, 0.75].forEach(t => {
    const p = new T.CatmullRomCurve3(pts).getPoint(t);
    torus(g, p.x, p.y, p.z, 0.18, 0.04, mats.chrome);
  });

  scene.add(g);
  return g;
}

// ============================================================
//  MAIN  startSpaceship
// ============================================================
export async function startSpaceship(canvas) {
  if (instances.has(canvas)) return;

  // Renderer — set explicit pixel size first
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch(e) {
    console.error('[Spaceship] Renderer init failed', e);
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const initW = canvas.clientWidth  || 820;
  const initH = canvas.clientHeight || 580;
  renderer.setPixelRatio(dpr);
  renderer.setSize(initW, initH, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new T.Scene();
  scene.background = new T.Color(0x0a0e18);
  scene.fog = new T.Fog(0x0a0e18, 18, 42);

  // Build view textures — wrapped in try/catch so a bad texture never kills the whole scene
  let skyViewTex, spaceViewTex;
  try {
    skyViewTex = makeSkyViewTexture();
    skyViewTex.wrapS = T.RepeatWrapping;
    skyViewTex.wrapT = T.ClampToEdgeWrapping;
    skyViewTex.needsUpdate = true;
  } catch(e) {
    console.error('[Spaceship] makeSkyViewTexture failed:', e);
    skyViewTex = new T.Texture();
  }
  try {
    spaceViewTex = makeSpaceViewTexture();
    spaceViewTex.wrapS = T.RepeatWrapping;
    spaceViewTex.wrapT = T.ClampToEdgeWrapping;
    spaceViewTex.needsUpdate = true;
  } catch(e) {
    console.error('[Spaceship] makeSpaceViewTexture failed:', e);
    spaceViewTex = new T.Texture();
  }

  // Simple grey env — safe for all Three r134 builds
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 64; envCanvas.height = 64;
  const envCtx = envCanvas.getContext('2d');
  const envGrad = envCtx.createLinearGradient(0, 0, 0, 64);
  envGrad.addColorStop(0,   '#aabbcc');
  envGrad.addColorStop(0.5, '#778899');
  envGrad.addColorStop(1,   '#334455');
  envCtx.fillStyle = envGrad;
  envCtx.fillRect(0, 0, 64, 64);
  const envTex = new T.CanvasTexture(envCanvas);
  envTex.mapping = T.EquirectangularReflectionMapping;
  envTex.needsUpdate = true;

  const mats = createMaterials(envTex);

  const camera = new T.PerspectiveCamera(65, initW / initH, 0.1, 80);
  camera.position.set(0, 1.7, 4.5);
  camera.lookAt(0, 1.5, -2);

  // ── LIGHTS ──
  const ambient = new T.AmbientLight(0x445566, 0.6);
  scene.add(ambient);

  // Main overhead area light (simulated)
  const overhead = new T.DirectionalLight(0xaabbdd, 1.2);
  overhead.position.set(0, 8, 2);
  overhead.castShadow = true;
  overhead.shadow.mapSize.set(1024, 1024);
  overhead.shadow.camera.near = 0.5;
  overhead.shadow.camera.far = 30;
  overhead.shadow.camera.left = -10;
  overhead.shadow.camera.right = 10;
  overhead.shadow.camera.top = 10;
  overhead.shadow.camera.bottom = -10;
  scene.add(overhead);

  // Blue fill from window side
  const windowFill = new T.DirectionalLight(0x3399ff, 0.5);
  windowFill.position.set(-8, 2, -1);
  scene.add(windowFill);
  // Warm fill from opposite
  const warmFill = new T.DirectionalLight(0xffeedd, 0.3);
  warmFill.position.set(8, 1, -1);
  scene.add(warmFill);

  // ── ROOM DIMENSIONS ──
  const RW = 9, RH = 3.6, RD = 14;  // width, height, depth
  // Room spans:  z = +2 (front/camera end)  to  z = -12 (back wall)
  // Room center: z = (2 + -12) / 2 = -5
  const ZFRONT = 2, ZBACK = -12, ZCTR = -5;

  // ── FLOOR ──
  const floorMesh = new T.Mesh(new T.PlaneGeometry(RW, RD), mats.floor);
  floorMesh.rotation.x = -Math.PI/2;
  floorMesh.position.set(0, 0, ZCTR);
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // ── CEILING ──
  const ceilMesh = new T.Mesh(new T.PlaneGeometry(RW, RD), mats.ceiling);
  ceilMesh.rotation.x = Math.PI/2;
  ceilMesh.position.set(0, RH, ZCTR);
  scene.add(ceilMesh);

  // ── BACK WALL ──
  const backWall = new T.Mesh(new T.PlaneGeometry(RW, RH), mats.panel);
  backWall.position.set(0, RH/2, ZBACK);
  scene.add(backWall);

  // ── LEFT WALL ──
  const leftWall = new T.Mesh(new T.PlaneGeometry(RD, RH), mats.panel);
  leftWall.rotation.y = Math.PI/2;
  leftWall.position.set(-RW/2, RH/2, ZCTR);
  scene.add(leftWall);

  // ── RIGHT WALL ──
  const rightWall = new T.Mesh(new T.PlaneGeometry(RD, RH), mats.panel);
  rightWall.rotation.y = -Math.PI/2;
  rightWall.position.set(RW/2, RH/2, ZCTR);
  scene.add(rightWall);

  // ── FRONT WALL — faces inward (camera side), closes the room ──
  const frontWall = new T.Mesh(new T.PlaneGeometry(RW, RH), mats.panel);
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, RH/2, ZFRONT);
  scene.add(frontWall);

  // ── CHROME BASE SKIRT (floor-wall junction) ──
  [
    // left wall — plane centered at room z-center, full depth
    { x: -RW/2, z: ZCTR,  ry: Math.PI/2,  w: RD },
    // right wall
    { x:  RW/2, z: ZCTR,  ry: -Math.PI/2, w: RD },
    // back wall
    { x: 0,     z: ZBACK, ry: 0,           w: RW },
  ].forEach(({ x, z, ry, w }) => {
    const skirt = new T.Mesh(new T.PlaneGeometry(w, 0.28), mats.chrome);
    skirt.rotation.y = ry;
    skirt.position.set(x, 0.14, z);
    scene.add(skirt);
    const neon = new T.Mesh(new T.PlaneGeometry(w*0.95, 0.04), mats.neonCyan);
    neon.rotation.y = ry;
    neon.position.set(x, 0.27, z);
    scene.add(neon);
  });

  // ── CEILING CROWN MOULDING — neon strip along top edges ──
  [
    { x: -RW/2, z: ZCTR,  ry: Math.PI/2,  w: RD },
    { x:  RW/2, z: ZCTR,  ry: -Math.PI/2, w: RD },
    { x: 0,     z: ZBACK, ry: 0,           w: RW },
  ].forEach(({ x, z, ry, w }) => {
    const crown = new T.Mesh(new T.PlaneGeometry(w, 0.22), mats.chrome);
    crown.rotation.y = ry;
    crown.position.set(x, RH - 0.11, z);
    scene.add(crown);
    const neon = new T.Mesh(new T.PlaneGeometry(w*0.92, 0.04), mats.neonBlue);
    neon.rotation.y = ry;
    neon.position.set(x, RH - 0.04, z);
    scene.add(neon);
  });

  // ── STRUCTURAL COLUMNS ──
  addColumn(scene, -RW/2 + 0.4, -5.5, RH, mats);
  addColumn(scene, -RW/2 + 0.4, -0.5, RH, mats);
  addColumn(scene,  RW/2 - 0.4, -5.5, RH, mats);
  addColumn(scene,  RW/2 - 0.4, -0.5, RH, mats);

  // ── CEILING LIGHTS ──
  [-3.5, -1.0, 1.5, 4.0].forEach(cz => {
    addCeilingLight(scene, -1.8, RH - 0.07, cz, mats);
    addCeilingLight(scene,  1.8, RH - 0.07, cz, mats);
  });

  // ── OVERHEAD CONDUITS ──
  addCeilingConduit(scene, -RW/2+0.5, RH-0.2, -6,  RW/2-0.5, -6,  mats);
  addCeilingConduit(scene, -RW/2+0.5, RH-0.2, -1,  RW/2-0.5, -1,  mats);
  addCeilingConduit(scene, -RW/2+0.5, RH-0.2,  3,  RW/2-0.5,  3,  mats);

  // ── PORTHOLE WINDOWS — left wall ──
  const windowTex = { current: skyViewTex };  // mutable ref for mode toggle
  const portholes = [];

  const winPositions = [
    { x: -RW/2 + 0.06, y: 1.9, z: -5.5 },
    { x: -RW/2 + 0.06, y: 1.9, z: -2.0 },
    { x: -RW/2 + 0.06, y: 1.9, z:  1.5 },
  ];
  winPositions.forEach(({ x, y, z }) => {
    const ph = addPorthole(scene, x, y, z, 2.2, 1.4, windowTex.current, mats, Math.PI/2);
    portholes.push(ph);
  });

  // ── PORTHOLE WINDOWS — right wall ──
  const winPositionsR = [
    { x: RW/2 - 0.06, y: 1.9, z: -5.5 },
    { x: RW/2 - 0.06, y: 1.9, z: -2.0 },
    { x: RW/2 - 0.06, y: 1.9, z:  1.5 },
  ];
  winPositionsR.forEach(({ x, y, z }) => {
    const ph = addPorthole(scene, x, y, z, 2.2, 1.4, windowTex.current, mats, -Math.PI/2);
    portholes.push(ph);
  });

  // ── FORWARD PANORAMIC WINDOW (back wall) ──
  const fwdPorthole = addPorthole(scene, 0, RH/2 + 0.05, ZBACK + 0.22, 5.5, 2.2, windowTex.current, mats, 0);
  portholes.push(fwdPorthole);

  // ── CONTROL CONSOLES ──
  addConsole(scene, -2.0, 0.5, -1.5, 0, mats);
  addConsole(scene,  2.0, 0.5, -1.5, Math.PI, mats);
  addConsole(scene,  0,   0.5, -1.5, 0, mats);

  // ── WALL INSTRUMENT PANELS ──
  addWallPanel(scene, -RW/2 + 0.12, RH/2, -8.2, Math.PI/2,  2.5, 2.0, mats);
  addWallPanel(scene,  RW/2 - 0.12, RH/2, -8.2, -Math.PI/2, 2.5, 2.0, mats);
  addWallPanel(scene, -RW/2 + 0.12, RH/2, -4.8, Math.PI/2,  2.0, 1.8, mats);
  addWallPanel(scene,  RW/2 - 0.12, RH/2, -4.8, -Math.PI/2, 2.0, 1.8, mats);

  // Back wall large display
  const backScreen = new T.Mesh(new T.PlaneGeometry(4.0, 2.0), mats.screen3);
  backScreen.position.set(0, RH/2 + 0.1, ZBACK + 0.1);
  scene.add(backScreen);
  // Chrome bezel for back screen
  const bezel = new T.Mesh(new T.BoxGeometry(4.3, 2.3, 0.12), mats.chrome);
  bezel.position.set(0, RH/2 + 0.1, ZBACK + 0.05);
  scene.add(bezel);

  // ── HOLOGRAPHIC DISPLAYS ──
  const holos = [];
  holos.push(addHoloDisplay(scene, -2.2, 1.4, -1.5, mats));
  holos.push(addHoloDisplay(scene,  2.2, 1.4, -1.5, mats));
  holos.push(addHoloDisplay(scene,  0,   1.6, -4.0, mats));

  // ── SEATS — pulled back from camera, in front of consoles ──
  addSeat(scene, -1.5, 0, 0.2, 0, mats);
  addSeat(scene,  1.5, 0, 0.2, 0, mats);
  addSeat(scene, -1.5, 0,-2.2, 0, mats);
  addSeat(scene,  1.5, 0,-2.2, 0, mats);

  // ── BACK WALL DETAIL — vertical pipe cluster on left/right wall edges ──
  for (let i = 0; i < 5; i++) {
    addPipe(scene, [
      new T.Vector3(-RW/2 + 0.25 + i*0.35, 0.3,      ZBACK + 0.2),
      new T.Vector3(-RW/2 + 0.20 + i*0.35, RH*0.5,   ZBACK + 0.4),
      new T.Vector3(-RW/2 + 0.25 + i*0.35, RH - 0.3, ZBACK + 0.2),
    ], 0.04, i%2===0 ? mats.chromeDark : mats.neonCyan, 10);
  }
  for (let i = 0; i < 5; i++) {
    addPipe(scene, [
      new T.Vector3(RW/2 - 0.25 - i*0.35, 0.3,      ZBACK + 0.2),
      new T.Vector3(RW/2 - 0.20 - i*0.35, RH*0.5,   ZBACK + 0.4),
      new T.Vector3(RW/2 - 0.25 - i*0.35, RH - 0.3, ZBACK + 0.2),
    ], 0.04, i%2===0 ? mats.chromeDark : mats.neonBlue, 10);
  }

  // ── FLOOR DETAIL — center runner strip ──
  const runnerMat = new T.MeshStandardMaterial({ color: 0x0a1825, metalness: 0.9, roughness: 0.06,
    envMap: envTex, envMapIntensity: 2.5 });
  const runner = new T.Mesh(new T.PlaneGeometry(0.6, RD), runnerMat);
  runner.rotation.x = -Math.PI/2; runner.position.set(0, 0.005, ZCTR);
  scene.add(runner);
  // Runner neon strips
  [-0.28, 0.28].forEach(ox => {
    const strip = new T.Mesh(new T.PlaneGeometry(0.04, RD), mats.neonCyan);
    strip.rotation.x = -Math.PI/2; strip.position.set(ox, 0.008, ZCTR);
    scene.add(strip);
  });

  // ── RESIZE ──
  let ro = null;
  function onResize() {
    const w = canvas.clientWidth  || 820;
    const h = canvas.clientHeight || 580;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(onResize); ro.observe(canvas.parentElement || canvas);
  } else window.addEventListener('resize', onResize);
  onResize();

  // ── STATE ──
  const state = {
    renderer, scene, camera,
    rafId: null, paused: false, ro,
    time: 0, spaceMode: false,
    portholes, windowTex,
    skyViewTex, spaceViewTex, holos,
    camAngle: 0,
  };
  instances.set(canvas, state);

  // ── ANIMATE ──
  function animate() {
    state.rafId = requestAnimationFrame(animate);
    if (state.paused) return;
    state.time += 0.012;
    const t = state.time;

    // Gentle camera drift — slow pan left/right, slight bob
    // Constrained so the camera stays inside/above the room geometry
    // and never dips below the floor plane or into the empty void.
    state.camAngle += 0.0004;
    const cx = Math.sin(state.camAngle) * 1.1;          // tighter side swing (was 1.8)
    const cy = 1.82 + Math.sin(t * 0.18) * 0.06;       // higher + less bob (was 1.7+0.12)
    const lx = Math.sin(state.camAngle * 0.5) * 0.7;   // follow lookahead (was 1.2)
    camera.position.set(cx, cy, 3.2);                   // pull camera closer in (was 4.2)
    camera.lookAt(lx, 1.72, -3.2);                     // look at mid-room height (was 1.45)

    // Holographic display rotation
    state.holos.forEach((h, i) => {
      h.rotation.y += 0.004 + i * 0.001;
      h.position.y = h.userData.baseY + Math.sin(t * 0.8 + i * 1.4) * 0.06;
    });

    // ── Dynamic background scroll ──
    // Sky mode: clouds drift gently left. Space mode: stars drift diagonally.
    const activeTex = state.spaceMode ? state.spaceViewTex : state.skyViewTex;
    if (activeTex && activeTex.offset) {
      if (state.spaceMode) {
        activeTex.offset.x = (t * 0.004) % 1;   // slow rightward star drift
        activeTex.offset.y = (t * 0.0015) % 1;  // slight upward drift
      } else {
        activeTex.offset.x = (t * 0.008) % 1;   // clouds drift left
        activeTex.offset.y = 0;
      }
      // NOTE: do NOT set needsUpdate here — offset is a shader uniform,
      // needsUpdate=true would re-upload canvas pixel data every frame (expensive + unnecessary)
    }

    renderer.render(scene, camera);
  }
  animate();
  console.log('[ViewSpaceship] started');
}

// ============================================================
//  SPACE MODE TOGGLE — swaps window textures
// ============================================================
export function setSpaceMode(canvas, enabled) {
  const s = instances.get(canvas);
  if (!s) return;
  s.spaceMode = enabled;
  const tex = enabled ? s.spaceViewTex : s.skyViewTex;

  s.portholes.forEach(ph => {
    ph.traverse(child => {
      if (child.name === 'window-glass' && child.material && child.material.map !== undefined) {
        child.material.map = tex;
        child.material.needsUpdate = true;
      }
    });
  });

  // Scene fog — denser and darker in space
  s.scene.fog.color.set(enabled ? 0x010508 : 0x0a0e18);
  s.scene.fog.near = enabled ? 14 : 18;
  s.scene.fog.far  = enabled ? 36 : 42;
}

export function stopSpaceship(canvas) {
  const s = instances.get(canvas);
  if (!s) return;
  cancelAnimationFrame(s.rafId);
  if (s.ro) s.ro.disconnect();
  if (s.renderer) s.renderer.dispose();
  instances.delete(canvas);
}

export function spaceshipPause(canvas) {
  const s = instances.get(canvas);
  if (!s) return false;
  s.paused = !s.paused;
  return s.paused;
}

export function spaceshipReset(canvas) {
  const s = instances.get(canvas);
  if (!s) return;
  s.time = 0;
  s.camAngle = 0;
}
