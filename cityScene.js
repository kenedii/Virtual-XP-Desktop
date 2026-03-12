import * as T from 'three';

const instances = new Map();

// ============================================================
//  SKY TEXTURE  —  bright Windows-XP "Bliss" style blue sky
// ============================================================
function makeSkyTexture() {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Crisp bright blue sky — XP Bliss palette
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,    '#1e7be8');   // vivid zenith blue
  sky.addColorStop(0.30, '#3a9ff0');
  sky.addColorStop(0.55, '#68bfff');
  sky.addColorStop(0.72, '#a0d8ff');
  sky.addColorStop(0.88, '#ceeeff');
  sky.addColorStop(1,    '#e8f8ff');   // bright horizon haze
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Subtle horizon warmth
  const haze = ctx.createLinearGradient(0, H * 0.72, 0, H);
  haze.addColorStop(0, 'rgba(255,255,255,0)');
  haze.addColorStop(1, 'rgba(240,250,255,0.55)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, W, H);

  // Sun disc + glow (upper-right, XP-style)
  const sx = W * 0.78, sy = H * 0.14;
  // outer glow
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 260);
  sg.addColorStop(0,   'rgba(255,255,230,0.75)');
  sg.addColorStop(0.18,'rgba(255,240,180,0.45)');
  sg.addColorStop(0.45,'rgba(255,230,160,0.18)');
  sg.addColorStop(1,   'rgba(255,220,150,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, H);
  // sun disc
  ctx.beginPath();
  ctx.arc(sx, sy, 38, 0, Math.PI * 2);
  const sd = ctx.createRadialGradient(sx - 8, sy - 8, 0, sx, sy, 38);
  sd.addColorStop(0, 'rgba(255,255,240,1)');
  sd.addColorStop(1, 'rgba(255,240,180,0.9)');
  ctx.fillStyle = sd;
  ctx.fill();

  // ---- FLUFFY XP-STYLE CLOUDS  (big, white, rounded, soft shadows) ----
  function drawCloud(cx, cy, sc, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const puffs = [
      [0,0,1.00],[-0.60,0.12,0.78],[0.60,0.08,0.82],
      [-0.28,-0.28,0.62],[0.32,-0.24,0.68],[0,-0.32,0.58],
      [-0.88,0.22,0.52],[0.88,0.18,0.56],[0,0.30,0.50],
      [-0.44,0.40,0.44],[0.44,0.36,0.48],[-1.10,0.05,0.38],[1.10,0.02,0.40],
    ];

    // bright white puffs only — no grey shadow pass
    puffs.forEach(([px,py,pr]) => {
      const r = pr * sc;
      const g = ctx.createRadialGradient(cx+px*sc-r*0.22, cy+py*sc-r*0.22, 0, cx+px*sc, cy+py*sc, r);
      g.addColorStop(0,   'rgba(255,255,255,1)');
      g.addColorStop(0.45,'rgba(255,255,255,0.97)');
      g.addColorStop(0.80,'rgba(250,252,255,0.72)');
      g.addColorStop(1,   'rgba(245,250,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx+px*sc, cy+py*sc, r, r*0.72, 0, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Hero clouds — sparse, big, XP-style
  drawCloud( 310, 185, 115, 0.98);
  drawCloud(1080, 155, 140, 0.96);
  drawCloud( 690, 240,  92, 0.93);
  drawCloud(1680, 210, 120, 0.94);
  drawCloud(1460, 340,  76, 0.88);
  drawCloud( 210, 330,  88, 0.86);
  drawCloud( 870, 310,  68, 0.84);
  drawCloud(1820, 380,  55, 0.80);
  drawCloud( 520, 420,  48, 0.76);

  // A few small distant puffs
  for (let i = 0; i < 8; i++) {
    drawCloud(150 + Math.random()*(W-300), 100 + Math.random()*240, 18+Math.random()*32, 0.55+Math.random()*0.28);
  }

  // Thin high cirrus wisps
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.10 + Math.random()*0.10;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14 + Math.random()*10;
    ctx.beginPath();
    const y = 30 + i*22;
    ctx.moveTo(Math.random()*500, y + Math.random()*12);
    ctx.bezierCurveTo(W*0.3+Math.random()*200, y-18, W*0.6+Math.random()*200, y+8, W-Math.random()*400, y+Math.random()*14);
    ctx.stroke();
  }
  ctx.restore();

  const tex = new T.CanvasTexture(c);
  tex.mapping = T.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  CHROME SURFACE TEXTURE  — subtle brushed pattern
// ============================================================
function makeChromeNormalTex() {
  const S = 128;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8080ff'; ctx.fillRect(0,0,S,S);
  for (let y = 0; y < S; y += 2) {
    const v = 0.5 + (Math.random()-0.5)*0.06;
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
//  WINDOW TEXTURES
// ============================================================
function makeWindowTexture(rows, cols, bg, lit1, lit2) {
  const pw = 14, ph = 20;
  const W = cols*pw, H = rows*ph;
  const c = document.createElement('canvas'); c.width=W; c.height=H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  for (let r=0; r<rows; r++) {
    for (let cc=0; cc<cols; cc++) {
      const rnd = Math.random();
      if (rnd > 0.18) {
        ctx.fillStyle = rnd > 0.55 ? lit1 : lit2;
        ctx.fillRect(cc*pw+2, r*ph+3, pw-4, ph-5);
        // inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(cc*pw+2, r*ph+3, pw-4, 3);
      } else {
        ctx.fillStyle = 'rgba(8,15,30,0.92)';
        ctx.fillRect(cc*pw+2, r*ph+3, pw-4, ph-5);
      }
    }
  }
  const tex = new T.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ============================================================
//  GROUND / ROAD TEXTURES
// ============================================================
function makeGroundTexture() {
  const S=512; const c=document.createElement('canvas'); c.width=S; c.height=S;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#2a5c1a'; ctx.fillRect(0,0,S,S);
  for (let i=0;i<9000;i++) {
    const x=Math.random()*S, y=Math.random()*S;
    const g=Math.floor(52+Math.random()*65);
    ctx.fillStyle=`rgb(${16+Math.floor(Math.random()*28)},${g},${8+Math.floor(Math.random()*18)})`;
    ctx.fillRect(x,y,2,2);
  }
  const tex=new T.CanvasTexture(c);
  tex.wrapS=tex.wrapT=T.RepeatWrapping; tex.repeat.set(38,38); tex.needsUpdate=true;
  return tex;
}

function makeRoadTexture() {
  const W=256,H=512; const c=document.createElement('canvas'); c.width=W; c.height=H;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#252930'; ctx.fillRect(0,0,W,H);
  for (let i=0;i<3500;i++) {
    const x=Math.random()*W, y=Math.random()*H, v=Math.floor(32+Math.random()*22);
    ctx.fillStyle=`rgb(${v},${v},${v+4})`; ctx.fillRect(x,y,2,2);
  }
  ctx.setLineDash([28,22]); ctx.strokeStyle='rgba(255,215,0,0.75)'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=3;
  [16,W-16].forEach(x=>{ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();});
  const tex=new T.CanvasTexture(c);
  tex.wrapS=tex.wrapT=T.RepeatWrapping; tex.repeat.set(1,6); tex.needsUpdate=true;
  return tex;
}

function getSize(canvas) {
  const r=canvas.getBoundingClientRect();
  return r.width>0&&r.height>0?{w:r.width,h:r.height}:{w:800,h:560};
}

// ============================================================
//  MATERIALS  — ALL chrome-dominant palette
// ============================================================
function createMaterials(skyTex) {
  const nrm = makeChromeNormalTex();
  const wt1 = makeWindowTexture(24,8,'#0a1525','#7bbfff','#aad8ff');
  const wt2 = makeWindowTexture(30,6,'#080f1e','#55aaee','#88ccff');
  const wt3 = makeWindowTexture(20,10,'#0e1828','#99cce8','#bbeeff');
  const wt4 = makeWindowTexture(18,12,'#050e1a','#66aadd','#33aaff');

  const chromeBase = { metalness:1.0, roughness:0.02, clearcoat:1.0, clearcoatRoughness:0.02,
                       envMap:skyTex, envMapIntensity:5.0 };
  return {
    // Deep polished chrome — reflects rich sky blues, not white
    chrome: new T.MeshPhysicalMaterial({ ...chromeBase, color:0x8899bb }),
    // Bright silver-blue highlight chrome
    chromeSilver: new T.MeshPhysicalMaterial({ ...chromeBase, color:0xaabbdd, envMapIntensity:5.5 }),
    // Deep cobalt chrome — moody sky reflections
    chromeBlue: new T.MeshPhysicalMaterial({ ...chromeBase, color:0x556699, envMapIntensity:5.5 }),
    // Rose-gold chrome accent
    chromeGold: new T.MeshPhysicalMaterial({ ...chromeBase, color:0xcc9966, envMapIntensity:4.0 }),
    // Near-black gunmetal — very deep, structural
    chromeDark: new T.MeshPhysicalMaterial({ ...chromeBase, color:0x223344, roughness:0.06, envMapIntensity:3.5 }),
    // True mirror — reflects everything
    mirror: new T.MeshPhysicalMaterial({ color:0x6688aa, metalness:1.0, roughness:0.0, envMap:skyTex, envMapIntensity:7.0 }),
    // Glass — deep teal-blue, highly transmissive
    glass: new T.MeshPhysicalMaterial({ color:0x88bbff, metalness:0.0, roughness:0.0, transmission:0.75, transparent:true, envMap:skyTex, envMapIntensity:4.5 }),
    // Purple-tinted glass
    glassTeal: new T.MeshPhysicalMaterial({ color:0xaabbff, metalness:0.05, roughness:0.0, transmission:0.68, transparent:true, envMap:skyTex, envMapIntensity:4.0 }),

    // Window maps
    win1: new T.MeshPhongMaterial({ map:wt1, emissive:0x1a3355, emissiveIntensity:0.4, shininess:100 }),
    win2: new T.MeshPhongMaterial({ map:wt2, emissive:0x0d2244, emissiveIntensity:0.5, shininess:90 }),
    win3: new T.MeshPhongMaterial({ map:wt3, emissive:0x223344, emissiveIntensity:0.35, shininess:80 }),
    win4: new T.MeshPhongMaterial({ map:wt4, emissive:0x112233, emissiveIntensity:0.45, shininess:85 }),

    // Neons
    neonCyan:  new T.MeshBasicMaterial({ color:0x00ffff }),
    neonBlue:  new T.MeshBasicMaterial({ color:0x0077ff }),
    neonPink:  new T.MeshBasicMaterial({ color:0xff33cc }),
    neonWhite: new T.MeshBasicMaterial({ color:0xeeffff }),

    // Ground
    grass: new T.MeshPhongMaterial({ map:makeGroundTexture(), shininess:8 }),
    road:  new T.MeshPhongMaterial({ map:makeRoadTexture(), shininess:55, specular:0x334455 }),
    sidewalk: new T.MeshPhongMaterial({ color:0x7a8a99, shininess:35, specular:0x334455 }),

    // Tree
    treeTrunk:  new T.MeshPhongMaterial({ color:0x5c3a1e, shininess:8 }),
    treeLeaves: new T.MeshPhongMaterial({ color:0x2d8024, shininess:15, transparent:true, opacity:0.94 }),
  };
}

// ============================================================
//  SAFE-ZONE CHECK  — no buildings on road or near camera
//  Camera travels along x≈0, z from +90 to -287
//  Road occupies |x| < 11, sidewalk |x| < 17
//  We keep |x| < 30 and z > -58 fully clear
// ============================================================
function isSafe(x, z) {
  // Camera approach zone — nothing near camera start
  if (z > -58) return false;
  // Main road corridor — wide buffer so nothing clips
  if (Math.abs(x) < 30) return false;
  // Cross-road corridors (wide enough for full road + buildings set back)
  if (Math.abs(z + 80)  < 18 && Math.abs(x) < 160) return false;
  if (Math.abs(z + 160) < 18 && Math.abs(x) < 160) return false;
  if (Math.abs(z + 240) < 18 && Math.abs(x) < 160) return false;
  if (Math.abs(z + 360) < 18 && Math.abs(x) < 160) return false;
  if (Math.abs(z + 440) < 18 && Math.abs(x) < 160) return false;
  return true;
}

// ============================================================
//  TREE
// ============================================================
function addTree(group, x, z, mats, sc=1) {
  const h=(7+Math.random()*5)*sc;
  const trunk=new T.Mesh(new T.CylinderGeometry(0.38*sc,0.58*sc,h,8),mats.treeTrunk);
  trunk.position.set(x,h/2,z); trunk.castShadow=true; group.add(trunk);
  for(let i=0;i<3;i++){
    const r=(4.2-i*0.9)*sc;
    const f=new T.Mesh(new T.SphereGeometry(r,10,8),mats.treeLeaves);
    f.position.set(x,h+i*2.8*sc,z); f.castShadow=true; group.add(f);
  }
}

// ============================================================
//  STREET LAMP
// ============================================================
function addLamp(scene, x, z, mats) {
  const post=new T.Mesh(new T.CylinderGeometry(0.22,0.28,13,8),mats.chrome);
  post.position.set(x,6.5,z); scene.add(post);
  const arm=new T.Mesh(new T.CylinderGeometry(0.12,0.12,3.5,6),mats.chrome);
  arm.rotation.z=Math.PI/2; arm.position.set(x+(x>0?-1.75:1.75),13.2,z); scene.add(arm);
  const head=new T.Mesh(new T.SphereGeometry(0.95,12,8),mats.neonCyan);
  head.position.set(x+(x>0?-3.5:3.5),13.2,z); scene.add(head);
  const pl=new T.PointLight(0x88ddff,0.8,38);
  pl.position.copy(head.position); scene.add(pl);
  return pl;
}

// ============================================================
//  ROADS
// ============================================================
function addRoads(scene, mats) {
  // Main road (camera axis) — extended to cover loop
  const mr=new T.Mesh(new T.PlaneGeometry(22,900),mats.road);
  mr.rotation.x=-Math.PI/2; mr.position.set(0,0.08,-355); mr.receiveShadow=true; scene.add(mr);
  // Sidewalks
  [-14,14].forEach(sx=>{
    const sw=new T.Mesh(new T.PlaneGeometry(5,900),mats.sidewalk);
    sw.rotation.x=-Math.PI/2; sw.position.set(sx,0.09,-355); sw.receiveShadow=true; scene.add(sw);
  });
  // Cross roads
  [-80,-160,-240,-360,-440].forEach(cz=>{
    const cr=new T.Mesh(new T.PlaneGeometry(300,20),mats.road);
    cr.rotation.x=-Math.PI/2; cr.position.set(0,0.08,cz); cr.receiveShadow=true; scene.add(cr);
    [-13,13].forEach(sz=>{
      const sw=new T.Mesh(new T.PlaneGeometry(300,5),mats.sidewalk);
      sw.rotation.x=-Math.PI/2; sw.position.set(0,0.09,cz+sz); scene.add(sw);
    });
  });
}


// ============================================================
//  CORE HELPERS
// ============================================================
function addPipe(g, points, r, mat, segs=28) {
  if (points.length < 2) return;
  const curve = new T.CatmullRomCurve3(points);
  const mesh = new T.Mesh(new T.TubeGeometry(curve, segs, r, 7, false), mat);
  g.add(mesh); return mesh;
}

function lathe(pts, segs=32) {
  return new T.LatheGeometry(pts.map(([r,y]) => new T.Vector2(r, y)), segs);
}

function pR(profile, t) {
  const idx = Math.min(Math.floor(t * (profile.length - 1)), profile.length - 1);
  return profile[idx][0];
}

// Greeble box cluster — industrial surface noise
function greeble(g, cx, y, cz, mat, count=5, spread=5, maxH=3) {
  for (let i = 0; i < count; i++) {
    const ox = (Math.random()-0.5)*spread*2, oz = (Math.random()-0.5)*spread*2;
    const w = 0.6+Math.random()*2.2, h = 0.5+Math.random()*maxH;
    const m = new T.Mesh(new T.BoxGeometry(w, h, w*0.8), mat);
    m.position.set(cx+ox, y+h/2, cz+oz); g.add(m);
  }
}

// Cylinder tank with end caps and banding
function tank(g, x, y, z, r, h, mat) {
  const body = new T.Mesh(new T.CylinderGeometry(r, r, h, 14), mat);
  body.position.set(x, y, z); g.add(body);
  const topCap = new T.Mesh(new T.SphereGeometry(r, 14, 7, 0, Math.PI*2, 0, Math.PI/2), mat);
  topCap.position.set(x, y+h/2, z); g.add(topCap);
  const botCap = new T.Mesh(new T.SphereGeometry(r, 14, 7, 0, Math.PI*2, 0, Math.PI/2), mat);
  botCap.rotation.x = Math.PI; botCap.position.set(x, y-h/2, z); g.add(botCap);
  for (let i = 1; i < 3; i++) {
    const band = new T.Mesh(new T.TorusGeometry(r+0.18, 0.28, 5, 22), mat);
    band.rotation.x = Math.PI/2; band.position.set(x, y - h/2 + i*h/3, z); g.add(band);
  }
}

// Pipe bundle between two world points (7 pipes + clamps)
function pipeBundle(g, x1,y1,z1, x2,y2,z2, mat) {
  const offs = [[0,0],[1.1,0],[-1.1,0],[0,1.1],[0,-1.1],[0.78,0.78],[-0.78,0.78]];
  offs.forEach(([ox,oz]) => {
    addPipe(g, [
      new T.Vector3(x1+ox, y1, z1+oz),
      new T.Vector3((x1+x2)/2+ox, (y1+y2)/2+(Math.random()-0.5)*6, (z1+z2)/2+oz),
      new T.Vector3(x2+ox, y2, z2+oz),
    ], 0.32, mat, 18);
  });
  [0.3, 0.6].forEach(t => {
    const cx=x1+(x2-x1)*t, cy=y1+(y2-y1)*t, cz2=z1+(z2-z1)*t;
    const cl = new T.Mesh(new T.TorusGeometry(2.0, 0.32, 5, 20), mat);
    cl.rotation.x = Math.PI/2; cl.position.set(cx, cy, cz2); g.add(cl);
  });
}

// Walkway ring platform
function walkwayRing(g, x, y, z, r, mat, nMat) {
  const floor = new T.Mesh(new T.TorusGeometry(r+2.2, 1.4, 5, 44), mat);
  floor.rotation.x = Math.PI/2; floor.position.set(x, y, z); g.add(floor);
  const railO = new T.Mesh(new T.TorusGeometry(r+3.3, 0.2, 5, 44), mat);
  railO.rotation.x = Math.PI/2; railO.position.set(x, y+1.6, z); g.add(railO);
  const railI = new T.Mesh(new T.TorusGeometry(r+1.0, 0.18, 5, 44), mat);
  railI.rotation.x = Math.PI/2; railI.position.set(x, y+1.6, z); g.add(railI);
  for (let i = 0; i < 18; i++) {
    const a = (i/18)*Math.PI*2;
    const post = new T.Mesh(new T.CylinderGeometry(0.12,0.12,1.7,5), mat);
    post.position.set(x+Math.cos(a)*(r+2.2), y+0.85, z+Math.sin(a)*(r+2.2)); g.add(post);
  }
  const glow = new T.Mesh(new T.TorusGeometry(r+2.2, 0.16, 5, 44), nMat);
  glow.rotation.x = Math.PI/2; glow.position.set(x, y-0.4, z); g.add(glow);
}

// ============================================================
//  TYPE 1 — MEGA SPIRE TOWER (ref img 1 style — huge industrial)
//  Exposed structural skeleton, walkways, pipe bundles, tanks
// ============================================================
function addCNTower(g, x, z, mats) {
  // Foundation: spread tripod legs
  for (let i = 0; i < 3; i++) {
    const a = (i/3)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*18, 0, z+Math.sin(a)*18),
      new T.Vector3(x+Math.cos(a)*10, 8, z+Math.sin(a)*10),
      new T.Vector3(x, 14, z),
    ], 1.8, mats.chromeDark);
    // Cross strut
    const a2 = ((i+1)/3)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*18, 0, z+Math.sin(a)*18),
      new T.Vector3(x+Math.cos(a2)*18, 0, z+Math.sin(a2)*18),
    ], 0.8, mats.chromeDark);
  }
  // Large tanks at base
  for (let i = 0; i < 3; i++) {
    const a = ((i+0.5)/3)*Math.PI*2;
    tank(g, x+Math.cos(a)*14, 5, z+Math.sin(a)*14, 3.5, 9, mats.chrome);
  }

  // Main shaft — lathe with organic waist
  const prof = [
    [5.5,14],[5.8,20],[5.0,30],[4.0,42],[3.2,58],[2.8,72],
    [3.2,82],[5.5,88],[7.2,92],[8.0,96],[7.0,100],[4.5,104],[3.0,110],[2.2,118]
  ];
  const shaft = new T.Mesh(lathe(prof, 28), mats.chromeSilver);
  shaft.position.set(x, 0, z); shaft.castShadow = true; g.add(shaft);
  const shaftW = new T.Mesh(lathe(prof.map(([r,y])=>[r+0.1,y]), 28), mats.win2);
  shaftW.position.set(x, 0, z); g.add(shaftW);

  // 6 exterior pipe risers climbing shaft
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*14, 2, z+Math.sin(a)*14),
      new T.Vector3(x+Math.cos(a)*6, 40, z+Math.sin(a)*6),
      new T.Vector3(x+Math.cos(a)*4, 75, z+Math.sin(a)*4),
      new T.Vector3(x+Math.cos(a)*8, 92, z+Math.sin(a)*8),
    ], i%2===0 ? 0.55 : 0.38, i%2===0 ? mats.chrome : mats.chromeDark);
    // Pipe node spheres
    [20, 45, 68].forEach(hy => {
      const nd = new T.Mesh(new T.SphereGeometry(0.8, 8, 6), mats.chromeSilver);
      nd.position.set(x+Math.cos(a)*pR(prof, hy/118)+0.5, hy, z+Math.sin(a)*pR(prof, hy/118)+0.5); g.add(nd);
    });
  }

  // Walkway rings at 3 levels
  [38, 68, 92].forEach((hy, i) => {
    walkwayRing(g, x, hy, z, pR(prof, hy/118)+1.5, mats.chrome, i===1 ? mats.neonPink : mats.neonCyan);
    greeble(g, x, hy, z, mats.chromeDark, 6, pR(prof, hy/118)+3, 2.5);
  });

  // Massive observation disc — organic lathe
  const discP = [[0,0],[10,0],[16,1.5],[20,4],[22,8],[21,12],[18,15],[13,18],[6,20],[0,20]];
  const disc = new T.Mesh(lathe(discP, 36), mats.chrome);
  disc.position.set(x, 92, z); disc.castShadow = true; g.add(disc);
  const discW = new T.Mesh(lathe(discP.map(([r,y])=>[r+0.1,y]), 36), mats.win1);
  discW.position.set(x, 92, z); g.add(discW);
  // Disc neon rings
  [0.15, 0.65].forEach(t => {
    const nr = new T.Mesh(new T.TorusGeometry(pR(discP,t)+0.5, 0.5, 7, 60), t<0.5?mats.neonCyan:mats.neonBlue);
    nr.rotation.x = Math.PI/2; nr.position.set(x, 92+t*20, z); g.add(nr);
  });
  // 10 hanging sensor pods
  for (let i = 0; i < 10; i++) {
    const a = (i/10)*Math.PI*2;
    const pod = new T.Mesh(new T.SphereGeometry(2.0, 12, 8), mats.chrome);
    pod.position.set(x+Math.cos(a)*21, 93, z+Math.sin(a)*21); g.add(pod);
    const cable = new T.Mesh(new T.CylinderGeometry(0.14,0.14,5,5), mats.chromeDark);
    cable.position.set(x+Math.cos(a)*21, 90, z+Math.sin(a)*21); g.add(cable);
  }

  // Upper secondary disc
  const disc2P = [[0,0],[7,0],[10,2],[11,5],[10,8],[7,10],[3,11],[0,11]];
  const disc2 = new T.Mesh(lathe(disc2P, 24), mats.chromeSilver);
  disc2.position.set(x, 113, z); g.add(disc2);
  const nr2 = new T.Mesh(new T.TorusGeometry(9.5, 0.42, 6, 48), mats.neonBlue);
  nr2.rotation.x = Math.PI/2; nr2.position.set(x, 114.5, z); g.add(nr2);

  // Mast with node spheres
  const mast = new T.Mesh(new T.CylinderGeometry(0.7, 1.2, 56, 10), mats.chrome);
  mast.position.set(x, 146, z); g.add(mast);
  [130,142,154,162].forEach((hy,i) => {
    const nd = new T.Mesh(new T.SphereGeometry(2.0-i*0.3, 10, 7), mats.chromeSilver);
    nd.position.set(x, hy, z); g.add(nd);
    // Antenna arms from nodes
    for (let j=0;j<3;j++) {
      const a=(j/3)*Math.PI*2;
      addPipe(g,[new T.Vector3(x,hy,z),new T.Vector3(x+Math.cos(a)*5,hy-3,z+Math.sin(a)*5)],0.18,mats.chrome,8);
    }
  });
  const tip = new T.Mesh(new T.ConeGeometry(0.35,20,8), mats.neonCyan);
  tip.position.set(x, 174, z); g.add(tip);
  const pl = new T.PointLight(0x00ffff, 1.5, 120);
  pl.position.set(x, 180, z); g.add(pl);
}

