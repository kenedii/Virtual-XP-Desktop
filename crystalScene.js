import * as T from 'three';

// ============================================================
//  CRYSTAL SCENE  —  Infinite Fractal Tesseract Crystal Space
//  360° immersive, self-similar crystal forests in every dir,
//  hypercube wireframes, custom GLSL shaders, depth fog layers
// ============================================================

const instances = new Map();

// ============================================================
//  CUSTOM SHADERS
// ============================================================

// Holographic crystal shader — iridescent, refractive look
const crystalVert = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  varying float vDepth;
  uniform float uTime;
  uniform float uPhase;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal   = normalize(mat3(normalMatrix) * normal);
    vec4 mv   = modelViewMatrix * vec4(position, 1.0);
    vViewDir  = normalize(-mv.xyz);
    vDepth    = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const crystalFrag = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  varying float vDepth;
  uniform float uTime;
  uniform float uPhase;
  uniform vec3  uBaseColor;
  uniform vec3  uEmissive;
  uniform float uOpacity;
  uniform float uIridescentStrength;

  // Cheap iridescence from view-angle
  vec3 iridescence(vec3 n, vec3 v, float strength) {
    float d = dot(n, v);
    float rim = 1.0 - clamp(d, 0.0, 1.0);
    float phase = rim * 6.0 + uTime * 0.4 + uPhase;
    vec3 iri;
    iri.r = 0.5 + 0.5 * sin(phase + 0.0);
    iri.g = 0.5 + 0.5 * sin(phase + 2.094);
    iri.b = 0.5 + 0.5 * sin(phase + 4.189);
    return mix(vec3(0.0), iri, strength * rim);
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);

    // Fresnel rim
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.5);

    // Internal scatter bands
    float bands = sin(vWorldPos.y * 14.0 + uTime * 0.7 + uPhase) * 0.5 + 0.5;
    bands *= sin(vWorldPos.x * 9.0 + uPhase * 1.7) * 0.5 + 0.5;

    vec3 col = uBaseColor;
    col += uEmissive * (0.4 + 0.6 * bands);
    col += iridescence(n, v, uIridescentStrength);
    col += vec3(0.3, 0.6, 1.0) * fresnel * 1.8;

    // Depth fade for atmosphere
    float fogFactor = 1.0 - exp(-vDepth * 0.018);
    vec3 fogColor   = vec3(0.0, 0.01, 0.04);
    col = mix(col, fogColor, fogFactor);

    float alpha = clamp(uOpacity + fresnel * 0.4, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Tesseract edge shader — neon hyperspace lines
const tessVert = /* glsl */`
  varying float vAlongEdge;
  uniform float uTime;
  uniform float uScale;
  attribute float aEdgeT;

  void main() {
    vAlongEdge = aEdgeT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const tessFrag = /* glsl */`
  varying float vAlongEdge;
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uPulse;

  void main() {
    float march = fract(vAlongEdge * 3.0 - uTime * uPulse);
    float glow  = exp(-march * march * 18.0) + exp(-(1.0-march)*(1.0-march) * 18.0);
    float base  = 0.18 + 0.12 * sin(vAlongEdge * 12.0 + uTime * 1.5);
    float alpha = clamp(base + glow * 0.85, 0.0, 1.0);
    gl_FragColor = vec4(uColor * (1.0 + glow * 2.5), alpha);
  }
`;

// Void background — animated deep-space with nebula
const bgVert = /* glsl */`
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * mat4(mat3(modelViewMatrix)) * vec4(position, 1.0);
  }
