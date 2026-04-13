/* ================================================================
   main.js — 3D Developer Portfolio
   Three.js r128 · GSAP 3 · ScrollTrigger
================================================================ */

'use strict';

// ── Guards ───────────────────────────────────────────────────────
const isMobile = window.innerWidth < 768;

// ── Project Data ─────────────────────────────────────────────────
const PROJECTS = [
  {
    title:  'E-Commerce Platform',
    tags:   ['React', 'Node.js', 'Stripe', 'MongoDB'],
    accent: 0x4d9fff,
    pos:    [-3.5,  1.2,  -5],
  },
  {
    title:  'AI Chat App',
    tags:   ['Next.js', 'OpenAI', 'WebSocket', 'Tailwind'],
    accent: 0xff6b9d,
    pos:    [ 3.5,  0.5, -12],
  },
  {
    title:  '3D Portfolio',
    tags:   ['Three.js', 'GSAP', 'WebGL', 'Vanilla JS'],
    accent: 0x00e5a0,
    pos:    [-2.5, -1.0, -19],
  },
  {
    title:  'SaaS Dashboard',
    tags:   ['Vue', 'D3.js', 'REST API', 'PostgreSQL'],
    accent: 0xffaa00,
    pos:    [ 4.0,  1.5, -26],
  },
  {
    title:  'Mobile Banking App',
    tags:   ['React Native', 'Firebase', 'Plaid API'],
    accent: 0xc084fc,
    pos:    [-3.0, -0.5, -33],
  },
  {
    title:  'Booking System',
    tags:   ['Next.js', 'Prisma', 'Stripe', 'Google Cal'],
    accent: 0xf87171,
    pos:    [ 2.5,  1.0, -40],
  },
];

// ── Accent colours as CSS hex strings (for panels) ───────────────
const ACCENT_CSS = ['#4d9fff','#ff6b9d','#00e5a0','#ffaa00','#c084fc','#f87171'];

// ─────────────────────────────────────────────────────────────────
//  STEP 1 — Scene, Renderer, Camera, Lights
// ─────────────────────────────────────────────────────────────────

const canvas   = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.outputEncoding     = THREE.sRGBEncoding;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

// Lights
const ambientLight = new THREE.AmbientLight(0x111133, 0.5);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x4466ff, 2, 80);
blueLight.position.set(5, 5, 5);
scene.add(blueLight);

const pinkLight = new THREE.PointLight(0xff3366, 1, 80);
pinkLight.position.set(-5, -3, 2);
scene.add(pinkLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
dirLight.position.set(0, 10, 5);
scene.add(dirLight);

// Resize handler
window.addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

// ─────────────────────────────────────────────────────────────────
//  STEP 2 — Star Field + Nebula
// ─────────────────────────────────────────────────────────────────

const starGroup = new THREE.Group();
scene.add(starGroup);

function makeStarLayer(count, size, spread) {
  const geo  = new THREE.BufferGeometry();
  const pos  = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * spread;
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.8 - 30;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color:       0xffffff,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity:     size < 0.04 ? 0.55 : 0.9,
  });
  return new THREE.Points(geo, mat);
}

const starCount = isMobile ? 800 : 3000;
starGroup.add(makeStarLayer(Math.floor(starCount * 0.7), 0.02, 200));
starGroup.add(makeStarLayer(Math.floor(starCount * 0.3), 0.05, 200));

// Nebula blobs — ShaderMaterial radial gradients
const NEBULAS = [
  { color: [0.35, 0.15, 0.75], pos: [ 8, 4, -25], scale: 18 },
  { color: [0.10, 0.30, 0.80], pos: [-10, -3, -35], scale: 22 },
  { color: [0.00, 0.55, 0.60], pos: [ 5, -6, -45], scale: 20 },
  { color: [0.50, 0.10, 0.60], pos: [-6,  7, -20], scale: 16 },
  { color: [0.10, 0.40, 0.70], pos: [ 2,  3, -55], scale: 24 },
];

const nebulaVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const nebulaFrag = `
  varying vec2 vUv;
  uniform vec3  uColor;
  uniform float uOpacity;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

NEBULAS.forEach(n => {
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader:   nebulaVert,
    fragmentShader: nebulaFrag,
    uniforms: {
      uColor:   { value: new THREE.Vector3(...n.color) },
      uOpacity: { value: 0.18 },
    },
    transparent:  true,
    blending:     THREE.AdditiveBlending,
    depthWrite:   false,
    side:         THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...n.pos);
  mesh.scale.setScalar(n.scale);
  scene.add(mesh);
});

// ─────────────────────────────────────────────────────────────────
//  STEP 3 & 4 — Project Cards (all 6)
// ─────────────────────────────────────────────────────────────────

// Helper: draw text card onto a canvas → CanvasTexture
function makeCardTexture(project, accentHex) {
  const W = 512, H = 320;
  const cv = document.createElement('canvas');
  cv.width  = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // Background
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  // Thumbnail area
  const thumbH = 130;
  ctx.fillStyle = accentHex + '22';
  ctx.fillRect(0, 0, W, thumbH);

  // Simple geometric icon
  ctx.strokeStyle = accentHex;
  ctx.lineWidth   = 2;
  ctx.fillStyle   = accentHex + '55';
  // Icon shape — stylised brackets
  const cx = W / 2, cy = thumbH / 2;
  ctx.beginPath();
  ctx.roundRect(cx - 36, cy - 24, 72, 48, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle   = accentHex;
  ctx.font        = 'bold 22px Inter, sans-serif';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</ >', cx, cy);

  // Divider
  ctx.strokeStyle = accentHex + '44';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(0, thumbH); ctx.lineTo(W, thumbH);
  ctx.stroke();

  // Title
  ctx.fillStyle    = '#ffffff';
  ctx.font         = 'bold 28px Inter, sans-serif';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(project.title, 20, thumbH + 16);

  // Tags
  let tx = 20, ty = thumbH + 62;
  ctx.font = '13px Inter, sans-serif';
  project.tags.forEach(tag => {
    const tw = ctx.measureText(tag).width + 20;
    // pill
    ctx.fillStyle   = accentHex + '33';
    ctx.strokeStyle = accentHex + '88';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, 24, 12);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ccddff';
    ctx.fillText(tag, tx + 10, ty + 5);
    tx += tw + 8;
    if (tx > W - 80) { tx = 20; ty += 32; }
  });

  return new THREE.CanvasTexture(cv);
}

// Helper: draw "back" face
function makeBackTexture(project, accentHex) {
  const W = 512, H = 320;
  const cv = document.createElement('canvas');
  cv.width  = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle    = '#fff';
  ctx.font         = 'bold 26px Inter, sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(project.title, W/2, H/2 - 24);
  ctx.font      = '16px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('View Project →', W/2, H/2 + 20);
  return new THREE.CanvasTexture(cv);
}

const cards      = [];    // { group, border, frontMat, backMat, index, offset }
const cardMeshes = [];    // flat list for raycaster

PROJECTS.forEach((proj, i) => {
  const accentHex = ACCENT_CSS[i];
  const accentInt = proj.accent;

  const group = new THREE.Group();
  group.position.set(...proj.pos);

  // Front face (textured plane, slightly in front of box)
  const frontTex  = makeCardTexture(proj, accentHex);
  const frontMat  = new THREE.MeshStandardMaterial({
    map:         frontTex,
    metalness:   0.3,
    roughness:   0.7,
    emissive:    new THREE.Color(accentInt),
    emissiveIntensity: 0.05,
  });
  const frontGeo  = new THREE.BoxGeometry(3.2, 2, 0.08);
  const frontMesh = new THREE.Mesh(frontGeo, frontMat);
  frontMesh.userData = { cardIndex: i, isFront: true };
  group.add(frontMesh);
  cardMeshes.push(frontMesh);

  // Back face
  const backTex  = makeBackTexture(proj, accentHex);
  const backMat  = new THREE.MeshStandardMaterial({
    map:         backTex,
    metalness:   0.3,
    roughness:   0.7,
    emissive:    new THREE.Color(accentInt),
    emissiveIntensity: 0.05,
  });
  const backGeo  = new THREE.BoxGeometry(3.2, 2, 0.08);
  const backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -0.09;
  backMesh.visible    = false;
  group.add(backMesh);

  // Glowing border — EdgesGeometry on slightly larger box
  const borderBox = new THREE.BoxGeometry(3.3, 2.1, 0.09);
  const borderGeo = new THREE.EdgesGeometry(borderBox);
  const borderMat = new THREE.LineBasicMaterial({
    color:       accentInt,
    transparent: true,
    opacity:     0.85,
  });
  const border = new THREE.LineSegments(borderGeo, borderMat);
  group.add(border);

  group.scale.setScalar(0.85);

  scene.add(group);

  cards.push({
    group,
    border,
    frontMat,
    backMat,
    frontMesh,
    backMesh,
    index:    i,
    offset:   i * 1.3,
    flipped:  false,
  });
});

// ─────────────────────────────────────────────────────────────────
//  STEP 5 — Mouse Parallax
// ─────────────────────────────────────────────────────────────────

let targetMouseX = 0, targetMouseY = 0;
let currentMouseX = 0, currentMouseY = 0;
const mouse2D = new THREE.Vector2(); // for raycaster (-1…1)

if (!isMobile) {
  window.addEventListener('mousemove', e => {
    targetMouseX =  (e.clientX / innerWidth  - 0.5) * 2;
    targetMouseY = -(e.clientY / innerHeight - 0.5) * 2;
    mouse2D.x =  (e.clientX / innerWidth)  * 2 - 1;
    mouse2D.y = -(e.clientY / innerHeight) * 2 + 1;
  });
}

// ─────────────────────────────────────────────────────────────────
//  STEP 6 — Scroll Camera Travel + ScrollTrigger
// ─────────────────────────────────────────────────────────────────

gsap.registerPlugin(ScrollTrigger);

// Camera Z driven by scroll
let cameraTargetZ = 10;

ScrollTrigger.create({
  trigger: '#scroll-container',
  start:   'top top',
  end:     'bottom bottom',
  scrub:   1,
  onUpdate(self) {
    cameraTargetZ = gsap.utils.mapRange(0, 1, 10, -55, self.progress);
  },
});

// Hide scroll hint after first scroll
let scrolled = false;
window.addEventListener('scroll', () => {
  if (!scrolled && window.scrollY > 30) {
    scrolled = true;
    document.getElementById('scroll-hint').classList.add('hidden');
  }
}, { passive: true });

// Per-card scroll reveal: scale + panel
const scrollH = document.getElementById('scroll-container').scrollHeight;
PROJECTS.forEach((proj, i) => {
  const progress = gsap.utils.mapRange(-55, 10, 0, 1, proj.pos[2]);
  const triggerPos = `${(1 - progress) * 100}%`;

  ScrollTrigger.create({
    trigger: '#scroll-container',
    start:   `${triggerPos} bottom`,
    onEnter() { revealCard(i); },
    onLeaveBack() { hideCard(i); },
  });
});

function revealCard(i) {
  const c = cards[i];
  gsap.to(c.group.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(1.4)' });
  // Pulse border
  gsap.to(c.frontMat, { emissiveIntensity: 0.25, duration: 0.3, yoyo: true, repeat: 1 });
  // Show side panel
  showPanel(i);
}

function hideCard(i) {
  const c = cards[i];
  gsap.to(c.group.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.4 });
  hidePanel(i);
}

// ─────────────────────────────────────────────────────────────────
//  Card panels DOM helpers
// ─────────────────────────────────────────────────────────────────

let activePanel = -1;

function showPanel(i) {
  if (activePanel === i) return;
  if (activePanel !== -1) {
    document.getElementById(`panel-${activePanel}`).classList.remove('active');
  }
  activePanel = i;
  const panel = document.getElementById(`panel-${i}`);
  if (panel) {
    panel.style.borderLeftColor = ACCENT_CSS[i];
    panel.classList.add('active');
  }
}

function hidePanel(i) {
  if (activePanel === i) {
    document.getElementById(`panel-${i}`)?.classList.remove('active');
    activePanel = -1;
  }
}

// ─────────────────────────────────────────────────────────────────
//  STEP 7 — Raycaster / Hover + Click
// ─────────────────────────────────────────────────────────────────

const raycaster   = new THREE.Raycaster();
let   hoveredCard = -1;
let   frame       = 0;
// Expose for features.js
Object.defineProperty(window, 'hoveredCard', { get: () => hoveredCard });

function checkHover() {
  raycaster.setFromCamera(mouse2D, camera);
  const hits = raycaster.intersectObjects(cardMeshes, false);

  const newHover = hits.length > 0 ? hits[0].object.userData.cardIndex : -1;

  if (newHover !== hoveredCard) {
    // Leave old
    if (hoveredCard !== -1) {
      const old = cards[hoveredCard];
      gsap.to(old.group.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      gsap.to(old.frontMat,    { emissiveIntensity: 0.05, duration: 0.3 });
      gsap.to(old.backMat,     { emissiveIntensity: 0.05, duration: 0.3 });
    }
    // Enter new
    if (newHover !== -1) {
      const nw = cards[newHover];
      gsap.to(nw.group.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.3 });
      gsap.to(nw.frontMat,    { emissiveIntensity: 0.4,  duration: 0.3 });
      gsap.to(nw.backMat,     { emissiveIntensity: 0.4,  duration: 0.3 });
      document.body.style.cursor = 'pointer';
      showPanel(newHover);
    } else {
      document.body.style.cursor = 'default';
    }
    hoveredCard = newHover;
  }
}

// Card flip on click — listener on window because canvas has pointer-events:none
window.addEventListener('click', () => {
  if (hoveredCard === -1) return;
  const c = cards[hoveredCard];
  if (c.flipped) {
    // Flip back — mark unflipped only after tween completes so idle anim doesn't fight GSAP
    gsap.timeline()
      .to(c.group.rotation, { y: 0, duration: 0.6, ease: 'power2.inOut',
        onComplete() {
          c.backMesh.visible  = false;
          c.frontMesh.visible = true;
          c.flipped = false;
        }
      });
  } else {
    // Flip forward
    c.backMesh.visible = true;
    gsap.timeline()
      .to(c.group.rotation, { y: Math.PI, duration: 0.6, ease: 'power2.inOut',
        onUpdate() {
          const progress = Math.abs(c.group.rotation.y % Math.PI) / Math.PI;
          if (progress > 0.5) {
            c.frontMesh.visible = false;
            c.backMesh.visible  = true;
          } else {
            c.frontMesh.visible = true;
            c.backMesh.visible  = false;
          }
        }
      });
    c.flipped = true;
  }
});

// ─────────────────────────────────────────────────────────────────
//  STEP 8 — Loading Screen + Intro Animation
// ─────────────────────────────────────────────────────────────────

function runLoadingScreen() {
  const bar    = document.getElementById('loading-bar');
  const label  = document.getElementById('loading-label');
  const screen = document.getElementById('loading-screen');

  const labels = [
    'Initialising scene…',
    'Generating star field…',
    'Placing project cards…',
    'Calibrating camera…',
    'Ready for launch.',
  ];

  let progress = 0;
  const duration = 1500; // ms
  const start    = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    progress       = Math.min(elapsed / duration, 1);
    bar.style.width = (progress * 100) + '%';

    const li = Math.floor(progress * (labels.length - 1));
    label.textContent = labels[Math.min(li, labels.length - 1)];

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      // Fade out loading screen
      gsap.to(screen, {
        opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.inOut',
        onComplete() { screen.style.display = 'none'; },
      });

      // Dramatic camera push-in: z=20 → z=10
      camera.position.z = 20;
      gsap.to(camera.position, {
        z: 10, duration: 1.2, ease: 'power3.out',
        onComplete: startScene,
      });
    }
  }

  requestAnimationFrame(tick);
}

function startScene() {
  // Reveal navbar
  document.getElementById('navbar').classList.add('visible');

  // Animate hero text
  document.querySelector('.hero-eyebrow').classList.add('visible');
  document.querySelector('.hero-title').classList.add('visible');
  document.querySelector('.hero-subtitle').classList.add('visible');
  document.querySelector('.hero-cta').classList.add('visible');
  document.querySelector('.scroll-hint').classList.add('visible');
}

// ─────────────────────────────────────────────────────────────────
//  Animation Loop
// ─────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  frame++;

  // Mouse parallax (desktop only)
  if (!isMobile) {
    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;

    camera.position.x = currentMouseX * 1.2;
    camera.position.y = currentMouseY * 0.8;
  }

  // Smoothly travel camera along Z
  camera.position.z += (cameraTargetZ - camera.position.z) * 0.08;
  camera.lookAt(camera.position.x * 0.1, camera.position.y * 0.1, camera.position.z - 5);

  // Slow star field rotation (+ hyperdrive boost)
  const _hyper = !!window._hyperdriveActive;
  starGroup.rotation.y += _hyper ? 0.004 : 0.00005;

  // Counter-rotate stars vs mouse (parallax depth layer)
  if (!isMobile) {
    starGroup.rotation.x = -currentMouseY * 0.03;
    starGroup.rotation.z = -currentMouseX * 0.03;
  }

  // Hyperdrive FX: rainbow borders + camera shake
  if (_hyper) {
    const hue = (time * 100) % 360;
    cards.forEach(c => { c.border.material.color.setHSL(hue / 360, 1, 0.6); });
    camera.position.x += (Math.random() - 0.5) * 0.06;
    camera.position.y += (Math.random() - 0.5) * 0.06;
  } else {
    cards.forEach(c => { c.border.material.color.set(PROJECTS[c.index].accent); });
  }

  // Card idle animation
  cards.forEach(c => {
    const t = time + c.offset;
    if (!c.flipped) {
      c.group.position.y = PROJECTS[c.index].pos[1] + Math.sin(t * 0.8) * 0.12;
      c.group.rotation.y = Math.sin(t * 0.4) * 0.08;
      c.group.rotation.x = Math.sin(t * 0.3) * 0.04;
    }
  });

  // Raycaster — every other frame for performance
  if (!isMobile && frame % 2 === 0) checkHover();

  renderer.render(scene, camera);
}

// ─────────────────────────────────────────────────────────────────
//  Mobile: inject project grid into DOM
// ─────────────────────────────────────────────────────────────────

function buildMobileGrid() {
  const container = document.createElement('div');
  container.id = 'mobile-projects';
  PROJECTS.forEach((proj, i) => {
    const card = document.createElement('div');
    card.className = 'mobile-card';
    card.style.borderLeftColor = ACCENT_CSS[i];
    card.innerHTML = `
      <div class="mobile-card-title">${proj.title}</div>
      <div class="mobile-card-desc">Tap to explore this project in more detail.</div>
      <div class="panel-tags">${proj.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <a href="#" class="panel-link">View Project →</a>
    `;
    container.appendChild(card);
  });
  // Insert after hero
  const hero = document.getElementById('hero');
  hero.parentNode.insertBefore(container, hero.nextSibling);
}

// ─────────────────────────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────────────────────────

if (isMobile) {
  buildMobileGrid();
  // Show hero immediately, no 3D
  startScene();
  // Hide loading screen quickly
  const screen = document.getElementById('loading-screen');
  gsap.to(screen, { opacity: 0, duration: 0.5, onComplete() { screen.style.display = 'none'; } });
} else {
  runLoadingScreen();
  animate();
}