// ============================================================
//  TYPE 2 — CURTAIN-WALL EXOSKELETON TOWER
//  Glass body inside visible chrome skeleton + diagonal bracing
// ============================================================
function addGlassSkyscraper(g, x, z, mats, h=88, w=18) {
  const R = w * 0.58;

  // Glass faceted core
  const sides = 8;
  const body = new T.Mesh(new T.CylinderGeometry(R, R, h, sides), mats.glass);
  body.position.set(x, h/2, z); body.castShadow = true; g.add(body);
  const wbody = new T.Mesh(new T.CylinderGeometry(R+0.06, R+0.06, h, sides), mats.win1);
  wbody.position.set(x, h/2, z); g.add(wbody);

  // 8 exterior column tubes
  for (let i = 0; i < sides; i++) {
    const a = (i/sides)*Math.PI*2;
    const col = new T.Mesh(new T.CylinderGeometry(0.85, 1.0, h+2, 8), mats.chrome);
    col.position.set(x+Math.cos(a)*(R+1.2), h/2, z+Math.sin(a)*(R+1.2)); g.add(col);
    // Cap sphere
    const cap = new T.Mesh(new T.SphereGeometry(1.1, 8, 6), mats.chromeSilver);
    cap.position.set(x+Math.cos(a)*(R+1.2), h+1, z+Math.sin(a)*(R+1.2)); g.add(cap);
  }

  // Diagonal cross-bracing: X pattern between columns at 4 levels
  const levels = 4;
  for (let lv = 0; lv < levels; lv++) {
    const y0 = (lv/levels)*h, y1 = ((lv+1)/levels)*h;
    for (let i = 0; i < sides; i++) {
      const a1=(i/sides)*Math.PI*2, a2=((i+1)/sides)*Math.PI*2;
      const R2 = R+1.2;
      addPipe(g,[
        new T.Vector3(x+Math.cos(a1)*R2, y0, z+Math.sin(a1)*R2),
        new T.Vector3(x+Math.cos(a2)*R2, y1, z+Math.sin(a2)*R2),
      ], 0.28, mats.chromeBlue, 10);
      addPipe(g,[
        new T.Vector3(x+Math.cos(a1)*R2, y1, z+Math.sin(a1)*R2),
        new T.Vector3(x+Math.cos(a2)*R2, y0, z+Math.sin(a2)*R2),
      ], 0.28, mats.chromeBlue, 10);
    }
    // Floor plate ring
    const plate = new T.Mesh(new T.CylinderGeometry(R+2.2, R+2.2, 0.6, sides), mats.chrome);
    plate.position.set(x, y0, z); g.add(plate);
  }

  // Pipe riser bundles on 2 sides
  pipeBundle(g, x-R-2, 0, z, x-R-2, h*0.75, z, mats.chromeDark);
  pipeBundle(g, x+R+2, 0, z, x+R+2, h*0.7, z, mats.chromeDark);

  // Greeble on some floor plates
  [h*0.25, h*0.75].forEach(hy => greeble(g, x, hy+0.3, z, mats.chromeDark, 5, R, 2));

  // Setback crown — organic lathe
  const crP = [[0,0],[R*0.95,0],[R*0.7,h*0.08],[R*0.45,h*0.2],[R*0.2,h*0.32],[0,h*0.35]];
  const crown = new T.Mesh(lathe(crP, 18), mats.chromeSilver);
  crown.position.set(x, h, z); g.add(crown);
  const crW = new T.Mesh(lathe(crP.map(([r,y])=>[r+0.08,y]), 18), mats.win2);
  crW.position.set(x, h, z); g.add(crW);

  // Needle + tip glow
  const neeH = 26;
  const needle = new T.Mesh(new T.CylinderGeometry(0.18, 0.75, neeH, 8), mats.chrome);
  needle.position.set(x, h + h*0.35 + neeH/2, z); g.add(needle);
  const nTip = new T.Mesh(new T.SphereGeometry(0.9, 8, 6), mats.neonCyan);
  nTip.position.set(x, h + h*0.35 + neeH, z); g.add(nTip);
  // Neon edge strips on columns
  for (let i = 0; i < sides; i += 2) {
    const a=(i/sides)*Math.PI*2;
    const ne = new T.Mesh(new T.CylinderGeometry(0.16,0.16,h+2,4), mats.neonCyan);
    ne.position.set(x+Math.cos(a)*(R+1.25), h/2, z+Math.sin(a)*(R+1.25)); g.add(ne);
  }
  const pl = new T.PointLight(0x00ccff, 0.7, 80);
  pl.position.set(x, h+h*0.35+neeH, z); g.add(pl);
}