`;

const bgFrag = /* glsl */`
  varying vec3 vDir;
  uniform float uTime;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float stars(vec3 dir, float scale) {
    vec3 cell = floor(dir * scale);
    vec3 frac = fract(dir * scale) - 0.5;
    float d = length(frac);
    float h = hash(cell);
    float size = 0.04 + h * 0.04;
    return smoothstep(size, 0.0, d) * (0.3 + h * 0.7);
  }

  float fbm(vec3 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * (sin(p.x) * cos(p.y) + sin(p.y) * cos(p.z) + sin(p.z) * cos(p.x)) * 0.5 + 0.5;
      p = p * 2.02 + vec3(uTime * 0.008, uTime * 0.006, 0.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vDir);
    vec3 col = vec3(0.0, 0.003, 0.012);

    col += vec3(0.8, 0.9, 1.0) * stars(dir, 90.0) * 0.9;
    col += vec3(0.6, 0.7, 1.0) * stars(dir, 200.0) * 0.4;
    col += vec3(0.9, 0.8, 1.0) * stars(dir, 350.0) * 0.25;

    float neb  = fbm(dir * 2.0 + vec3(uTime * 0.005));
    float neb2 = fbm(dir * 3.5 - vec3(uTime * 0.003, 0.0, uTime * 0.004));
    col += vec3(0.0, 0.04, 0.18) * pow(neb, 2.5) * 1.8;
    col += vec3(0.05, 0.0, 0.15) * pow(neb2, 3.0) * 1.2;

    float haze = smoothstep(0.55, 0.85, abs(dir.y));
    col += vec3(0.02, 0.05, 0.2) * (1.0 - haze) * 0.3;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function getSize(canvas) {
  const r = canvas.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { w: r.width, h: r.height } : { w: 800, h: 560 };
}

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

// ============================================================
//  GEOMETRY HELPERS
// ============================================================

// Crystal shard — elongated bipyramid with two rings and noise distortion
function makeCrystalGeo(rng, baseR, height, sides) {
  sides = sides || (Math.floor(rng() * 3) + 4);
  const verts = [];
  const indices = [];

  verts.push(0, height, 0); // tip (top) index 0

  // Midsection ring (wider, at ~35% height)
  const midY = height * 0.35;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const r = baseR * (1 + (rng() - 0.5) * 0.4);
    verts.push(Math.cos(a) * r, midY + (rng() - 0.5) * height * 0.12, Math.sin(a) * r);
  }

  // Narrower base ring
  const baseY = -height * 0.08;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 + 0.15;
    const r = baseR * (0.45 + rng() * 0.25);
    verts.push(Math.cos(a) * r, baseY + (rng() - 0.5) * height * 0.06, Math.sin(a) * r);
  }

  verts.push(0, -height * 0.28, 0); // bottom tip

  // Top cone faces
  for (let i = 0; i < sides; i++) {
    indices.push(0, 1 + (i + 1) % sides, 1 + i);
  }
  // Mid→base ring quad faces
  for (let i = 0; i < sides; i++) {
    const a = 1 + i, b = 1 + (i + 1) % sides;
    const c = 1 + sides + i, d = 1 + sides + (i + 1) % sides;
    indices.push(a, d, b);
    indices.push(a, c, d);
  }
  // Bottom cone faces
  const btip = 1 + sides * 2;
  for (let i = 0; i < sides; i++) {
    indices.push(btip, 1 + sides + i, 1 + sides + (i + 1) % sides);
  }

  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(new Float32Array(verts), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ShaderMaterial for each crystal
function makeCrystalMat(rng, hueRange) {
  const hue = hueRange[0] + rng() * (hueRange[1] - hueRange[0]);
  const base = new T.Color().setHSL(hue / 360, 0.6 + rng() * 0.4, 0.08 + rng() * 0.18);
  const emissive = new T.Color().setHSL(((hue + (rng() - 0.5) * 40) % 360) / 360, 1.0, 0.3 + rng() * 0.3);
  return new T.ShaderMaterial({
    vertexShader:   crystalVert,
    fragmentShader: crystalFrag,
    uniforms: {
      uTime:               { value: 0 },
      uPhase:              { value: rng() * Math.PI * 2 },
      uBaseColor:          { value: base },
      uEmissive:           { value: emissive },
      uOpacity:            { value: 0.55 + rng() * 0.35 },
      uIridescentStrength: { value: 0.5 + rng() * 0.5 },
    },
    transparent: true,
    side: T.DoubleSide,
    depthWrite: false,
  });
}

// ============================================================
//  FRACTAL CRYSTAL TREE — recursive self-similar branching
// ============================================================
function buildFractalTree(scene, rng, hueRange, rootX, rootY, rootZ, dirX, dirY, dirZ, length, depth, maxDepth) {
  if (depth > maxDepth || length < 0.04) return;

  const sides  = Math.floor(rng() * 3) + 4;
  const baseR  = length * (0.055 + rng() * 0.055);
  const geo    = makeCrystalGeo(rng, baseR, length, sides);
  const mat    = makeCrystalMat(rng, hueRange);
  const mesh   = new T.Mesh(geo, mat);

  const dir = new T.Vector3(dirX, dirY, dirZ).normalize();
  const q   = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
  mesh.setRotationFromQuaternion(q);
  mesh.position.set(
    rootX + dir.x * length * 0.35,
    rootY + dir.y * length * 0.35,
    rootZ + dir.z * length * 0.35,
  );
  mesh.userData.isCrystal = true;
  scene.add(mesh);

  const tipX = rootX + dir.x * length * 0.72;
  const tipY = rootY + dir.y * length * 0.72;
  const tipZ = rootZ + dir.z * length * 0.72;

  const branches   = depth === 0 ? (3 + Math.floor(rng() * 2)) : (2 + Math.floor(rng() * 2));
  const branchLen  = length * (0.52 + rng() * 0.18);
  const spreadAngle = 0.45 + rng() * 0.55;

  for (let b = 0; b < branches; b++) {
    const phi   = (b / branches) * Math.PI * 2 + rng() * 0.8;
    const theta = spreadAngle + (rng() - 0.5) * 0.3;
    const perpBase = (dir.y === 0 && dir.z === 0)
      ? new T.Vector3(0, 1, 0)
      : new T.Vector3(1, 0, 0);
    const right = new T.Vector3().crossVectors(dir, perpBase).normalize();
    const up2   = new T.Vector3().crossVectors(right, dir).normalize();

    const nx = dir.x * Math.cos(theta) + (right.x * Math.cos(phi) + up2.x * Math.sin(phi)) * Math.sin(theta);
    const ny = dir.y * Math.cos(theta) + (right.y * Math.cos(phi) + up2.y * Math.sin(phi)) * Math.sin(theta);
    const nz = dir.z * Math.cos(theta) + (right.z * Math.cos(phi) + up2.z * Math.sin(phi)) * Math.sin(theta);

    buildFractalTree(scene, rng, hueRange, tipX, tipY, tipZ, nx, ny, nz, branchLen, depth + 1, maxDepth);
  }
}

// ============================================================
//  TESSERACT (4D HYPERCUBE) WIREFRAME
// ============================================================
function buildTesseractWireframe(color, scale) {
  const verts4D = [];
  for (let i = 0; i < 16; i++) {
    verts4D.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1,
    ]);
  }

  const edgePairs = [];
  for (let a = 0; a < 16; a++) {
    for (let b = a + 1; b < 16; b++) {
      const diff = a ^ b;
      if (diff && (diff & (diff - 1)) === 0) edgePairs.push([a, b]);
    }
  }

  const SEGS = 20;
  const positions = [];
  const edgeTs    = [];

  edgePairs.forEach(() => {
    for (let s = 0; s <= SEGS; s++) {
      positions.push(0, 0, 0);
      edgeTs.push(s / SEGS);
    }
  });

  const geo    = new T.BufferGeometry();
  const posBuf = new T.BufferAttribute(new Float32Array(positions), 3);
  posBuf.setUsage(T.DynamicDrawUsage);
  geo.setAttribute('position', posBuf);
  geo.setAttribute('aEdgeT',   new T.BufferAttribute(new Float32Array(edgeTs), 1));

  const lineIdx = [];
  edgePairs.forEach((_, e) => {
    const base = e * (SEGS + 1);
    for (let s = 0; s < SEGS; s++) lineIdx.push(base + s, base + s + 1);
  });
  geo.setIndex(lineIdx);

  const mat = new T.ShaderMaterial({
    vertexShader:   tessVert,
    fragmentShader: tessFrag,
    uniforms: {
      uTime:  { value: 0 },
      uColor: { value: new T.Color(color) },
      uPulse: { value: 0.8 + Math.random() * 0.6 },
      uScale: { value: scale },
    },
    transparent: true,
    blending:    T.AdditiveBlending,
    depthWrite:  false,
  });

  const lines         = new T.LineSegments(geo, mat);
  lines.userData.verts4D   = verts4D;
  lines.userData.edgePairs = edgePairs;
  lines.userData.SEGS      = SEGS;
  lines.userData.scale     = scale;
  lines.userData.posBuf    = posBuf;
  lines.userData.rot4D     = { xy: Math.random() * Math.PI * 2, xw: Math.random() * Math.PI * 2, yw: Math.random() * Math.PI * 2, zw: Math.random() * Math.PI * 2 };
  lines.userData.rotSpeed  = { xy: (Math.random() - 0.5) * 0.006, xw: (Math.random() - 0.5) * 0.009, yw: (Math.random() - 0.5) * 0.007, zw: (Math.random() - 0.5) * 0.008 };
  return lines;
}

