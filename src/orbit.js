import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function mountOrbit(projects, onSelect) {
  const host = document.querySelector("#universe");
  const canvas = document.querySelector("#orbit-canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);
  camera.position.set(0, 17, 26);
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = 1.35;
  controls.rotateSpeed = 0.45;
  // Keep one-finger mobile scrolling native; two-finger gestures rotate the scene.
  controls.touches.ONE = undefined;
  controls.touches.TWO = THREE.TOUCH.ROTATE;
  canvas.style.touchAction = "pan-y";
  const key = new THREE.DirectionalLight("#e5ffd0", 5);
  key.position.set(-8, 10, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#82b45a", 3);
  rim.position.set(7, -2, -7);
  scene.add(rim);
  scene.add(new THREE.AmbientLight("#acb8a0", 1));
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 1),
    new THREE.MeshStandardMaterial({
      color: "#8fac48",
      roughness: 0.32,
      metalness: 0.85,
      flatShading: true,
    }),
  );
  coreGroup.add(core);
  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(core.geometry),
    new THREE.LineBasicMaterial({
      color: "#d4fc92",
      transparent: true,
      opacity: 0.48,
    }),
  );
  core.add(wire);
  const cage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.1, 0),
    new THREE.MeshBasicMaterial({
      color: "#cefc78",
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    }),
  );
  coreGroup.add(cage);
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.45 + i * 0.14, 0.014, 6, 100),
      new THREE.MeshBasicMaterial({
        color: "#cefc78",
        transparent: true,
        opacity: 0.35 - i * 0.07,
      }),
    );
    ring.rotation.x = Math.PI / 2 + i * 0.45;
    ring.rotation.y = i * 0.65;
    coreGroup.add(ring);
  }
  const centralLight = new THREE.PointLight("#b3ee75", 12, 15);
  centralLight.position.set(0, 1, 0);
  scene.add(centralLight);
  // Seeded stars keep the composition stable between visits and screenshots.
  let seed = 42;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const positions = new Float32Array(600 * 3);
  for (let i = 0; i < 600; i++) {
    positions[i * 3] = (random() - 0.5) * 65;
    positions[i * 3 + 1] = (random() - 0.5) * 35;
    positions[i * 3 + 2] = (random() - 0.5) * 50;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: "#b4c0a0",
      size: 0.035,
      transparent: true,
      opacity: 0.48,
      sizeAttenuation: true,
    }),
  );
  scene.add(stars);
  const labels = document.querySelector("#planet-labels");
  const planets = projects.map((project, i) => {
    const orbit = new THREE.Group();
    orbit.rotation.z = (i - 1.5) * 0.08;
    scene.add(orbit);
    const points = [];
    for (let j = 0; j <= 180; j++) {
      const a = (j / 180) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(a) * project.radius,
          0,
          Math.sin(a) * project.radius,
        ),
      );
    }
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: project.color,
        transparent: true,
        opacity: 0.19,
      }),
    );
    orbit.add(ring);
    const ticks = [];
    for (let j = 0; j < 80; j++) {
      const a = (j / 80) * Math.PI * 2;
      const r = project.radius;
      ticks.push(
        Math.cos(a) * r,
        0,
        Math.sin(a) * r,
        Math.cos(a) * (r + 0.07),
        0,
        Math.sin(a) * (r + 0.07),
      );
    }
    const tickGeo = new THREE.BufferGeometry();
    tickGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(ticks, 3),
    );
    orbit.add(
      new THREE.LineSegments(
        tickGeo,
        new THREE.LineBasicMaterial({
          color: project.color,
          transparent: true,
          opacity: 0.24,
        }),
      ),
    );
    let geometry;
    if (project.shape === "ico")
      geometry = new THREE.IcosahedronGeometry(0.58, 0);
    else if (project.shape === "torus")
      geometry = new THREE.TorusGeometry(0.47, 0.16, 20, 60);
    else if (project.shape === "octa")
      geometry = new THREE.OctahedronGeometry(0.7, 0);
    else geometry = new THREE.SphereGeometry(0.52, 32, 24);
    const material = new THREE.MeshStandardMaterial({
      color: project.color,
      roughness: 0.35,
      metalness: 0.5,
      emissive: project.color,
      emissiveIntensity: 0.16,
    });
    const mesh = new THREE.Mesh(geometry, material);
    orbit.add(mesh);
    if (project.shape === "sphere") {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.022, 8, 80),
        new THREE.MeshBasicMaterial({
          color: project.color,
          transparent: true,
          opacity: 0.7,
        }),
      );
      halo.rotation.x = Math.PI / 2.6;
      mesh.add(halo);
    }
    const label = document.createElement("button");
    label.className = "planet-label";
    label.innerHTML = `${project.name}<small>0${i + 1} / EXPLORE ↗</small>`;
    label.setAttribute("aria-label", `Open ${project.name} details`);
    label.addEventListener("click", () => onSelect(project));
    labels.appendChild(label);
    return {
      project,
      mesh,
      orbit,
      label,
      angle: project.angle,
      world: new THREE.Vector3(),
    };
  });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduced.matches,
    visible = true,
    inView = true,
    lastTime = 0,
    frame = 0;
  const pauseButton = document.querySelector("#motion-toggle");
  function syncPause() {
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.setAttribute(
      "aria-label",
      paused ? "Play orbit animation" : "Pause orbit animation",
    );
    pauseButton.textContent = paused ? "▷" : "Ⅱ";
  }
  syncPause();
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    syncPause();
  });
  reduced.addEventListener("change", (e) => {
    paused = e.matches;
    syncPause();
  });
  document.querySelector("#reset-orbit").addEventListener("click", () => {
    camera.position.set(0, 17, 26);
    controls.target.set(0, 0, 0);
    controls.update();
    planets.forEach((p) => (p.angle = p.project.angle));
  });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let down = null;
  canvas.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) {
      down = null;
      return;
    }
    down = null;
    const box = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - box.left) / box.width) * 2 - 1,
      (-(e.clientY - box.top) / box.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(
      planets.map((p) => p.mesh),
      false,
    )[0];
    if (hit) onSelect(planets.find((p) => p.mesh === hit.object).project);
  });
  canvas.addEventListener("pointercancel", () => {
    down = null;
  });
  const projected = new THREE.Vector3();
  function draw(now) {
    frame = 0;
    if (!visible || !inView) return;
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const running = !paused && !document.querySelector("#project-dialog").open;
    if (running) {
      core.rotation.y += delta * 0.12;
      core.rotation.z += delta * 0.035;
      cage.rotation.y -= delta * 0.055;
    }
    controls.update();
    planets.forEach((p, i) => {
      if (running) {
        p.angle += delta * (0.055 - i * 0.009);
        p.mesh.rotation.y += delta * 0.15;
      }
      p.mesh.position.set(
        Math.cos(p.angle) * p.project.radius,
        0,
        Math.sin(p.angle) * p.project.radius,
      );
    });
    scene.updateMatrixWorld();
    const width = host.clientWidth,
      height = host.clientHeight;
    planets.forEach((p) => {
      p.mesh.getWorldPosition(p.world);
      projected.copy(p.world).project(camera);
      const x = (projected.x * 0.5 + 0.5) * width,
        y = (-projected.y * 0.5 + 0.5) * height;
      const labelWidth = p.label.offsetWidth;
      p.label.style.left = `${Math.max(4, Math.min(width - labelWidth - 24, x))}px`;
      p.label.style.top = `${Math.max(60, Math.min(height - 65, y))}px`;
      p.label.hidden = projected.z > 1;
    });
    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  }
  function resume() {
    if (!frame && visible && inView) {
      lastTime = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else resume();
  });
  new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      if (!inView) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else resume();
    },
    { rootMargin: "80px" },
  ).observe(host);
  const resize = new ResizeObserver(() => {
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 550 ? 52 : 40;
    camera.updateProjectionMatrix();
    resume();
  });
  resize.observe(host);
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    visible = false;
    cancelAnimationFrame(frame);
    frame = 0;
    host.classList.remove("webgl-ready");
    host.classList.add("no-webgl");
    labels.hidden = true;
    document.querySelector("#scene-hint").textContent =
      "EXPLORE THE PROJECTS BELOW ↓";
  });
  host.classList.add("webgl-ready");
  resume();
}