// ============================================================
//  TYPE 3 — ORGANIC FLOWING TOWER (ref img 4 / Zaha-esque)
//  Sinuous lathe profile + exterior pipe network + walkways
// ============================================================
function addChromeSlab(g, x, z, mats, h=65, w=22, _d=15) {
  const R = w * 0.45;
  // Sinuous organic profile
  const prof = [
    [R*0.85,0],[R*1.0,4],[R*1.1,10],[R*1.05,h*0.2],
    [R*0.9,h*0.38],[R*0.82,h*0.52],[R*0.92,h*0.68],
    [R*1.08,h*0.78],[R*1.0,h*0.9],[R*0.72,h],[R*0.5,h+2]
  ];
  const body = new T.Mesh(lathe(prof, 16), mats.chromeSilver);
  body.position.set(x, 0, z); body.castShadow = true; g.add(body);
  const win = new T.Mesh(lathe(prof.map(([r,y])=>[r+0.1,y]), 16), mats.win3);
  win.position.set(x, 0, z); g.add(win);

  // 6 exterior pipe risers with organic routing
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2;
    const rBase = pR(prof, 0);
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*(rBase+0.5), 0, z+Math.sin(a)*(rBase+0.5)),
      new T.Vector3(x+Math.cos(a+0.5)*(pR(prof,0.4)+0.5), h*0.4, z+Math.sin(a+0.5)*(pR(prof,0.4)+0.5)),
      new T.Vector3(x+Math.cos(a-0.4)*(pR(prof,0.75)+0.5), h*0.75, z+Math.sin(a-0.4)*(pR(prof,0.75)+0.5)),
      new T.Vector3(x+Math.cos(a)*(pR(prof,1.0)+0.5), h, z+Math.sin(a)*(pR(prof,1.0)+0.5)),
    ], 0.42, i%2===0 ? mats.chrome : mats.chromeDark);
    // Connector nodes
    [0.28, 0.56, 0.82].forEach(t => {
      const nd = new T.Mesh(new T.SphereGeometry(0.72, 7, 5), mats.chromeSilver);
      nd.position.set(x+Math.cos(a)*pR(prof,t), t*h, z+Math.sin(a)*pR(prof,t)); g.add(nd);
    });
  }

  // Walkway at 55% height
  walkwayRing(g, x, h*0.55, z, pR(prof,0.55)+1, mats.chrome, mats.neonCyan);
  greeble(g, x, h*0.55, z, mats.chromeDark, 7, pR(prof,0.55)+3, 2.5);

  // Horizontal structural rings + neon
  [0.22, 0.48, 0.74].forEach(t => {
    const r = pR(prof,t);
    const ring = new T.Mesh(new T.TorusGeometry(r+0.6, 0.48, 6, 30), mats.chromeBlue);
    ring.rotation.x = Math.PI/2; ring.position.set(x, t*h, z); g.add(ring);
    const nr = new T.Mesh(new T.TorusGeometry(r+0.2, 0.18, 5, 30), mats.neonCyan);
    nr.rotation.x = Math.PI/2; nr.position.set(x, t*h+0.5, z); g.add(nr);
  });

  // Rooftop: mechanical cluster + tanks + antenna
  const topR = pR(prof, 1.0);
  greeble(g, x, h+2, z, mats.chromeDark, 8, topR*0.8, 4);
  tank(g, x+topR*0.4, h+4, z, 1.8, 5, mats.chrome);
  tank(g, x-topR*0.4, h+3.5, z+topR*0.3, 1.5, 4, mats.chromeDark);
  const ant = new T.Mesh(new T.CylinderGeometry(0.15, 0.45, 16, 6), mats.chromeSilver);
  ant.position.set(x, h+14, z); g.add(ant);
  const antTip = new T.Mesh(new T.SphereGeometry(0.75, 7, 5), mats.neonBlue);
  antTip.position.set(x, h+22.5, z); g.add(antTip);
}