function project4Dto3D(v4, wDist) {
  const w = wDist / (wDist - v4[3]);
  return [v4[0] * w, v4[1] * w, v4[2] * w];
}

function rotate4D(v, plane, angle) {
  const c = Math.cos(angle), s = Math.sin(angle), r = [...v];
  if (plane === 'xy') { r[0] = v[0]*c - v[1]*s; r[1] = v[0]*s + v[1]*c; }
  if (plane === 'xw') { r[0] = v[0]*c - v[3]*s; r[3] = v[0]*s + v[3]*c; }
  if (plane === 'yw') { r[1] = v[1]*c - v[3]*s; r[3] = v[1]*s + v[3]*c; }
  if (plane === 'zw') { r[2] = v[2]*c - v[3]*s; r[3] = v[2]*s + v[3]*c; }
  return r;
}

function updateTesseract(lines) {
  const ud = lines.userData;
  ud.rot4D.xy += ud.rotSpeed.xy;
  ud.rot4D.xw += ud.rotSpeed.xw;
  ud.rot4D.yw += ud.rotSpeed.yw;
  ud.rot4D.zw += ud.rotSpeed.zw;

  const projected = ud.verts4D.map(v => {
    let r = rotate4D(v, 'xy', ud.rot4D.xy);
    r = rotate4D(r, 'xw', ud.rot4D.xw);
    r = rotate4D(r, 'yw', ud.rot4D.yw);
    r = rotate4D(r, 'zw', ud.rot4D.zw);
    return project4Dto3D(r, 2.0);
  });

  const buf  = ud.posBuf;
  const SEGS = ud.SEGS;
  const sc   = ud.scale;
  ud.edgePairs.forEach(([a, b], e) => {
    const va = projected[a], vb = projected[b];
    const base = e * (SEGS + 1);
    for (let s = 0; s <= SEGS; s++) {
      const t = s / SEGS;
      buf.setXYZ(base + s,
        (va[0] + (vb[0] - va[0]) * t) * sc,
        (va[1] + (vb[1] - va[1]) * t) * sc,
        (va[2] + (vb[2] - va[2]) * t) * sc,
      );
    }
  });
  buf.needsUpdate = true;
}

