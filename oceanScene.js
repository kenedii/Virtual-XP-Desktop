import * as T from 'three';

// ============================================================
//  OCEAN SCENE — High-detail underwater with realistic water & corals
// ============================================================

const instances = new Map();

function getSize(canvas) {
  const r = canvas.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { w: r.width, h: r.height } : { w: 800, h: 560 };
}

// ============================================================
//  TEXTURE GENERATORS
// ============================================================

function makeWaterTexture() {
  const W = 1024, H = 1024;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0af0ff');
  g.addColorStop(0.15, '#08d0ee');
  g.addColorStop(0.35, '#06a8d8');
  g.addColorStop(0.55, '#0480b0');
  g.addColorStop(0.75, '#025880');
  g.addColorStop(1, '#012040');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = 'screen';
  for (let layer = 0; layer < 4; layer++) {
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const r = (10 + Math.random() * 50) / (layer + 1);
      const opacity = (0.06 + Math.random() * 0.12) / (layer + 0.5);
      const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
      cg.addColorStop(0, `rgba(180,240,255,${opacity})`);
      cg.addColorStop(0.5, `rgba(80,200,255,${opacity * 0.3})`);
      cg.addColorStop(1, 'rgba(0,150,255,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.3 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // Ripple lines
  for (let i = 0; i < 40; i++) {
    const baseY = (i / 40) * H;
    ctx.strokeStyle = `rgba(180,245,255,${0.1 + Math.random() * 0.25})`;
    ctx.lineWidth = 0.4 + Math.random() * 1.2;
    ctx.beginPath();
    let first = true;
    for (let x2 = 0; x2 <= W; x2 += 6) {
      const y = baseY + Math.sin(x2 * 0.015 + i * 0.4) * (5 + Math.random() * 4);
      if (first) { ctx.moveTo(x2, y); first = false; } else ctx.lineTo(x2, y);
    }
    ctx.stroke();
  }

  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

function makeSandTexture() {
  const S = 512;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, '#f0e8b8');
  g.addColorStop(0.4, '#e0d090');
  g.addColorStop(1, '#b8a060');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    const r = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = `rgba(${180 + Math.random() * 50},${160 + Math.random() * 50},${80 + Math.random() * 40},${0.3 + Math.random() * 0.3})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function makeCoralTexture(hue1, hue2) {
  const S = 256;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, 10, S / 2, S / 2, S / 2);
  g.addColorStop(0, hue1);
  g.addColorStop(1, hue2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  // Organic bumps
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    const r = 2 + Math.random() * 8;
    ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.1})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  return tex;
}

function makeNormalMap() {
  const S = 512;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8080ff'; ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    const r = 3 + Math.random() * 20;
    const rr = Math.floor(100 + Math.random() * 56);
    const gg = Math.floor(100 + Math.random() * 56);
    ctx.fillStyle = `rgba(${rr},${gg},255,0.3)`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new T.CanvasTexture(c);
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

// ============================================================
//  CORAL BUILDERS
// ============================================================

function makeBranchCoral(scene, x, y, z, color, scale = 1) {
  const tex = makeCoralTexture(color, '#331100');
  const mat = new T.MeshPhongMaterial({ map: tex, shininess: 40, color: new T.Color(color) });

  function addBranch(parentPos, dir, len, rad, depth) {
    if (depth <= 0 || len < 0.02) return;
    const geo = new T.CylinderGeometry(rad * 0.6, rad, len, 6, 1);
    const mesh = new T.Mesh(geo, mat);
    mesh.position.copy(parentPos);
    mesh.position.y += len / 2;
    // Tilt toward direction
    mesh.rotation.x = dir.x * 0.4;
    mesh.rotation.z = dir.z * 0.4;
    scene.add(mesh);

    // Tip sphere
    if (depth <= 1) {
      const tip = new T.Mesh(new T.SphereGeometry(rad * 1.2, 6, 6), mat);
      tip.position.copy(mesh.position);
      tip.position.y += len / 2;
      scene.add(tip);
    }

    // Sub-branches
    const numB = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numB; i++) {
      const newDir = new T.Vector3(
        dir.x + (Math.random() - 0.5) * 1.5,
        0.5 + Math.random() * 0.5,
        dir.z + (Math.random() - 0.5) * 1.5
      ).normalize();
      const newPos = mesh.position.clone();
      newPos.y += len / 2;
      addBranch(newPos, newDir, len * (0.55 + Math.random() * 0.2), rad * 0.65, depth - 1);
    }
  }

  const pos = new T.Vector3(x, y, z);
  const baseLen = (0.4 + Math.random() * 0.3) * scale;
  const baseRad = (0.06 + Math.random() * 0.04) * scale;
  addBranch(pos, new T.Vector3(0, 1, 0), baseLen, baseRad, 3 + Math.floor(Math.random() * 2));
}

function makeFanCoral(scene, x, y, z, color, scale = 1) {
  const s = scale * (0.4 + Math.random() * 0.3);
  const geo = new T.PlaneGeometry(s, s * 1.2, 8, 8);
  const positions = geo.attributes.position;
  // Organic wave deformation
  for (let i = 0; i < positions.count; i++) {
    const px = positions.getX(i), py = positions.getY(i);
    positions.setZ(i, Math.sin(px * 6) * 0.04 * scale + Math.cos(py * 4) * 0.03 * scale);
    positions.setY(i, py + Math.abs(py) * 0.15);
  }
  geo.computeVertexNormals();
  const mat = new T.MeshPhongMaterial({
    color: new T.Color(color), side: T.DoubleSide, transparent: true, opacity: 0.85, shininess: 30
  });
  const mesh = new T.Mesh(geo, mat);
  mesh.position.set(x, y + s * 0.5, z);
  mesh.rotation.y = Math.random() * Math.PI;
  mesh.rotation.x = -0.1 + Math.random() * 0.2;
  scene.add(mesh);
}

function makeTubeCoral(scene, x, y, z, color, scale = 1) {
  const count = 3 + Math.floor(Math.random() * 5);
  const mat = new T.MeshPhongMaterial({ color: new T.Color(color), shininess: 50 });
  for (let i = 0; i < count; i++) {
    const h = (0.15 + Math.random() * 0.3) * scale;
    const r = (0.02 + Math.random() * 0.04) * scale;
    const geo = new T.CylinderGeometry(r * 1.3, r, h, 8, 1, true);
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(
      x + (Math.random() - 0.5) * 0.15 * scale,
      y + h / 2,
      z + (Math.random() - 0.5) * 0.15 * scale
    );
    mesh.rotation.x = (Math.random() - 0.5) * 0.3;
    mesh.rotation.z = (Math.random() - 0.5) * 0.3;
    scene.add(mesh);
    // Top ring
    const ring = new T.Mesh(new T.TorusGeometry(r * 1.3, r * 0.3, 6, 12), mat);
    ring.position.copy(mesh.position);
    ring.position.y += h / 2;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
  }
}

function makeRockFormation(scene, x, y, z, scale = 1) {
  const count = 2 + Math.floor(Math.random() * 3);
  const rockMat = new T.MeshPhongMaterial({
    color: 0x556655, shininess: 10, flatShading: true
  });
  for (let i = 0; i < count; i++) {
    const geo = new T.DodecahedronGeometry(
      (0.1 + Math.random() * 0.2) * scale, 1
    );
    // Deform
    const pos = geo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      pos.setX(j, pos.getX(j) * (0.7 + Math.random() * 0.6));
      pos.setY(j, pos.getY(j) * (0.5 + Math.random() * 0.6));
      pos.setZ(j, pos.getZ(j) * (0.7 + Math.random() * 0.6));
    }
    geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, rockMat);
    mesh.position.set(
      x + (Math.random() - 0.5) * 0.3 * scale,
      y + 0.05 * scale,
      z + (Math.random() - 0.5) * 0.3 * scale
    );
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(mesh);
  }
}

function makeSeaweed(scene, x, y, z, scale = 1) {
  const h = (0.4 + Math.random() * 0.5) * scale;
  const segments = 8;
  const curve = new T.CatmullRomCurve3(
    Array.from({ length: segments }, (_, i) => {
      const t = i / (segments - 1);
      return new T.Vector3(
        Math.sin(t * 3) * 0.05 * scale,
        t * h,
        Math.cos(t * 2) * 0.03 * scale
      );
    })
  );
  const geo = new T.TubeGeometry(curve, 12, 0.012 * scale, 5, false);
  const green = `hsl(${120 + Math.random() * 40}, ${50 + Math.random() * 30}%, ${25 + Math.random() * 20}%)`;
  const mat = new T.MeshPhongMaterial({ color: new T.Color(green), shininess: 20 });
  const mesh = new T.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.userData.originalPositions = geo.attributes.position.array.slice();
  mesh.userData.swayOffset = Math.random() * Math.PI * 2;
  scene.add(mesh);
  return mesh;
}

// ============================================================
//  FISH
// ============================================================

function makeFish(scene, color, size = 1) {
  const group = new T.Group();

  // Body
  const bodyGeo = new T.SphereGeometry(0.06 * size, 8, 6);
  bodyGeo.scale(1.8, 1, 0.8);
  const bodyMat = new T.MeshPhongMaterial({ color: new T.Color(color), shininess: 80 });
  const body = new T.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Tail
  const tailGeo = new T.ConeGeometry(0.04 * size, 0.08 * size, 4);
  const tail = new T.Mesh(tailGeo, bodyMat);
  tail.position.x = -0.1 * size;
  tail.rotation.z = Math.PI / 2;
  group.add(tail);

  // Eye
  const eyeGeo = new T.SphereGeometry(0.012 * size, 6, 6);
  const eyeMat = new T.MeshBasicMaterial({ color: 0xffffff });
  const eyeL = new T.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.06 * size, 0.02 * size, 0.035 * size);
  group.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.z = -0.035 * size;
  group.add(eyeR);

  // Pupil
  const pupilGeo = new T.SphereGeometry(0.007 * size, 6, 6);
  const pupilMat = new T.MeshBasicMaterial({ color: 0x000000 });
  const pupilL = new T.Mesh(pupilGeo, pupilMat);
  pupilL.position.set(0.068 * size, 0.02 * size, 0.04 * size);
  group.add(pupilL);
  const pupilR = pupilL.clone();
  pupilR.position.z = -0.04 * size;
  group.add(pupilR);

  // Swimming params
  group.userData.speed = 0.2 + Math.random() * 0.5;
  group.userData.swimAngle = Math.random() * Math.PI * 2;
  group.userData.swimRadius = 0.8 + Math.random() * 1.5;
  group.userData.swimY = 0.2 + Math.random() * 0.8;
  group.userData.wobble = Math.random() * Math.PI * 2;
  group.userData.centerX = (Math.random() - 0.5) * 2;
  group.userData.centerZ = (Math.random() - 0.5) * 2;

  scene.add(group);
  return group;
}

// ============================================================
//  BUBBLES
// ============================================================

function makeBubbles(scene, count = 30) {
  const bubbles = [];
  const geo = new T.SphereGeometry(1, 8, 8);
  const mat = new T.MeshPhongMaterial({
    color: 0xbbddff, transparent: true, opacity: 0.35, shininess: 100
  });

  for (let i = 0; i < count; i++) {
    const size = 0.008 + Math.random() * 0.025;
    const mesh = new T.Mesh(geo, mat.clone());
    mesh.scale.setScalar(size);
    mesh.position.set(
      (Math.random() - 0.5) * 3,
      Math.random() * 1.5,
      (Math.random() - 0.5) * 3
    );
    mesh.userData.speed = 0.1 + Math.random() * 0.3;
    mesh.userData.wobble = Math.random() * Math.PI * 2;
    scene.add(mesh);
    bubbles.push(mesh);
  }
  return bubbles;
}

// ============================================================
//  LIGHT RAYS
// ============================================================

function makeLightRays(scene) {
  const rays = [];
  const rayMat = new T.MeshBasicMaterial({
    color: 0xaaeeff, transparent: true, opacity: 0.06, side: T.DoubleSide
  });
  for (let i = 0; i < 8; i++) {
    const w = 0.05 + Math.random() * 0.15;
    const geo = new T.PlaneGeometry(w, 3);
    const ray = new T.Mesh(geo, rayMat.clone());
    ray.position.set(
      (Math.random() - 0.5) * 3,
      1.2,
      (Math.random() - 0.5) * 2 - 1
    );
    ray.rotation.z = -0.2 + Math.random() * 0.4;
    ray.rotation.y = Math.random() * 0.5;
    ray.userData.baseOpacity = 0.03 + Math.random() * 0.06;
    ray.userData.phase = Math.random() * Math.PI * 2;
    scene.add(ray);
    rays.push(ray);
  }
  return rays;
}

// ============================================================
//  PARTICLES (plankton / sediment)
// ============================================================

function makeParticles(scene, count = 200) {
  const geo = new T.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = Math.random() * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  geo.setAttribute('position', new T.BufferAttribute(positions, 3));
  const mat = new T.PointsMaterial({
    color: 0xccffee, size: 0.012, transparent: true, opacity: 0.5
  });
  const points = new T.Points(geo, mat);
  scene.add(points);
  return points;
}

// ============================================================
//  WATER SURFACE (top of scene)
// ============================================================

function makeWaterSurface(scene) {
  const geo = new T.PlaneGeometry(6, 6, 64, 64);
  const normalMap = makeNormalMap();
  const mat = new T.MeshPhongMaterial({
    color: 0x0088cc, transparent: true, opacity: 0.3,
    side: T.DoubleSide, shininess: 100,
    normalMap: normalMap,
    normalScale: new T.Vector2(0.5, 0.5)
  });
  const mesh = new T.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 1.8;
  scene.add(mesh);
  return mesh;
}

// ============================================================
//  MAIN SCENE SETUP
// ============================================================

export function startOcean(canvas) {
  if (instances.has(canvas)) return;

  const { w, h } = getSize(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x012040);
  renderer.shadowMap.enabled = true;

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x013050, 0.35);

  // Camera
  const camera = new T.PerspectiveCamera(55, w / h, 0.01, 50);
  camera.position.set(0, 0.6, 2.2);
  camera.lookAt(0, 0.3, 0);

  // Lighting
  const ambient = new T.AmbientLight(0x205080, 0.6);
  scene.add(ambient);

  const sunLight = new T.DirectionalLight(0xaaeeff, 1.2);
  sunLight.position.set(1, 3, 1);
  sunLight.castShadow = true;
  scene.add(sunLight);

  const pointLight1 = new T.PointLight(0x00aaff, 0.6, 4);
  pointLight1.position.set(-1, 1.2, 0);
  scene.add(pointLight1);

  const pointLight2 = new T.PointLight(0x00ffaa, 0.4, 3);
  pointLight2.position.set(1, 0.5, -1);
  scene.add(pointLight2);

  // Sea floor
  const sandTex = makeSandTexture();
  const floorGeo = new T.PlaneGeometry(6, 6, 32, 32);
  // Gentle undulation
  const floorPos = floorGeo.attributes.position;
  for (let i = 0; i < floorPos.count; i++) {
    const x = floorPos.getX(i), y = floorPos.getY(i);
    floorPos.setZ(i, Math.sin(x * 2) * 0.05 + Math.cos(y * 3) * 0.04 + Math.random() * 0.02);
  }
  floorGeo.computeVertexNormals();
  const floorMat = new T.MeshPhongMaterial({ map: sandTex, shininess: 5 });
  const floor = new T.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  scene.add(floor);

  // Water surface
  const waterSurface = makeWaterSurface(scene);

  // Background water plane
  const waterTex = makeWaterTexture();
  const bgGeo = new T.PlaneGeometry(6, 3);
  const bgMat = new T.MeshBasicMaterial({ map: waterTex, transparent: true, opacity: 0.5 });
  const bgPlane = new T.Mesh(bgGeo, bgMat);
  bgPlane.position.set(0, 0.8, -2.5);
  scene.add(bgPlane);

  // Corals
  const coralColors = ['#ff4060', '#ff6040', '#ff8844', '#ff44aa', '#ee5588', '#cc3366'];
  for (let i = 0; i < 6; i++) {
    const cx = (Math.random() - 0.5) * 3;
    const cz = -0.5 + (Math.random() - 0.5) * 2;
    makeBranchCoral(scene, cx, 0, cz, coralColors[i % coralColors.length], 0.7 + Math.random() * 0.5);
  }
  for (let i = 0; i < 4; i++) {
    const cx = (Math.random() - 0.5) * 3;
    const cz = -0.3 + (Math.random() - 0.5) * 2;
    makeFanCoral(scene, cx, 0, cz, `hsl(${Math.random() * 60 + 320}, 70%, 50%)`, 0.6 + Math.random() * 0.5);
  }
  for (let i = 0; i < 5; i++) {
    const cx = (Math.random() - 0.5) * 3;
    const cz = -0.2 + (Math.random() - 0.5) * 2;
    makeTubeCoral(scene, cx, 0, cz, `hsl(${Math.random() * 40 + 10}, 80%, 55%)`, 0.6 + Math.random() * 0.4);
  }

  // Rocks
  for (let i = 0; i < 4; i++) {
    makeRockFormation(scene, (Math.random() - 0.5) * 3.5, 0, (Math.random() - 0.5) * 2.5, 0.8 + Math.random() * 0.6);
  }

  // Seaweed
  const seaweeds = [];
  for (let i = 0; i < 12; i++) {
    const sw = makeSeaweed(scene, (Math.random() - 0.5) * 3.5, 0, (Math.random() - 0.5) * 2.5, 0.8 + Math.random() * 0.4);
    seaweeds.push(sw);
  }

  // Fish
  const fishColors = ['#ff6644', '#44aaff', '#ffcc00', '#ff44aa', '#44ffaa', '#8844ff', '#ff8800'];
  const fishes = [];
  for (let i = 0; i < 12; i++) {
    const fish = makeFish(scene, fishColors[i % fishColors.length], 0.7 + Math.random() * 0.6);
    fishes.push(fish);
  }

  // Bubbles
  const bubbles = makeBubbles(scene, 40);

  // Light rays
  const rays = makeLightRays(scene);

  // Particles
  const particles = makeParticles(scene, 250);

  // ── Animation ──────────────────────────────────────────────
  let paused = false;
  let time = 0;
  const clock = new T.Clock();

  function animate() {
    const st = instances.get(canvas);
    if (!st) return;
    st.rafId = requestAnimationFrame(animate);
    if (paused) return;

    // Use real elapsed delta so speed is frame-rate independent and not too fast
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05); // cap at 50 ms to avoid jumps after tab focus
    time += dt;

    // Camera gentle sway
    camera.position.x = Math.sin(time * 0.15) * 0.3;
    camera.position.y = 0.6 + Math.sin(time * 0.2) * 0.08;
    camera.lookAt(0, 0.3 + Math.sin(time * 0.1) * 0.05, -0.5);

    // Water surface animation
    if (waterSurface) {
      const wsPos = waterSurface.geometry.attributes.position;
      for (let i = 0; i < wsPos.count; i++) {
        const x = wsPos.getX(i), y = wsPos.getY(i);
        wsPos.setZ(i, Math.sin(x * 3 + time * 1.5) * 0.03 + Math.cos(y * 2 + time * 1.2) * 0.02);
      }
      wsPos.needsUpdate = true;
    }

    // Background water texture scroll
    waterTex.offset.x = time * 0.01;
    waterTex.offset.y = Math.sin(time * 0.1) * 0.02;

    // Fish swimming
    fishes.forEach(f => {
      const ud = f.userData;
      ud.swimAngle += ud.speed * dt;
      ud.wobble    += 3.0 * dt;
      f.position.x = ud.centerX + Math.cos(ud.swimAngle) * ud.swimRadius;
      f.position.z = ud.centerZ + Math.sin(ud.swimAngle) * ud.swimRadius;
      f.position.y = ud.swimY + Math.sin(ud.wobble) * 0.03;
      // Velocity direction: derivative of position w.r.t. swimAngle
      // dx/dθ = -sin(θ)*R,  dz/dθ = cos(θ)*R  → heading angle in XZ plane
      const heading = Math.atan2(Math.cos(ud.swimAngle), -Math.sin(ud.swimAngle));
      f.rotation.y = heading;
      // Body wobble
      f.rotation.z = Math.sin(ud.wobble * 2) * 0.08;
    });

    // Bubbles rising
    bubbles.forEach(b => {
      b.position.y += b.userData.speed * dt;
      b.userData.wobble += 2.0 * dt;
      b.position.x += Math.sin(b.userData.wobble) * 0.002;
      if (b.position.y > 2) {
        b.position.y = -0.1;
        b.position.x = (Math.random() - 0.5) * 3;
        b.position.z = (Math.random() - 0.5) * 3;
      }
    });

    // Light rays shimmer
    rays.forEach(r => {
      r.userData.phase += 0.6 * dt;
      r.material.opacity = r.userData.baseOpacity * (0.5 + Math.sin(r.userData.phase) * 0.5);
    });

    // Seaweed sway
    seaweeds.forEach(sw => {
      if (!sw.geometry || !sw.userData.originalPositions) return;
      const orig = sw.userData.originalPositions;
      const pos = sw.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const oy = orig[i * 3 + 1];
        const sway = Math.sin(time * 1.5 + sw.userData.swayOffset + oy * 3) * 0.02 * (oy + 0.1);
        pos.setX(i, orig[i * 3] + sway);
        pos.setZ(i, orig[i * 3 + 2] + sway * 0.5);
      }
      pos.needsUpdate = true;
    });

    // Particles drift
    if (particles) {
      const ppos = particles.geometry.attributes.position;
      for (let i = 0; i < ppos.count; i++) {
        let y = ppos.getY(i) + 0.06 * dt;
        let x = ppos.getX(i) + Math.sin(time + i) * 0.03 * dt;
        if (y > 2) { y = -0.1; x = (Math.random() - 0.5) * 4; }
        ppos.setX(i, x);
        ppos.setY(i, y);
      }
      ppos.needsUpdate = true;
    }

    // Animate point lights
    pointLight1.position.x = Math.sin(time * 0.3) * 1.5;
    pointLight2.position.z = Math.cos(time * 0.25) * 1.5;

    renderer.render(scene, camera);
  }

  const rafId = requestAnimationFrame(animate);

  instances.set(canvas, { renderer, scene, camera, paused, rafId });
}

export function stopOcean(canvas) {
  const st = instances.get(canvas);
  if (!st) return;
  cancelAnimationFrame(st.rafId);
  st.renderer.dispose();
  instances.delete(canvas);
}

export function oceanPause(canvas) {
  const st = instances.get(canvas);
  if (!st) return false;
  st.paused = !st.paused;
  return st.paused;
}

export function oceanReset(canvas) {
  stopOcean(canvas);
  startOcean(canvas);
}