// ============================================================
//  TYPE 4 — MUSHROOM POD TOWER (most heavily detailed)
//  Organic lathe stem, massive pod with walkway + hanging pods
// ============================================================
function addPodTower(g, x, z, mats) {
  // Base foundation ring
  const base = new T.Mesh(new T.CylinderGeometry(8, 9.5, 4, 20), mats.chromeDark);
  base.position.set(x, 2, z); g.add(base);
  greeble(g, x, 4, z, mats.chromeDark, 8, 8, 3);

  // Stem — complex lathe profile
  const stemP = [
    [3.5,4],[4.5,6],[4.0,10],[3.2,18],[2.6,28],[2.2,36],[2.5,42],[4.5,46]
  ];
  const stem = new T.Mesh(lathe(stemP, 20), mats.chromeSilver);
  stem.position.set(x, 0, z); stem.castShadow = true; g.add(stem);

  // Pipe bundle climbing stem
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*8, 2, z+Math.sin(a)*8),
      new T.Vector3(x+Math.cos(a)*5, 18, z+Math.sin(a)*5),
      new T.Vector3(x+Math.cos(a)*3, 34, z+Math.sin(a)*3),
      new T.Vector3(x+Math.cos(a)*5.5, 46, z+Math.sin(a)*5.5),
    ], 0.45, mats.chrome);
    // Band clamps
    [12, 26, 40].forEach(hy => {
      const cl = new T.Mesh(new T.TorusGeometry(pR(stemP, hy/46)+0.6, 0.32, 5, 20), mats.chromeBlue);
      cl.rotation.x = Math.PI/2; cl.position.set(x, hy, z); g.add(cl);
    });
  }

  // Main pod — detailed lathe disc
  const podP = [
    [0,0],[5,0.5],[9,2],[13,5],[15.8,9],[16.5,14],[16,19],[14,23],
    [11,26],[7,28],[3,28.5],[0,28.5]
  ];
  const pod = new T.Mesh(lathe(podP, 36), mats.chrome);
  pod.position.set(x, 46, z); pod.castShadow = true; g.add(pod);
  const podW = new T.Mesh(lathe(podP.map(([r,y])=>[r+0.1,y]), 36), mats.win1);
  podW.position.set(x, 46, z); g.add(podW);

  // Equator walkway ring
  walkwayRing(g, x, 46+14, z, 16.8, mats.chrome, mats.neonCyan);

  // 12 hanging utility pods around rim
  for (let i = 0; i < 12; i++) {
    const a = (i/12)*Math.PI*2;
    const hpod = new T.Mesh(new T.SphereGeometry(2.2, 10, 7), mats.chromeSilver);
    hpod.position.set(x+Math.cos(a)*18, 46+8, z+Math.sin(a)*18); g.add(hpod);
    const cable = new T.Mesh(new T.CylinderGeometry(0.12,0.12,5,5), mats.chromeDark);
    cable.position.set(x+Math.cos(a)*18, 46+5, z+Math.sin(a)*18); g.add(cable);
    // Every other pod: extra detail
    if (i%2===0) {
      const dish = new T.Mesh(new T.ConeGeometry(1.5,2,8,1,true), mats.chrome);
      dish.rotation.x = Math.PI/2;
      dish.position.set(x+Math.cos(a)*18, 46+8, z+Math.sin(a)*18); g.add(dish);
    }
  }

  // Neon rings
  [46+2, 46+14, 46+26].forEach((hy,i) => {
    const nr = new T.Mesh(new T.TorusGeometry(pR(podP, i/2*0.95)+0.5, 0.6, 7, 56), i===1?mats.neonCyan:mats.neonBlue);
    nr.rotation.x = Math.PI/2; nr.position.set(x, hy, z); g.add(nr);
  });

  // Underside spoke structure
  for (let i = 0; i < 8; i++) {
    const a = (i/8)*Math.PI*2;
    addPipe(g,[
      new T.Vector3(x, 46+2, z),
      new T.Vector3(x+Math.cos(a)*8, 46+4, z+Math.sin(a)*8),
      new T.Vector3(x+Math.cos(a)*15, 46+6, z+Math.sin(a)*15),
    ], 0.22, mats.chromeDark, 10);
  }

  // Upper stacked pods (smaller)
  [[11,46+32,0.72],[7.5,46+44,0.68],[5,46+54,0.65]].forEach(([r,py,sy]) => {
    const p2 = new T.Mesh(new T.SphereGeometry(r, 20, 14), mats.chromeSilver);
    p2.scale.y = sy; p2.position.set(x, py, z); g.add(p2);
    const pr = new T.Mesh(new T.TorusGeometry(r+0.55, 0.38, 6, 28), mats.neonBlue);
    pr.rotation.x = Math.PI/2; pr.position.set(x, py, z); g.add(pr);
  });

  // Top spire with array
  const spire = new T.Mesh(new T.CylinderGeometry(0.3, 0.9, 20, 8), mats.chrome);
  spire.position.set(x, 46+66, z); g.add(spire);
  for (let i = 0; i < 4; i++) {
    const a=(i/4)*Math.PI*2;
    addPipe(g,[new T.Vector3(x,46+72,z),new T.Vector3(x+Math.cos(a)*5,46+69,z+Math.sin(a)*5)],0.16,mats.neonCyan,6);
  }
  const tip = new T.Mesh(new T.SphereGeometry(0.85, 8, 6), mats.neonCyan);
  tip.position.set(x, 46+76.5, z); g.add(tip);
  const pl = new T.PointLight(0x00ffff, 1.1, 80);
  pl.position.set(x, 46+28, z); g.add(pl);
}

// ============================================================
//  TYPE 5 — TOROIDAL RING TOWER (unique Y2K form)
//  Vertical shaft with massive ring/torus at top
// ============================================================
function addPyramidTower(g, x, z, mats, h=75) {
  // Shaft — 6-faceted prism with window band
  const shaft = new T.Mesh(new T.CylinderGeometry(8, 10, h, 6), mats.glass);
  shaft.position.set(x, h/2, z); shaft.castShadow = true; g.add(shaft);
  const sw = new T.Mesh(new T.CylinderGeometry(8.1, 10.1, h, 6), mats.win2);
  sw.position.set(x, h/2, z); g.add(sw);

  // 6 exterior lattice pipes
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*11, 0, z+Math.sin(a)*11),
      new T.Vector3(x+Math.cos(a)*10, h*0.5, z+Math.sin(a)*10),
      new T.Vector3(x+Math.cos(a)*9, h, z+Math.sin(a)*9),
    ], 0.42, mats.chrome);
    // Horizontal hoops
    [h*0.25, h*0.5, h*0.75].forEach(hy => {
      const a2 = ((i+1)/6)*Math.PI*2;
      addPipe(g,[
        new T.Vector3(x+Math.cos(a)*10.5, hy, z+Math.sin(a)*10.5),
        new T.Vector3(x+Math.cos(a2)*10.5, hy, z+Math.sin(a2)*10.5),
      ], 0.28, mats.chromeSilver, 8);
    });
  }

  // Floor plates with neon edges
  [h*0.25, h*0.5, h*0.75].forEach(hy => {
    const plate = new T.Mesh(new T.CylinderGeometry(10.8, 10.8, 0.55, 6), mats.chrome);
    plate.position.set(x, hy, z); g.add(plate);
    const gn = new T.Mesh(new T.TorusGeometry(10.9, 0.18, 5, 36), mats.neonCyan);
    gn.rotation.x = Math.PI/2; gn.position.set(x, hy+0.3, z); g.add(gn);
  });

  // Massive toroidal ring at top
  const ringR = 18, ringT = 4.5;
  const ring = new T.Mesh(new T.TorusGeometry(ringR, ringT, 22, 72), mats.chrome);
  ring.rotation.x = Math.PI/2; ring.position.set(x, h+ringR, z); ring.castShadow = true; g.add(ring);
  const ringW = new T.Mesh(new T.TorusGeometry(ringR, ringT+0.1, 22, 72), mats.win3);
  ringW.rotation.x = Math.PI/2; ringW.position.set(x, h+ringR, z); g.add(ringW);
  // Ring neon edges
  [ringT+0.5, -(ringT+0.5)].forEach(off => {
    const rne = new T.Mesh(new T.TorusGeometry(ringR+off*0.5, 0.28, 5, 72), mats.neonPink);
    rne.rotation.x = Math.PI/2; rne.position.set(x, h+ringR, z); g.add(rne);
  });
  // Support struts from shaft to ring
  for (let i = 0; i < 5; i++) {
    const a = (i/5)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*8.5, h, z+Math.sin(a)*8.5),
      new T.Vector3(x+Math.cos(a)*(ringR-ringT), h+ringR, z+Math.sin(a)*(ringR-ringT)),
    ], 0.55, mats.chromeSilver, 8);
  }
  // Apex above ring
  const apex = new T.Mesh(new T.SphereGeometry(2.5, 14, 10), mats.neonPink);
  apex.position.set(x, h+ringR*2+ringT, z); g.add(apex);
  const topSpire = new T.Mesh(new T.CylinderGeometry(0.3, 0.8, 14, 7), mats.chrome);
  topSpire.position.set(x, h+ringR*2+ringT+7, z); g.add(topSpire);
  const pl = new T.PointLight(0xff44cc, 1.0, 90);
  pl.position.set(x, h+ringR, z); g.add(pl);
}