// ============================================================
//  VOLUMETRIC LIGHT BEAM
// ============================================================
function makeLightBeam(rng, x, z, color) {
  const h   = 6 + rng() * 8;
  const r   = 0.04 + rng() * 0.08;
  const geo = new T.CylinderGeometry(r * 0.1, r, h, 8, 1, true);
  const mat = new T.MeshBasicMaterial({
    color: new T.Color(color),
    transparent: true,
    opacity: 0.06 + rng() * 0.06,
    side: T.DoubleSide,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });
  const beam = new T.Mesh(geo, mat);
  beam.position.set(x, h * 0.5 - 0.5, z);
  return beam;
}

// ============================================================
//  FLOOR — crystalline reflective ground
// ============================================================
function makeCrystalFloor(rng) {
  const geo = new T.PlaneGeometry(200, 200, 80, 80);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i,
      Math.sin(x * 0.6) * Math.cos(z * 0.55) * 0.12 +
      Math.sin(x * 1.3 + 0.9) * Math.sin(z * 1.1) * 0.06 +
      (rng() - 0.5) * 0.04
    );
  }
  geo.computeVertexNormals();
  const mat = new T.MeshPhongMaterial({
    color:    new T.Color(0x010815),
    emissive: new T.Color(0x020c2a),
    emissiveIntensity: 0.7,
    shininess: 200,
    specular:  new T.Color(0x3366ff),
    transparent: true,
    opacity: 0.85,
  });
  const mesh = new T.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.35;
  mesh.receiveShadow = true;
  return mesh;
}

// ============================================================
//  CEILING — stalactite crystalline ceiling
// ============================================================
function makeCrystalCeiling(rng) {
  const geo = new T.PlaneGeometry(200, 200, 60, 60);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i,
      Math.sin(x * 0.5 + 0.3) * Math.cos(z * 0.45) * 0.35 +
      Math.sin(x * 1.1 + 1.5) * Math.sin(z * 0.9) * 0.18 +
      (rng() - 0.5) * 0.1
    );
  }
  geo.computeVertexNormals();
  const mat = new T.MeshPhongMaterial({
    color:    new T.Color(0x010510),
    emissive: new T.Color(0x050330),
    emissiveIntensity: 0.5,
    shininess: 80,
    specular:  new T.Color(0x6633aa),
    side: T.DoubleSide,
  });
  const mesh = new T.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = 12;
  return mesh;
}