// ============================================================
//  TYPE 6 — MEGA DOME COMPLEX (ref img 4 — civic/campus style)
//  Raised platform + cylindrical wings + glass dome + lattice
// ============================================================
function addDomeBuilding(g, x, z, mats) {
  // Spread campus base platform
  const platP = [[0,0],[25,0],[26.5,1.5],[27,4],[26,7],[24,9],[0,9]];
  const plat = new T.Mesh(lathe(platP, 32), mats.chromeDark);
  plat.position.set(x, 0, z); g.add(plat);
  greeble(g, x, 9, z, mats.chromeDark, 14, 22, 3.5);

  // 3 cylindrical wing buildings radiating outward
  for (let i = 0; i < 3; i++) {
    const a = (i/3)*Math.PI*2 + Math.PI/6;
    const wx = x+Math.cos(a)*20, wz = z+Math.sin(a)*20;
    const wingH = 22+Math.random()*10;
    const wing = new T.Mesh(new T.CylinderGeometry(6, 7, wingH, 14), mats.chromeBlue);
    wing.position.set(wx, 9+wingH/2, wz); g.add(wing);
    const wingW = new T.Mesh(new T.CylinderGeometry(6.1, 7.1, wingH, 14), mats.win3);
    wingW.position.set(wx, 9+wingH/2, wz); g.add(wingW);
    // Walkway bridge from wing to main dome
    addPipe(g,[
      new T.Vector3(wx, 9+wingH*0.5, wz),
      new T.Vector3((wx+x)/2, 9+wingH*0.55, (wz+z)/2),
      new T.Vector3(x+Math.cos(a)*10, 9+wingH*0.5, z+Math.sin(a)*10),
    ], 1.4, mats.chrome);
    // Pipe bundles at base of wing
    pipeBundle(g, wx, 9, wz, wx, 9+wingH*0.6, wz+2, mats.chromeDark);
  }

  // 16-pillar colonnade ring
  for (let i = 0; i < 16; i++) {
    const a = (i/16)*Math.PI*2;
    const pillar = new T.Mesh(new T.CylinderGeometry(0.6, 0.9, 28, 8), mats.chromeSilver);
    pillar.position.set(x+Math.cos(a)*22, 9+14, z+Math.sin(a)*22); g.add(pillar);
    const pTop = new T.Mesh(new T.SphereGeometry(1.2, 8, 6), mats.chrome);
    pTop.position.set(x+Math.cos(a)*22, 9+28, z+Math.sin(a)*22); g.add(pTop);
  }
  // Colonnade ring rail
  const colRail = new T.Mesh(new T.TorusGeometry(22, 0.4, 5, 80), mats.chrome);
  colRail.rotation.x = Math.PI/2; colRail.position.set(x, 9+29, z); g.add(colRail);

  // Main cylindrical drum building
  const drum = new T.Mesh(new T.CylinderGeometry(18, 20, 24, 32), mats.chromeSilver);
  drum.position.set(x, 9+12, z); drum.castShadow = true; g.add(drum);
  const drumW = new T.Mesh(new T.CylinderGeometry(18.1, 20.1, 24, 32), mats.win3);
  drumW.position.set(x, 9+12, z); g.add(drumW);
  // Exterior drum ribs
  for (let i = 0; i < 12; i++) {
    const a = (i/12)*Math.PI*2;
    const rib = new T.Mesh(new T.CylinderGeometry(0.55, 0.7, 26, 6), mats.chrome);
    rib.position.set(x+Math.cos(a)*20.5, 9+13, z+Math.sin(a)*20.5); g.add(rib);
  }

  // Glass dome with lattice meridians
  const domePts = [[0,0]];
  for (let i = 0; i <= 20; i++) {
    const a = (i/20)*Math.PI/2;
    domePts.push([Math.cos(a)*20, Math.sin(a)*20]);
  }
  const dome = new T.Mesh(lathe(domePts, 36), mats.glass);
  dome.position.set(x, 9+24, z); g.add(dome);
  // 10 meridian ribs
  for (let i = 0; i < 10; i++) {
    const a = (i/10)*Math.PI*2;
    const ribPts = [];
    for (let j = 0; j <= 12; j++) {
      const angle = (j/12)*Math.PI/2;
      ribPts.push(new T.Vector3(
        x+Math.cos(a)*Math.cos(angle)*20.4,
        9+24+Math.sin(angle)*20.4,
        z+Math.sin(a)*Math.cos(angle)*20.4
      ));
    }
    addPipe(g, ribPts, 0.38, mats.chrome, 12);
  }
  // Dome parallel rings
  [5,11,17].forEach(elev => {
    const r = Math.sqrt(Math.max(0,20*20-elev*elev));
    const par = new T.Mesh(new T.TorusGeometry(r, 0.3, 5, 40), mats.chromeBlue);
    par.rotation.x = Math.PI/2; par.position.set(x, 9+24+elev, z); g.add(par);
  });
  // Peak ornament
  const peak = new T.Mesh(new T.SphereGeometry(2.0, 12, 8), mats.neonCyan);
  peak.position.set(x, 9+24+20.5, z); g.add(peak);
  const topSpire = new T.Mesh(new T.CylinderGeometry(0.2,0.6,12,6), mats.chrome);
  topSpire.position.set(x, 9+24+20.5+6, z); g.add(topSpire);
  const pl = new T.PointLight(0x00ffff, 0.9, 70);
  pl.position.set(x, 9+24+21, z); g.add(pl);
}

// ============================================================
//  TYPE 7 — SINUOUS BIOMORPHIC TOWER
//  Pure wave-form silhouette, surface ribs, pipe clusters at pinch points
// ============================================================
function addBlobTower(g, x, z, mats, h=58, s=20) {
  const R = s*0.5;
  // Generate organic wave profile
  const segs = 22;
  const prof = [];
  for (let i = 0; i <= segs; i++) {
    const t = i/segs;
    const y = t*h;
    const rad = R*(0.65 + 0.52*Math.sin(t*Math.PI*2.0+0.4) + 0.32*Math.cos(t*Math.PI*3.5+1.0));
    prof.push([Math.max(2.0, rad), y]);
  }
  const body = new T.Mesh(lathe(prof, 22), mats.chrome);
  body.position.set(x, 0, z); body.castShadow = true; g.add(body);
  const win = new T.Mesh(lathe(prof.map(([r,y])=>[r+0.1,y]), 22), mats.win4);
  win.position.set(x, 0, z); g.add(win);

  // Ribs at every wave peak — find local maxima
  for (let i = 1; i < segs; i++) {
    if (prof[i][0] > prof[i-1][0] && prof[i][0] > prof[i+1][0]) {
      const hy = prof[i][1], r = prof[i][0];
      const ring = new T.Mesh(new T.TorusGeometry(r+0.55, 0.45, 6, 32), mats.chromeSilver);
      ring.rotation.x = Math.PI/2; ring.position.set(x, hy, z); g.add(ring);
      const nr = new T.Mesh(new T.TorusGeometry(r+0.1, 0.2, 5, 32), mats.neonCyan);
      nr.rotation.x = Math.PI/2; nr.position.set(x, hy, z); g.add(nr);
      // Greeble cluster at each peak
      greeble(g, x, hy, z, mats.chromeDark, 5, r, 2.2);
    }
  }

  // 5 organic surface pipes with organic wiggle
  for (let i = 0; i < 5; i++) {
    const a = (i/5)*Math.PI*2;
    addPipe(g, [
      new T.Vector3(x+Math.cos(a)*pR(prof,0), 0, z+Math.sin(a)*pR(prof,0)),
      new T.Vector3(x+Math.cos(a+0.5)*pR(prof,0.3), h*0.3, z+Math.sin(a+0.5)*pR(prof,0.3)),
      new T.Vector3(x+Math.cos(a-0.4)*pR(prof,0.6), h*0.6, z+Math.sin(a-0.4)*pR(prof,0.6)),
      new T.Vector3(x+Math.cos(a)*pR(prof,0.9), h*0.9, z+Math.sin(a)*pR(prof,0.9)),
    ], 0.3, mats.chromeDark, 18);
  }

  // Crown
  const topR = pR(prof, 1.0);
  const crown = new T.Mesh(new T.SphereGeometry(topR*0.7, 18, 12), mats.chromeSilver);
  crown.position.set(x, h, z); g.add(crown);
  const cr = new T.Mesh(new T.TorusGeometry(topR*0.75, 0.4, 6, 32), mats.neonBlue);
  cr.rotation.x = Math.PI/2; cr.position.set(x, h, z); g.add(cr);
  const ant = new T.Mesh(new T.ConeGeometry(0.38, 13, 6), mats.neonBlue);
  ant.position.set(x, h+7.5, z); g.add(ant);
  const pl = new T.PointLight(0x0088ff, 0.8, 60);
  pl.position.set(x, h+5, z); g.add(pl);
}

// ============================================================
//  TYPE 8 — INDUSTRIAL SPINE TOWER
//  Huge exposed spine structure with fins, tanks, catwalks
// ============================================================
function addOrganicTower(g, x, z, mats, h=80) {
  // Central cylindrical spine
  const spine = new T.Mesh(new T.CylinderGeometry(4.5, 6, h, 14), mats.chromeBlue);
  spine.position.set(x, h/2, z); spine.castShadow = true; g.add(spine);
  const spineW = new T.Mesh(new T.CylinderGeometry(4.6, 6.1, h, 14), mats.win1);
  spineW.position.set(x, h/2, z); g.add(spineW);

  // Horizontal spandrel plates every ~12 units
  for (let y = 0; y <= h; y += 12) {
    const sp = new T.Mesh(new T.CylinderGeometry(7.5, 7.5, 0.65, 14), mats.chrome);
    sp.position.set(x, y, z); g.add(sp);
    // Neon edge every other
    if (y % 24 === 0) {
      const gn = new T.Mesh(new T.TorusGeometry(7.6, 0.18, 5, 36), mats.neonCyan);
      gn.rotation.x = Math.PI/2; gn.position.set(x, y+0.3, z); g.add(gn);
    }
  }

  // 4 large structural fins (curved plates)
  for (let i = 0; i < 4; i++) {
    const a = (i/4)*Math.PI*2;
    // Fin as a row of thin boxes forming a curved surface
    for (let seg = 0; seg < 6; seg++) {
      const t = seg/5;
      const fy = t*h, fw = 10-t*3;
      const fin = new T.Mesh(new T.BoxGeometry(0.6, h/5+1, fw), mats.chrome);
      fin.rotation.y = a;
      fin.position.set(x+Math.cos(a)*(6+fw*0.4), fy+h/10, z+Math.sin(a)*(6+fw*0.4));
      g.add(fin);
    }
    // Walkway at mid-fin
    const wkY = h*0.5;
    const wkR = 6+5;
    const wk = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 4), mats.chrome);
    wk.rotation.y = a; wk.position.set(x+Math.cos(a)*wkR, wkY, z+Math.sin(a)*wkR); g.add(wk);
    // Pipe on fin back edge
    addPipe(g,[
      new T.Vector3(x+Math.cos(a)*16, 0, z+Math.sin(a)*16),
      new T.Vector3(x+Math.cos(a)*14, h*0.5, z+Math.sin(a)*14),
      new T.Vector3(x+Math.cos(a)*12, h, z+Math.sin(a)*12),
    ], 0.38, mats.chromeDark);
  }

  // Pipe bundles on 2 opposing sides
  pipeBundle(g, x+7.5, 0, z, x+7.5, h*0.65, z, mats.chromeDark);
  pipeBundle(g, x-7.5, 0, z, x-7.5, h*0.60, z, mats.chrome);

  // Tank cluster at mid-height
  [[x+9,h*0.35,z],[x-9,h*0.4,z],[x,h*0.38,z+9]].forEach(([tx,ty,tz]) => {
    tank(g, tx, ty, tz, 2.2, 7, mats.chrome);
  });

  // Walkway rings at 2 levels
  [h*0.35, h*0.7].forEach(hy => {
    walkwayRing(g, x, hy, z, 8, mats.chromeSilver, mats.neonCyan);
    greeble(g, x, hy, z, mats.chromeDark, 6, 9, 2.5);
  });

  // Organic cap
  const capP = [[0,0],[7,0.5],[9.5,3],[10,7],[8.5,11],[6,14],[2.5,16],[0,16.5]];
  const cap = new T.Mesh(lathe(capP, 20), mats.chromeSilver);
  cap.position.set(x, h+2, z); g.add(cap);
  const capRing = new T.Mesh(new T.TorusGeometry(9.8, 0.48, 6, 44), mats.neonCyan);
  capRing.rotation.x = Math.PI/2; capRing.position.set(x, h+7, z); g.add(capRing);
  const sp2 = new T.Mesh(new T.ConeGeometry(0.38, 18, 7), mats.neonBlue);
  sp2.position.set(x, h+20, z); g.add(sp2);
  const pl = new T.PointLight(0x00aaff, 0.9, 70);
  pl.position.set(x, h+10, z); g.add(pl);
}

// ============================================================
//  TYPE 9 — TWIN TOWERS (complex) + detailed sky bridges + shared base
// ============================================================
function addTwinTowers(g, x, z, mats, h=95) {
  // Shared base megastructure
  const base = new T.Mesh(new T.BoxGeometry(40, 8, 22), mats.chromeDark);
  base.position.set(x, 4, z); g.add(base);
  greeble(g, x, 8, z, mats.chromeDark, 14, 18, 4);
  // Base pipe bundles
  pipeBundle(g, x-18, 0, z, x+18, 0, z, mats.chrome);

  [-13, 13].forEach((ox, idx) => {
    // Per-tower organic profile
    const prof = [
      [5.5,8],[7,12],[7.5,20],[7,32],[6.5,48],[7,62],[7.5,75],[7.2,h],[5.5,h+4]
    ];
    const tower = new T.Mesh(lathe(prof, 18), idx===0 ? mats.chromeBlue : mats.chromeSilver);
    tower.position.set(x+ox, 0, z); tower.castShadow = true; g.add(tower);
    const tw = new T.Mesh(lathe(prof.map(([r,y])=>[r+0.1,y]), 18), mats.win1);
    tw.position.set(x+ox, 0, z); g.add(tw);

    // Exterior pipe risers (4 per tower)
    for (let j = 0; j < 4; j++) {
      const a = (j/4)*Math.PI*2;
      addPipe(g, [
        new T.Vector3(x+ox+Math.cos(a)*pR(prof,0), 8, z+Math.sin(a)*pR(prof,0)),
        new T.Vector3(x+ox+Math.cos(a)*pR(prof,0.5), h*0.5, z+Math.sin(a)*pR(prof,0.5)),
        new T.Vector3(x+ox+Math.cos(a)*pR(prof,1), h, z+Math.sin(a)*pR(prof,1)),
      ], 0.42, mats.chrome);
    }

    // Spandrel plates at key heights
    [h*0.25, h*0.5, h*0.75].forEach(hy => {
      const pl2 = new T.Mesh(new T.CylinderGeometry(pR(prof,hy/h)+1.2, pR(prof,hy/h)+1.2, 0.65, 18), mats.chrome);
      pl2.position.set(x+ox, hy, z); g.add(pl2);
      const gn = new T.Mesh(new T.TorusGeometry(pR(prof,hy/h)+1.3, 0.18, 5, 32), mats.neonCyan);
      gn.rotation.x = Math.PI/2; gn.position.set(x+ox, hy+0.35, z); g.add(gn);
    });

    // Tank cluster at mid
    tank(g, x+ox+pR(prof,0.5)+2.5, h*0.45, z, 1.6, 5, mats.chrome);

    // Top crown ball + spire
    const ball = new T.Mesh(new T.SphereGeometry(5, 16, 12), mats.chromeSilver);
    ball.position.set(x+ox, h+5.5, z); g.add(ball);
    const sp = new T.Mesh(new T.ConeGeometry(0.32, 24, 8), idx===0 ? mats.neonCyan : mats.neonPink);
    sp.position.set(x+ox, h+18, z); g.add(sp);
    const ptl = new T.PointLight(idx===0?0x00ffff:0xff44cc, 0.8, 70);
    ptl.position.set(x+ox, h+22, z); g.add(ptl);
  });

  // 3 sky bridges at different heights — organic tubes
  [h*0.45, h*0.65, h*0.82].forEach((hy, i) => {
    addPipe(g, [
      new T.Vector3(x-13+7.5, hy, z),
      new T.Vector3(x, hy + 4 + i*2, z + (i%2===0?3:-3)),
      new T.Vector3(x+13-7.5, hy, z),
    ], 1.65, mats.chromeSilver);
    // Bridge walkway floor
    addPipe(g, [
      new T.Vector3(x-7, hy-0.5, z),
      new T.Vector3(x, hy+2+i*1.5, z+(i%2===0?1:-1)),
      new T.Vector3(x+7, hy-0.5, z),
    ], 0.22, mats.neonCyan, 8);
    // Bridge support cables
    for (let k = -1; k <= 1; k++) {
      addPipe(g,[
        new T.Vector3(x+k*4, hy+2+i*1.5+4, z),
        new T.Vector3(x+k*4-3, hy-0.5, z),
      ], 0.12, mats.chromeDark, 4);
      addPipe(g,[
        new T.Vector3(x+k*4, hy+2+i*1.5+4, z),
        new T.Vector3(x+k*4+3, hy-0.5, z),
      ], 0.12, mats.chromeDark, 4);
    }
  });
}

// ============================================================
//  MONORAIL  — sci-fi spaceship cruiser
// ============================================================
function createMonorail(scene, mats) {
  const pts=[
    new T.Vector3(-210,46,-38),
    new T.Vector3(-110,46,-22),
    new T.Vector3(-28,50,-58),
    new T.Vector3(28,50,-98),
    new T.Vector3(105,48,-132),
    new T.Vector3(188,48,-152),
    new T.Vector3(215,46,-88),
    new T.Vector3(188,46,-28),
    new T.Vector3(110,46,10),
    new T.Vector3(-30,46,5),
    new T.Vector3(-130,46,-10),
  ];
  const curve=new T.CatmullRomCurve3(pts,true,'catmullrom',0.5);

  // Magnetic rail — glowing plasma tube (closed loop)
  const rg=new T.TubeGeometry(curve,280,0.9,8,true);
  const railMat=new T.MeshPhysicalMaterial({
    color:0x001133, metalness:1.0, roughness:0.05,
    emissive:0x0033aa, emissiveIntensity:0.4,
    envMap:mats.chrome.envMap, envMapIntensity:2.0
  });
  scene.add(new T.Mesh(rg,railMat));
  // Plasma glow core
  const pgeo=new T.TubeGeometry(curve,280,0.32,6,true);
  scene.add(new T.Mesh(pgeo,new T.MeshBasicMaterial({color:0x44aaff,transparent:true,opacity:0.7})));

  // Support pylons — sleek tapered chrome columns
  for(let i=0;i<=18;i++){
    const tt=i/18, p=curve.getPoint(tt);
    // Tapered pylon — height always reaches track from ground
    const pylGeo=new T.CylinderGeometry(0.6,1.4,p.y,8);
    const pyl=new T.Mesh(pylGeo,mats.chromeDark);
    pyl.position.set(p.x,p.y/2,p.z); scene.add(pyl);
    // Flared foot
    const foot=new T.Mesh(new T.CylinderGeometry(2.5,3.0,1.2,8),mats.chromeDark);
    foot.position.set(p.x,0.6,p.z); scene.add(foot);
    // Bracket arm
    const brk=new T.Mesh(new T.BoxGeometry(5.5,0.8,1.4),mats.chrome);
    brk.position.set(p.x,p.y+0.4,p.z); scene.add(brk);
    // Small neon indicator
    const ind=new T.Mesh(new T.SphereGeometry(0.4,6,5),mats.neonBlue);
    ind.position.set(p.x,p.y+1.2,p.z); scene.add(ind);
  }

  // ---- SPACESHIP TRAIN ----
  const train=new T.Group();

  const hullMat=new T.MeshPhysicalMaterial({
    color:0x223355, metalness:1.0, roughness:0.02,
    clearcoat:1.0, clearcoatRoughness:0.02,
    envMap:mats.chrome.envMap, envMapIntensity:5.0
  });
  const glowMat=new T.MeshPhysicalMaterial({
    color:0x0044cc, metalness:0.8, roughness:0.0,
    emissive:0x0033bb, emissiveIntensity:1.0,
    transparent:true, opacity:0.9
  });
  const thrusterMat=new T.MeshBasicMaterial({color:0x44ccff,transparent:true,opacity:0.9});

  const L=36, W=7, H=4.5;

  // ── MAIN HULL: organic lathe cross-section ──
  // Flying saucer-ish cross-section — flat belly, domed top
  const hullProf=[[0,0],[W*0.45,0.2],[W*0.5,H*0.35],[W*0.44,H*0.7],[W*0.3,H],[W*0.12,H*1.1],[0,H*1.12]];
  const hullLathe=new T.LatheGeometry(hullProf.map(([r,y])=>new T.Vector2(r,y)),16);
  // Rotate the lathe 90° so it becomes the cross-section shape
  // Use a simpler approach: build from stacked cylinders
  const hull=new T.Mesh(new T.CylinderGeometry(W*0.5,W*0.52,L,12,1,false),hullMat);
  hull.rotation.z=Math.PI/2; train.add(hull);

  // Upper dome ridge
  const ridge=new T.Mesh(new T.CylinderGeometry(W*0.36,W*0.4,L*0.88,10),hullMat);
  ridge.rotation.z=Math.PI/2; ridge.position.y=H*0.28; train.add(ridge);

  // Flat belly plate
  const belly=new T.Mesh(new T.BoxGeometry(L*0.92,H*0.18,W*0.82),mats.chromeDark);
  belly.position.y=-H*0.28; train.add(belly);

  // ── NOSE: elongated pointed prow ──
  const noseLen=18;
  // Main nose cone
  const noseCone=new T.Mesh(new T.CylinderGeometry(0.3,W*0.5,noseLen,10),hullMat);
  noseCone.rotation.z=Math.PI/2; noseCone.position.x=L/2+noseLen/2; train.add(noseCone);
  // Nose undercut (dark accent panel)
  const noseUnder=new T.Mesh(new T.CylinderGeometry(0.1,W*0.35,noseLen*0.7,8),mats.chromeDark);
  noseUnder.rotation.z=Math.PI/2; noseUnder.position.set(L/2+noseLen*0.35,-H*0.1,0); train.add(noseUnder);
  // Glowing nose tip
  const noseTip=new T.Mesh(new T.SphereGeometry(0.8,10,8),new T.MeshBasicMaterial({color:0x88ddff}));
  noseTip.position.x=L/2+noseLen; train.add(noseTip);
  const nosePL=new T.PointLight(0x44aaff,1.5,25); nosePL.position.x=L/2+noseLen; train.add(nosePL);

  // ── REAR: engine block ──
  const rearBlock=new T.Mesh(new T.CylinderGeometry(W*0.5,W*0.48,5,12),hullMat);
  rearBlock.rotation.z=Math.PI/2; rearBlock.position.x=-L/2-2.5; train.add(rearBlock);

  // 3 engine nacelles (stacked vertically)
  [-H*0.4, 0, H*0.4].forEach((oy,ei)=>{
    const nacelle=new T.Mesh(new T.CylinderGeometry(W*0.14,W*0.16,8,10),hullMat);
    nacelle.rotation.z=Math.PI/2; nacelle.position.set(-L/2-8.5,oy,0); train.add(nacelle);
    // Engine glow disk
    const egeo=new T.CylinderGeometry(W*0.13,W*0.13,0.6,10);
    const eglow=new T.Mesh(egeo,thrusterMat);
    eglow.rotation.z=Math.PI/2; eglow.position.set(-L/2-13,oy,0); train.add(eglow);
    // Engine point light
    const epl=new T.PointLight(0x2244ff,0.8+ei*0.1,20);
    epl.position.set(-L/2-14,oy,0); train.add(epl);
  });

  // ── WINGS: swept delta-wing fins ──
  [-1,1].forEach(side=>{
    // Main wing — elongated box swept back
    const wingGeo=new T.BufferGeometry();
    const s=side, wS=W*0.5+4, wE=W*0.5+11;
    // 6 vertices forming swept wing prism
    const verts=new Float32Array([
      // front leading edge (near nose)
      L*0.15, -H*0.08, s*wS,
      L*0.15, -H*0.25, s*wS,
      // rear trailing edge
      -L*0.3, -H*0.08, s*wE,
      -L*0.3, -H*0.22, s*wE,
      // tip
      -L*0.12, -H*0.15, s*wE,
      -L*0.12, -H*0.08, s*wE,
    ]);
    wingGeo.setAttribute('position',new T.BufferAttribute(verts,3));
    wingGeo.setIndex([0,1,2, 2,1,3, 0,2,4, 0,4,5]);
    wingGeo.computeVertexNormals();
    const wing=new T.Mesh(wingGeo,hullMat);
    train.add(wing);
    // Wing neon edge strip
    const wedge=new T.Mesh(new T.BoxGeometry(L*0.48,0.25,0.4),glowMat);
    wedge.rotation.y=s*0.22; wedge.position.set(-L*0.07,-H*0.1,s*(wS+3)); train.add(wedge);
    // Wing tip light
    const wtl=new T.PointLight(0x0055ff,0.5,18);
    wtl.position.set(-L*0.25,-H*0.12,s*(wE-1)); train.add(wtl);
  });

  // ── CANOPY: bubble cockpit on top ──
  const canopy=new T.Mesh(new T.SphereGeometry(W*0.28,14,10,0,Math.PI*2,0,Math.PI*0.65),
    new T.MeshPhysicalMaterial({color:0x88aaff,transmission:0.6,transparent:true,roughness:0,metalness:0,envMap:mats.chrome.envMap,envMapIntensity:3}));
  canopy.position.set(L*0.22,H*0.55,0); train.add(canopy);
  // Canopy frame rings
  const cf=new T.Mesh(new T.TorusGeometry(W*0.28,0.28,6,24,Math.PI*1.3),hullMat);
  cf.rotation.x=Math.PI/2; cf.position.set(L*0.22,H*0.28,0); train.add(cf);

  // ── SENSOR ARRAY: top spine fins ──
  for(let i=0;i<4;i++){
    const fin=new T.Mesh(new T.BoxGeometry(3.5,H*0.55,0.35),mats.chromeDark);
    fin.position.set(L*0.12-i*7,H*0.6,0); train.add(fin);
    const finTip=new T.Mesh(new T.SphereGeometry(0.3,6,5),new T.MeshBasicMaterial({color:0x00aaff}));
    finTip.position.set(L*0.12-i*7,H*0.9,0); train.add(finTip);
  }

  // ── UNDERSIDE: glowing reactor stripe + landing struts ──
  const reactorStripe=new T.Mesh(new T.BoxGeometry(L*0.75,0.35,W*0.28),
    new T.MeshBasicMaterial({color:0x44ccff,transparent:true,opacity:0.85}));
  reactorStripe.position.set(0,-H*0.5-0.15,0); train.add(reactorStripe);
  const rpl=new T.PointLight(0x2299ff,1.2,35);
  rpl.position.set(0,-H*0.5-1,0); train.add(rpl);

  // Side greeble panels — chrome detail strips
  [-1,1].forEach(side=>{
    const panel=new T.Mesh(new T.BoxGeometry(L*0.55,H*0.22,0.4),mats.chromeDark);
    panel.position.set(0,H*0.1,side*(W*0.51)); train.add(panel);
    const panelGlow=new T.Mesh(new T.BoxGeometry(L*0.48,H*0.08,0.3),glowMat);
    panelGlow.position.set(0,-H*0.05,side*(W*0.52)); train.add(panelGlow);
  });

  train.position.copy(pts[0]);
  train.userData={curve, progress:0, speed:0.00045};
  scene.add(train);
  return train;
}