// ============================================================
//  PARTICLE NEBULA LAYER
// ============================================================
function makeNebula(rng, count, spread, yRange, colorHex, size) {
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const baseColor = new T.Color(colorHex);
  for (let i = 0; i < count; i++) {
    const theta = rng() * Math.PI * 2;
    const phi   = Math.acos(2 * rng() - 1);
    const r     = spread * (0.2 + Math.pow(rng(), 0.5) * 0.8);
    positions[i * 3]     = Math.sin(phi) * Math.cos(theta) * r;
    positions[i * 3 + 1] = (rng() - 0.5) * yRange;
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    const bright = 0.4 + rng() * 0.6;
    colors[i * 3]     = baseColor.r * bright;
    colors[i * 3 + 1] = baseColor.g * bright;
    colors[i * 3 + 2] = baseColor.b * bright;
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new T.BufferAttribute(colors, 3));
  const mat = new T.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });
  const pts = new T.Points(geo, mat);
  pts.userData.spinSpeed = (rng() - 0.5) * 0.00012;
  return pts;
}

// ============================================================
//  MAIN START FUNCTION
// ============================================================
// ============================================================
//  MAIN START FUNCTION
// ============================================================
export function startCrystal(canvas) {
  if (instances.has(canvas)) return;

  const { w, h } = getSize(canvas);
  const rng = makeRng(0xC2B57A1E);

  // ---- Renderer ----
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  renderer.shadowMap.enabled   = true;
  renderer.shadowMap.type      = T.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping         = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.9;

  // ---- Scene ----
  const scene = new T.Scene();

  // ---- Skybox (background sphere with shader) ----
  const bgGeo = new T.SphereGeometry(300, 32, 16);
  const bgMat = new T.ShaderMaterial({
    vertexShader:   bgVert,
    fragmentShader: bgFrag,
    uniforms: { uTime: { value: 0 } },
    side: T.BackSide,
    depthWrite: false,
  });
  scene.add(new T.Mesh(bgGeo, bgMat));

  // ---- Camera ----
  const camera = new T.PerspectiveCamera(72, w / h, 0.05, 500);
  camera.position.set(0, 2.0, 0);

  // ---- Lights ----
  scene.add(new T.AmbientLight(0x0a1535, 1.4));
  scene.add(new T.HemisphereLight(0x0044cc, 0x000520, 0.8));

  const keyLight = new T.DirectionalLight(0x2255ff, 2.2);
  keyLight.position.set(-8, 14, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near   = 0.5;
  keyLight.shadow.camera.far    = 80;
  keyLight.shadow.camera.left   = -40;
  keyLight.shadow.camera.right  = 40;
  keyLight.shadow.camera.top    = 30;
  keyLight.shadow.camera.bottom = -30;
  scene.add(keyLight);

  const fillLight = new T.DirectionalLight(0x6600cc, 0.9);
  fillLight.position.set(10, 5, -8);
  scene.add(fillLight);

  const rimLight = new T.PointLight(0x00ddff, 3.5, 25, 1.8);
  rimLight.position.set(0, 1, 0);
  scene.add(rimLight);

  // 16 orbiting point lights — full 360° at all elevations
  const glowColors = [0x0033ff, 0x2200cc, 0x0066ff, 0x4400ff, 0x0099ff, 0x00ffcc, 0xff00aa, 0x6600ff];
  const glowLights = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const dist  = 8 + rng() * 22;
    const elev  = (rng() - 0.3) * 10;
    const pl = new T.PointLight(
      glowColors[i % glowColors.length],
      1.6 + rng() * 2.4,
      12 + rng() * 18, 2
    );
    pl.position.set(Math.cos(angle) * dist, elev, Math.sin(angle) * dist);
    pl.userData.baseIntensity = pl.intensity;
    pl.userData.flickerPhase  = rng() * Math.PI * 2;
    pl.userData.flickerSpeed  = 0.4 + rng() * 1.8;
    pl.userData.orbitSpeed    = (rng() - 0.5) * 0.004;
    pl.userData.orbitAngle    = angle;
    pl.userData.orbitDist     = dist;
    pl.userData.orbitElev     = elev;
    scene.add(pl);
    glowLights.push(pl);
  }

  // ---- Floor & Ceiling ----
  scene.add(makeCrystalFloor(makeRng(0xABCD1234)));
  scene.add(makeCrystalCeiling(makeRng(0x87654321)));

  // ---- FRACTAL CRYSTAL TREES — complete 360° surround ----
  const blueViolet = [200, 280];
  const cyanTeal   = [170, 220];
  const pinkPurple = [280, 330];
  const coldWhite  = [200, 230];

  // Hero cluster — upward from center
  buildFractalTree(scene, makeRng(0x11111111), blueViolet,   0, -0.35, 0,  0.00, 1, 0.00, 3.2, 0, 5);
  buildFractalTree(scene, makeRng(0x22222222), cyanTeal,     0, -0.35, 0,  0.10, 1, -0.05, 2.6, 0, 5);
  buildFractalTree(scene, makeRng(0x33333333), pinkPurple,   0, -0.35, 0, -0.08, 1, 0.10, 2.9, 0, 4);

  // Inner ring — 8 floor trees + 8 ceiling stalactites
  for (let i = 0; i < 8; i++) {
    const a    = (i / 8) * Math.PI * 2;
    const r    = 4.5 + makeRng(i * 0xFACE + 1)() * 1.5;
    const rngT = makeRng(0x1000 + i * 97);
    const pal  = [blueViolet, cyanTeal, pinkPurple, coldWhite][i % 4];
    const lx   = Math.cos(a) * 0.15, lz = Math.sin(a) * 0.15;
    buildFractalTree(scene, rngT, pal,
      Math.cos(a) * r, -0.35, Math.sin(a) * r,
      lx, 1, lz, 2.0 + rngT() * 1.2, 0, 4);
    buildFractalTree(scene, makeRng(0x2000 + i * 97), pal,
      Math.cos(a) * r * 0.9, 11.5, Math.sin(a) * r * 0.9,
      lx * 0.5, -1, lz * 0.5, 1.8 + rngT() * 1.0, 0, 3);
  }

  // Mid ring — 14 floor + ceiling trees
  for (let i = 0; i < 14; i++) {
    const a    = (i / 14) * Math.PI * 2 + 0.22;
    const r    = 11 + makeRng(i * 0xBEEF + 7)() * 3;
    const rngT = makeRng(0x3000 + i * 113);
    const pal  = [blueViolet, cyanTeal, pinkPurple, coldWhite][i % 4];
    const lx   = Math.cos(a) * 0.2, lz = Math.sin(a) * 0.2;
    buildFractalTree(scene, rngT, pal,
      Math.cos(a) * r, -0.35, Math.sin(a) * r,
      lx, 1, lz, 3.5 + rngT() * 2.5, 0, 4);
    buildFractalTree(scene, makeRng(0x4000 + i * 113), pal,
      Math.cos(a) * r * 0.88, 11.2, Math.sin(a) * r * 0.88,
      lx * 0.3, -1, lz * 0.3, 2.5 + rngT() * 1.5, 0, 3);
  }

  // Outer ring — 18 giant background trees
  for (let i = 0; i < 18; i++) {
    const a    = (i / 18) * Math.PI * 2 + 0.5;
    const r    = 22 + makeRng(i * 0xCAFE + 3)() * 6;
    const rngT = makeRng(0x5000 + i * 151);
    const pal  = [blueViolet, cyanTeal, pinkPurple, coldWhite][i % 4];
    buildFractalTree(scene, rngT, pal,
      Math.cos(a) * r, -0.35, Math.sin(a) * r,
      Math.cos(a) * 0.1, 1, Math.sin(a) * 0.1,
      6 + rngT() * 5, 0, 3);
  }

  // Ground-level horizontal radiating crystals
  for (let i = 0; i < 24; i++) {
    const a    = (i / 24) * Math.PI * 2;
    const r    = 2 + rng() * 6;
    const rngT = makeRng(0x6000 + i * 77);
    buildFractalTree(scene, rngT, blueViolet,
      Math.cos(a) * r, 0, Math.sin(a) * r,
      Math.cos(a) * 0.8, 0.3, Math.sin(a) * 0.8,
      0.8 + rngT() * 0.8, 0, 3);
  }

  // Wall crystals — project inward from sides at mid-height
  for (let i = 0; i < 12; i++) {
    const a    = (i / 12) * Math.PI * 2;
    const r    = 18 + rng() * 4;
    const elev = 2 + rng() * 6;
    const rngT = makeRng(0x7000 + i * 89);
    buildFractalTree(scene, rngT, pinkPurple,
      Math.cos(a) * r, elev, Math.sin(a) * r,
      -Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9,
      2.5 + rngT() * 2, 0, 3);
  }

  // ---- TESSERACT WIREFRAMES ----
  const tesseracts = [];

  // Central large tesseract
  const tcCentral = buildTesseractWireframe(0x00aaff, 2.5);
  tcCentral.position.set(0, 2.0, 0);
  scene.add(tcCentral);
  tesseracts.push(tcCentral);

  // Orbiting tesseracts — various sizes, distances, heights
  [
    { color: 0x00ffcc, scale: 1.2, x:  6, y: 1.0, z:  4 },
    { color: 0xaa00ff, scale: 1.5, x: -7, y: 3.5, z: -3 },
    { color: 0xff0077, scale: 0.8, x:  4, y: 5.0, z: -6 },
    { color: 0x0044ff, scale: 1.8, x: -5, y: 0.5, z:  7 },
    { color: 0x00ffff, scale: 1.0, x:  9, y: 7.0, z:  2 },
    { color: 0x7700ff, scale: 2.2, x: -9, y: 2.0, z: -8 },
    { color: 0xff44aa, scale: 0.6, x:  2, y: 9.0, z:  5 },
    { color: 0x00ccff, scale: 1.3, x: -3, y: 8.0, z: -2 },
  ].forEach(td => {
    const tc = buildTesseractWireframe(td.color, td.scale);
    tc.position.set(td.x, td.y, td.z);
    tc.userData.orbitRadius = Math.sqrt(td.x * td.x + td.z * td.z);
    tc.userData.orbitAngle  = Math.atan2(td.z, td.x);
    tc.userData.orbitSpeed  = (Math.random() - 0.5) * 0.005;
    tc.userData.bobSpeed    = 0.3 + Math.random() * 0.5;
    tc.userData.bobAmp      = 0.3 + Math.random() * 0.5;
    tc.userData.baseY       = td.y;
    scene.add(tc);
    tesseracts.push(tc);
  });

  // ---- LIGHT BEAMS — scattered vertically through scene ----
  const beamColors = [0x0044ff, 0x00ccff, 0xaa00ff, 0x00ffcc, 0xff0077];
  const beams = [];
  for (let i = 0; i < 20; i++) {
    const angle = rng() * Math.PI * 2;
    const dist  = 2 + rng() * 20;
    const beam  = makeLightBeam(rng, Math.cos(angle) * dist, Math.sin(angle) * dist, beamColors[i % beamColors.length]);
    scene.add(beam);
    beams.push(beam);
  }

  // ---- NEBULA PARTICLE LAYERS ----
  const nebulae = [];
  nebulae.push(makeNebula(rng, 2000, 40, 16, 0x1133ff, 0.06));
  nebulae.push(makeNebula(rng, 1500, 30, 14, 0x0099ff, 0.04));
  nebulae.push(makeNebula(rng, 1200, 50, 20, 0x6600ff, 0.07));
  nebulae.push(makeNebula(rng,  800, 20, 10, 0x00ffcc, 0.05));
  nebulae.push(makeNebula(rng,  600, 15,  8, 0xff00aa, 0.06));
  nebulae.forEach(n => scene.add(n));

  // Fine crystal dust — close-up floating motes
  const dustCount = 1200;
  const dustGeo   = new T.BufferGeometry();
  const dustPos   = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3]     = (rng() - 0.5) * 12;
    dustPos[i * 3 + 1] = rng() * 8 - 0.5;
    dustPos[i * 3 + 2] = (rng() - 0.5) * 12;
  }
  dustGeo.setAttribute('position', new T.BufferAttribute(dustPos, 3));
  const dustMat = new T.PointsMaterial({
    color: 0x88ccff,
    size: 0.025,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new T.Points(dustGeo, dustMat);
  scene.add(dust);

  // ---- Collect crystal meshes for shader animation ----
  const crystalMeshes = [];
  scene.traverse(obj => {
    if (obj.isMesh && obj.userData.isCrystal) crystalMeshes.push(obj);
  });

  // ---- Resize handling ----
  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => {
        const s = getSize(canvas);
        renderer.setSize(s.w, s.h, false);
        camera.aspect = s.w / s.h;
        camera.updateProjectionMatrix();
      })
    : null;
  if (ro) ro.observe(canvas.parentElement || canvas);

  // ---- State ----
  const state = {
    renderer, scene, camera,
    glowLights, rimLight,
    tesseracts, nebulae, dust, dustGeo, dustCount, beams,
    crystalMeshes, bgMat,
    time: 0,
    camAngle: 0,
    camElevAngle: 0,
    paused: false,
    rafId: null,
    ro,
  };
  instances.set(canvas, state);

  // ---- Animation loop ----
  function animate() {
    state.rafId = requestAnimationFrame(animate);
    if (state.paused) return;

    const dt = 0.016;
    state.time      += dt;
    const t          = state.time;

    bgMat.uniforms.uTime.value = t;

    // ---- Camera — smooth 3D elliptical orbit with elevation drift ----
    state.camAngle     += 0.0012;
    state.camElevAngle += 0.00042;

    const mainR = 3.5 + Math.sin(t * 0.08) * 0.8;
    const camX  = Math.cos(state.camAngle) * mainR + Math.cos(state.camAngle * 3.1) * 0.5;
    const camZ  = Math.sin(state.camAngle) * mainR + Math.sin(state.camAngle * 2.7) * 0.5;
    const camY  = 2.0 + Math.sin(state.camElevAngle) * 1.6 + Math.sin(t * 0.11) * 0.4;

    camera.position.set(camX, camY, camZ);

    const lookR   = 0.6 + Math.sin(t * 0.05) * 0.4;
    const lookAng = -state.camAngle * 0.4 + Math.sin(t * 0.12) * 0.8;
    camera.lookAt(
      Math.cos(lookAng) * lookR,
      1.5 + Math.sin(t * 0.07) * 1.2,
      Math.sin(lookAng) * lookR,
    );

    // ---- Crystal shader uniforms ----
    crystalMeshes.forEach(mesh => {
      if (mesh.material && mesh.material.uniforms) {
        mesh.material.uniforms.uTime.value = t;
      }
    });

    // ---- Tesseract update ----
    tesseracts.forEach(tc => {
      updateTesseract(tc);
      tc.material.uniforms.uTime.value = t;
      if (tc.userData.orbitRadius !== undefined) {
        tc.userData.orbitAngle += tc.userData.orbitSpeed;
        const oa  = tc.userData.orbitAngle;
        const or  = tc.userData.orbitRadius;
        tc.position.set(
          Math.cos(oa) * or,
          tc.userData.baseY + Math.sin(t * tc.userData.bobSpeed) * tc.userData.bobAmp,
          Math.sin(oa) * or,
        );
      } else {
        tc.position.y = 2.0 + Math.sin(t * 0.4) * 0.3;
      }
    });

    // ---- Glow light orbit + flicker ----
    glowLights.forEach(pl => {
      pl.userData.orbitAngle += pl.userData.orbitSpeed;
      pl.position.x = Math.cos(pl.userData.orbitAngle) * pl.userData.orbitDist;
      pl.position.z = Math.sin(pl.userData.orbitAngle) * pl.userData.orbitDist;
      const flicker = 1
        + Math.sin(t * pl.userData.flickerSpeed + pl.userData.flickerPhase) * 0.25
        + Math.sin(t * pl.userData.flickerSpeed * 2.1 + 0.9) * 0.1;
      pl.intensity = pl.userData.baseIntensity * flicker;
    });

    // ---- Rim light follows camera ----
    rimLight.intensity = 3.0 + Math.sin(t * 0.9) * 0.8;
    rimLight.position.set(camX, camY - 0.5, camZ);

    // ---- Nebula drift ----
    nebulae.forEach(n => {
      n.rotation.y += n.userData.spinSpeed;
      n.position.y  = Math.sin(t * 0.04) * 0.3;
    });

    // ---- Dust upward drift ----
    const dustPosAttr = dustGeo.attributes.position;
    for (let i = 0; i < dustCount; i++) {
      let y = dustPosAttr.getY(i) + 0.002;
      if (y > 7.5) y = -0.5;
      dustPosAttr.setY(i, y);
    }
    dustPosAttr.needsUpdate = true;

    // ---- Beam pulse ----
    beams.forEach((beam, idx) => {
      beam.material.opacity = 0.04 + Math.abs(Math.sin(t * 0.6 + idx * 0.7)) * 0.07;
    });

    renderer.render(scene, camera);
  }
  animate();
  console.log('[ViewCrystal] Fractal Tesseract Scene started');
}

// ============================================================
//  CONTROLS
// ============================================================
export function stopCrystal(canvas) {
  const state = instances.get(canvas);
  if (!state) return;
  cancelAnimationFrame(state.rafId);
  if (state.ro) state.ro.disconnect();
  state.renderer.dispose();
  instances.delete(canvas);
}

export function crystalPause(canvas) {
  const state = instances.get(canvas);
  if (!state) return false;
  state.paused = !state.paused;
  return state.paused;
}

export function crystalReset(canvas) {
  const state = instances.get(canvas);
  if (!state) return;
  state.time         = 0;
  state.camAngle     = 0;
  state.camElevAngle = 0;
}