// ============================================================
//  FLOATING CHROME VEHICLES
// ============================================================
function addFloaters(scene, mats) {
  const list=[];
  for(let i=0;i<22;i++){
    const g=new T.Group();
    // Saucer hull
    const hull=new T.Mesh(new T.SphereGeometry(3.8+Math.random()*1.8,24,16),mats.chrome);
    hull.scale.y=0.48; g.add(hull);
    // Equator ring
    const ring=new T.Mesh(new T.TorusGeometry(4.8+Math.random(),0.55,7,36),mats.neonCyan);
    ring.rotation.x=Math.PI/2; g.add(ring);
    // Cockpit bubble
    const cab=new T.Mesh(new T.SphereGeometry(1.8,14,10),mats.glass);
    cab.position.y=2; g.add(cab);
    // Underbelly thruster glow
    const thr=new T.Mesh(new T.CylinderGeometry(1.2,0.6,1.2,10),mats.neonBlue);
    thr.position.y=-2.5; g.add(thr);

    const side=Math.random()>0.5?1:-1;
    g.position.set(side*(30+Math.random()*90), 40+Math.random()*48, -50-Math.random()*230);
    g.userData={phase:Math.random()*Math.PI*2, baseY:g.position.y, driftX:(Math.random()-0.5)*0.035, driftZ:-(0.025+Math.random()*0.07)};
    scene.add(g); list.push(g);
  }
  return list;
}

// ============================================================
//  ANIMATED WATER — canvas-driven normal map ripples
// ============================================================
function makeWaterNormalCanvas() {
  const S=256; const c=document.createElement('canvas'); c.width=S; c.height=S;
  return { canvas:c, ctx:c.getContext('2d'), size:S };
}

function updateWaterNormal(wd, t) {
  const { ctx, size:S } = wd;
  ctx.fillStyle='#8888ff'; ctx.fillRect(0,0,S,S);
  // Layered sine wave ripples drawn as gradient stripes
  for(let pass=0;pass<3;pass++){
    const freq=0.04+pass*0.028, spd=t*(0.7+pass*0.4), amp=22+pass*8;
    for(let y=0;y<S;y+=2){
      const v=Math.floor(128+amp*Math.sin(y*freq+spd)+amp*0.4*Math.sin(y*freq*1.7-spd*1.3));
      ctx.fillStyle=`rgb(128,128,${Math.min(255,Math.max(100,v))})`;
      ctx.fillRect(0,y,S,2);
    }
    for(let x=0;x<S;x+=2){
      const v=Math.floor(128+amp*Math.sin(x*freq*0.8+spd*1.1));
      ctx.fillStyle=`rgba(${Math.min(255,Math.max(100,v))},128,128,0.35)`;
      ctx.fillRect(x,0,2,S);
    }
  }
}

// ============================================================
//  MAIN  startCity — async for WebGPU
// ============================================================
export async function startCity(canvas) {
  if(instances.has(canvas)) return;
  const size=getSize(canvas);

  // ── RENDERER: WebGPU with graceful WebGL fallback ──
  let renderer, usingWebGPU=false;
  try {
    if(navigator.gpu) {
      const adp=await navigator.gpu.requestAdapter();
      if(adp) {
        // Three.js r162+ ships WebGPURenderer as an ES module
        const mod = await import('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/renderers/webgpu/WebGPURenderer.js').catch(()=>null);
        if(mod && mod.WebGPURenderer) {
          renderer=new mod.WebGPURenderer({canvas,antialias:true,powerPreference:'high-performance'});
          await renderer.init();
          usingWebGPU=true;
          console.log('[ViewCity] WebGPU active');
        }
      }
    }
  } catch(e) { /* fall through */ }

  if(!renderer) {
    renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    console.log('[ViewCity] WebGL active');
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.setSize(size.w,size.h,false);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.1;

  const scene=new T.Scene();
  scene.fog=new T.FogExp2(0x8899cc,0.0016);

  const skyTex=makeSkyTexture();
  const mats=createMaterials(skyTex);
  scene.background=skyTex;
  scene.environment=skyTex;

  const camera=new T.PerspectiveCamera(60,size.w/size.h,0.4,2800);
  camera.position.set(0,20,90);

  // ── LIGHTS ──
  const hemi=new T.HemisphereLight(0x8899dd,0x223366,1.2); scene.add(hemi);
  const sun=new T.DirectionalLight(0xeef4ff,2.6);
  sun.position.set(220,300,100); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); // halved for perf
  sun.shadow.camera.left=-280; sun.shadow.camera.right=280;
  sun.shadow.camera.top=280; sun.shadow.camera.bottom=-280;
  sun.shadow.camera.far=700; sun.shadow.bias=-0.0003;
  scene.add(sun);
  const fill=new T.DirectionalLight(0x6688cc,0.6);
  fill.position.set(-200,100,-120); scene.add(fill);
  scene.add(new T.AmbientLight(0x556688,0.5));

  // ── CHROME GROUND PLANE ──
  const groundMat=new T.MeshPhysicalMaterial({
    color:0x112233, metalness:1.0, roughness:0.04,
    clearcoat:1.0, clearcoatRoughness:0.04,
    envMap:skyTex, envMapIntensity:5.5
  });
  const ground=new T.Mesh(new T.PlaneGeometry(2400,2400),groundMat);
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);

  // ── ANIMATED WATER ──
  // Sits just below chrome ground on the periphery, purple-blue reflective
  const waterNorm=makeWaterNormalCanvas();
  updateWaterNormal(waterNorm,0);
  const waterNormTex=new T.CanvasTexture(waterNorm.canvas);
  waterNormTex.wrapS=waterNormTex.wrapT=T.RepeatWrapping;
  waterNormTex.repeat.set(18,18);

  const waterMat=new T.MeshPhysicalMaterial({
    color:0x1122aa,
    metalness:0.9,
    roughness:0.0,
    clearcoat:1.0,
    clearcoatRoughness:0.0,
    envMap:skyTex,
    envMapIntensity:6.5,
    transparent:true,
    opacity:0.88,
    normalMap:waterNormTex,
    normalScale:new T.Vector2(0.6,0.6),
  });
  const waterMesh=new T.Mesh(new T.PlaneGeometry(2400,2400,1,1),waterMat);
  waterMesh.rotation.x=-Math.PI/2;
  waterMesh.position.y=-2.5;
  scene.add(waterMesh);
  waterMesh.userData={wd:waterNorm, tex:waterNormTex};

  // Water glow — purple-blue rim lights at water level
  [[-180,-160],[180,-160],[-180,-280],[180,-280]].forEach(([wx,wz])=>{
    const wl=new T.PointLight(0x3322bb,0.9,160);
    wl.position.set(wx,-1,wz); scene.add(wl);
  });
  // Horizon glow strip (wide area light approximation)
  const horizGlow=new T.Mesh(
    new T.PlaneGeometry(2400,60),
    new T.MeshBasicMaterial({color:0x4433cc,transparent:true,opacity:0.18,side:T.DoubleSide})
  );
  horizGlow.rotation.x=-Math.PI/2; horizGlow.position.set(0,-0.5,-800); scene.add(horizGlow);

  // Mirror plaza strip — extended for loop
  const plaza=new T.Mesh(new T.PlaneGeometry(65,900),mats.mirror);
  plaza.rotation.x=-Math.PI/2; plaza.position.set(0,0.05,-355); plaza.receiveShadow=true; scene.add(plaza);
  // Grid lines
  const lm=new T.LineBasicMaterial({color:0x5566cc,transparent:true,opacity:0.35});
  for(let i=-32;i<=32;i+=3){
    const g2=new T.BufferGeometry().setFromPoints([new T.Vector3(i,0.14,-900),new T.Vector3(i,0.14,100)]);
    scene.add(new T.Line(g2,lm));
  }

  addRoads(scene, mats);
  for(let z2=-28;z2>-460;z2-=26){ [-14,14].forEach(sx=>addLamp(scene,sx,z2,mats)); }

  // ── CITY ──
  const city=new T.Group(); scene.add(city);

  const landmarks=[
    // ── FOREGROUND — visible immediately as camera spawns (z = -60 .. -95) ──
    ()=>addGlassSkyscraper(city,-105,-62,mats,68,15),
    ()=>addGlassSkyscraper(city,98,-64,mats,62,14),
    ()=>addBlobTower(city,-130,-68,mats,52,16),
    ()=>addBlobTower(city,122,-70,mats,46,15),
    ()=>addOrganicTower(city,-50,-62,mats,55),
    ()=>addOrganicTower(city,52,-60,mats,48),
    ()=>addChromeSlab(city,-145,-72,mats,60,22,15),
    ()=>addChromeSlab(city,138,-74,mats,55,20,14),
    ()=>addPyramidTower(city,-50,-90,mats,60),
    ()=>addPyramidTower(city,52,-92,mats,56),
    // ── LOOP-END MIRRORS — match foreground so loop is seamless (z = -270 .. -300) ──
    ()=>addGlassSkyscraper(city,-105,-272,mats,68,15),
    ()=>addGlassSkyscraper(city,98,-274,mats,62,14),
    ()=>addBlobTower(city,-130,-278,mats,52,16),
    ()=>addBlobTower(city,122,-280,mats,46,15),
    ()=>addOrganicTower(city,-50,-272,mats,55),
    ()=>addOrganicTower(city,52,-270,mats,48),
    ()=>addChromeSlab(city,-145,-282,mats,60,22,15),
    ()=>addChromeSlab(city,138,-284,mats,55,20,14),
    ()=>addPyramidTower(city,-50,-298,mats,60),
    ()=>addPyramidTower(city,52,-300,mats,56),
    // ── LOOP-END FAR MIRRORS — match foreground at camera reset point (z = -432 .. -460) ──
    ()=>addGlassSkyscraper(city,-105,-432,mats,68,15),
    ()=>addGlassSkyscraper(city,98,-434,mats,62,14),
    ()=>addBlobTower(city,-130,-438,mats,52,16),
    ()=>addBlobTower(city,122,-440,mats,46,15),
    ()=>addOrganicTower(city,-50,-432,mats,55),
    ()=>addOrganicTower(city,52,-430,mats,48),
    ()=>addChromeSlab(city,-145,-442,mats,60,22,15),
    ()=>addChromeSlab(city,138,-444,mats,55,20,14),
    ()=>addPyramidTower(city,-50,-455,mats,60),
    ()=>addPyramidTower(city,52,-458,mats,56),
    // ── MAIN LANDMARKS ──
    ()=>addCNTower(city,-75,-95,mats),
    ()=>addCNTower(city,92,-120,mats),
    ()=>addCNTower(city,-112,-180,mats),
    ()=>addCNTower(city,65,-208,mats),
    ()=>addCNTower(city,-145,-290,mats),
    ()=>addCNTower(city,120,-310,mats),
    ()=>addDomeBuilding(city,-52,-70,mats),
    ()=>addDomeBuilding(city,70,-85,mats),
    ()=>addDomeBuilding(city,-120,-135,mats),
    ()=>addDomeBuilding(city,105,-225,mats),
    ()=>addPodTower(city,-42,-140,mats),
    ()=>addPodTower(city,76,-152,mats),
    ()=>addPodTower(city,-90,-248,mats),
    ()=>addPodTower(city,108,-276,mats),
    ()=>addPodTower(city,-55,-320,mats),
    ()=>addGlassSkyscraper(city,-65,-112,mats,90,19),
    ()=>addGlassSkyscraper(city,52,-100,mats,77,17),
    ()=>addGlassSkyscraper(city,-95,-170,mats,98,21),
    ()=>addGlassSkyscraper(city,82,-190,mats,84,18),
    ()=>addGlassSkyscraper(city,-136,-218,mats,108,23),
    ()=>addGlassSkyscraper(city,120,-228,mats,92,19),
    ()=>addGlassSkyscraper(city,-175,-260,mats,115,24),
    ()=>addGlassSkyscraper(city,160,-280,mats,100,22),
    ()=>addChromeSlab(city,-50,-86,mats,68,24,16),
    ()=>addChromeSlab(city,46,-74,mats,57,19,14),
    ()=>addChromeSlab(city,-120,-104,mats,80,25,17),
    ()=>addChromeSlab(city,96,-150,mats,72,21,15),
    ()=>addChromeSlab(city,-80,-200,mats,88,23,17),
    ()=>addChromeSlab(city,135,-180,mats,62,21,15),
    ()=>addChromeSlab(city,-165,-240,mats,95,26,18),
    ()=>addChromeSlab(city,155,-265,mats,75,22,16),
    ()=>addBlobTower(city,-150,-90,mats,62,21),
    ()=>addBlobTower(city,124,-104,mats,52,19),
    ()=>addBlobTower(city,-64,-190,mats,72,23),
    ()=>addBlobTower(city,100,-255,mats,57,17),
    ()=>addBlobTower(city,-130,-315,mats,65,20),
    ()=>addPyramidTower(city,-55,-192,mats,82),
    ()=>addPyramidTower(city,58,-235,mats,92),
    ()=>addPyramidTower(city,-150,-258,mats,72),
    ()=>addPyramidTower(city,164,-136,mats,78),
    ()=>addPyramidTower(city,-80,-340,mats,88),
    ()=>addOrganicTower(city,-58,-158,mats,85),
    ()=>addOrganicTower(city,68,-178,mats,78),
    ()=>addOrganicTower(city,-137,-232,mats,90),
    ()=>addOrganicTower(city,148,-252,mats,82),
    ()=>addOrganicTower(city,35,-295,mats,88),
    ()=>addOrganicTower(city,-110,-310,mats,95),
    ()=>addTwinTowers(city,-88,-124,mats,98),
    ()=>addTwinTowers(city,112,-165,mats,105),
    ()=>addTwinTowers(city,-162,-184,mats,88),
    ()=>addTwinTowers(city,88,-298,mats,110),
  ];
  landmarks.forEach(fn=>fn());

  // Filler buildings — reduced count for perf
  for(let i=0;i<48;i++){
    const x=(Math.random()-0.5)*480, z=-100-Math.random()*440;
    if(!isSafe(x,z)) continue;
    const tp=Math.random(), h=32+Math.random()*80;
    if(tp<0.22) addGlassSkyscraper(city,x,z,mats,h,11+Math.random()*10);
    else if(tp<0.44) addChromeSlab(city,x,z,mats,h,13+Math.random()*9,9+Math.random()*7);
    else if(tp<0.60) addPodTower(city,x,z,mats);
    else if(tp<0.75) addBlobTower(city,x,z,mats,h,14+Math.random()*9);
    else if(tp<0.88) addOrganicTower(city,x,z,mats,h);
    else addPyramidTower(city,x,z,mats,h);
  }

  // Background — simple cylinders at distance (less poly than detailed buildings)
  for(let i=0;i<75;i++){
    const x=(Math.random()-0.5)*700, z=-420-Math.random()*680;
    if(Math.abs(x)<30) continue;
    const h=60+Math.random()*140, w=6+Math.random()*11;
    const mat=Math.random()>0.5?mats.chromeBlue:mats.chromeSilver;
    const bg=new T.Mesh(new T.CylinderGeometry(w,w,h,7),mat);
    bg.position.set(x,h/2,z); city.add(bg);
    if(Math.random()>0.55){
      const sp=new T.Mesh(new T.ConeGeometry(0.5,18,6),Math.random()>0.5?mats.neonCyan:mats.neonPink);
      sp.position.set(x,h+9,z); city.add(sp);
    }
  }

  // ── MONORAIL + FLOATERS + CLOUDS ──
  const monorailTrain=createMonorail(scene,mats);
  const floaters=addFloaters(scene,mats);

  // Reduced cloud count for perf
  const clouds3D=[];
  const cMat=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.85});
  for(let i=0;i<24;i++){
    const cg=new T.Group();
    for(let j=0;j<6+Math.floor(Math.random()*6);j++){
      const r=9+Math.random()*18;
      const puff=new T.Mesh(new T.SphereGeometry(r,8,6),cMat);
      puff.position.set((Math.random()-0.5)*80,(Math.random()-0.5)*16,(Math.random()-0.5)*30);
      puff.scale.y=0.48+Math.random()*0.26;
      cg.add(puff);
    }
    cg.position.set((Math.random()-0.5)*900,90+Math.random()*110,-55-Math.random()*900);
    cg.userData={speed:0.006+Math.random()*0.015};
    scene.add(cg); clouds3D.push(cg);
  }

  // ── RESIZE ──
  let ro=null;
  function onResize(){
    const sz=getSize(canvas);
    renderer.setSize(sz.w,sz.h,false);
    camera.aspect=sz.w/sz.h;
    camera.updateProjectionMatrix();
  }
  if(typeof ResizeObserver!=='undefined'){
    ro=new ResizeObserver(onResize); ro.observe(canvas.parentElement||canvas);
  } else window.addEventListener('resize',onResize);
  onResize();

  const state={renderer,scene,camera,rafId:null,paused:false,ro,time:0,camZ:90};
  instances.set(canvas,state);

  function animate(){
    state.rafId=requestAnimationFrame(animate);
    if(state.paused) return;
    state.time+=0.013;
    const t=state.time;

    // Camera — loops seamlessly: foreground at start mirrors loop-end
    state.camZ-=0.28;
    if(state.camZ<-287) state.camZ=90;
    const sx=Math.sin(t*0.11)*3.5;
    const sy=18.5+Math.sin(t*0.28)*2.2;
    camera.position.set(sx,sy,state.camZ);
    camera.lookAt(sx*0.3+Math.sin(t*0.07)*2, 15, state.camZ-88);

    // Water animation — update canvas normal map every 3rd frame for perf
    if(Math.round(t*77)%3===0){
      updateWaterNormal(waterMesh.userData.wd, t);
      waterMesh.userData.tex.needsUpdate=true;
    }

    // Floaters
    floaters.forEach(v=>{
      v.position.y=v.userData.baseY+Math.sin(t*1.2+v.userData.phase)*3.2;
      v.position.x+=v.userData.driftX;
      v.position.z+=v.userData.driftZ;
      if(v.position.z>12) v.position.z=-285;
      if(Math.abs(v.position.x)>210) v.userData.driftX*=-1;
      v.rotation.y+=0.004;
    });

    // Clouds
    clouds3D.forEach(c=>{ c.position.x+=c.userData.speed; if(c.position.x>460) c.position.x=-460; });

    // Monorail — closed loop curve, progress wraps 0-1
    const tr=monorailTrain;
    tr.userData.progress=(tr.userData.progress+tr.userData.speed)%1;
    const pos=tr.userData.curve.getPoint(tr.userData.progress);
    const ahead=(tr.userData.progress+0.008)%1;
    const posAhead=tr.userData.curve.getPoint(ahead);
    tr.position.copy(pos);
    tr.lookAt(posAhead);

    renderer.render(scene,camera);
  }
  animate();
  console.log('[ViewCity] v5 — WebGPU/WebGL, chrome ground, water, spaceship monorail');
}

export function stopCity(canvas){
  const s=instances.get(canvas); if(!s) return;
  cancelAnimationFrame(s.rafId);
  if(s.ro) s.ro.disconnect();
  if(s.renderer) s.renderer.dispose();
  instances.delete(canvas);
}

export function cityPause(canvas){
  const s=instances.get(canvas); if(!s) return false;
  s.paused=!s.paused; return s.paused;
}

export function cityReset(canvas){
  const s=instances.get(canvas); if(!s) return;
  s.time=0; s.camZ=90;
}

export function cityWireframe(canvas,val){
  const s=instances.get(canvas); if(!s) return;
  s.scene.traverse(obj=>{
    if(obj.isMesh&&obj.material){
      const m=Array.isArray(obj.material)?obj.material:[obj.material];
      m.forEach(mat=>{if(mat) mat.wireframe=val;});
    }
  });
}