import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Project } from "./projects";
interface OrbitState {
  focusedId: string | null;
  hoveredId: string | null;
  paused: boolean;
  reduced: boolean;
  resetKey: number;
}
export interface OrbitEngine {
  update: (state: OrbitState) => void;
  dispose: () => void;
}

function planetTexture(color: string, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 256);
  let seed = index + 13;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let y = 0; y < 256; y++) {
    const band = Math.sin(y * 0.1 + Math.sin(y * 0.034) * 3) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(6,14,14,${0.12 + band * 0.34})`;
    ctx.fillRect(0, y, 512, 1);
  }
  for (let i = 0; i < 170; i++) {
    const x = rand() * 512,
      y = rand() * 256,
      r = rand() * 25 + 3;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.9, 0.5 + rand());
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(
      0,
      `rgba(${index === 1 ? "230,220,255" : "255,255,220"},${rand() * 0.16})`,
    );
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "#e4ffb9");
  gradient.addColorStop(0.15, "#bce76b99");
  gradient.addColorStop(0.45, "#8bb85a22");
  gradient.addColorStop(1, "#00000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
export function createOrbit(
  canvas: HTMLCanvasElement,
  labels: HTMLDivElement,
  projects: Project[],
  onSelect: (p: Project) => void,
  onFailure: () => void,
): OrbitEngine {
  const host = canvas.parentElement!;
  labels.hidden = true;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
  const home = new THREE.Vector3(0, 17, 26);
  camera.position.copy(home);
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.45;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.45;
  controls.touches.ONE = undefined;
  controls.touches.TWO = THREE.TOUCH.ROTATE;
  canvas.style.touchAction = "pan-y";
  const light = new THREE.DirectionalLight("#f4ffd9", 3.5);
  light.position.set(-9, 12, 10);
  scene.add(light);
  const rim = new THREE.DirectionalLight("#83add3", 2);
  rim.position.set(8, 0, -10);
  scene.add(rim, new THREE.AmbientLight("#728c71", 1.5));
  const core = new THREE.Group();
  scene.add(core);
  const coreMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.45, 2),
    new THREE.MeshStandardMaterial({
      color: "#b6d977",
      emissive: "#a9e857",
      emissiveIntensity: 0.42,
      metalness: 0.55,
      roughness: 0.5,
      flatShading: true,
    }),
  );
  core.add(coreMesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(coreMesh.geometry),
    new THREE.LineBasicMaterial({
      color: "#dcffa6",
      transparent: true,
      opacity: 0.22,
    }),
  );
  coreMesh.add(edges);
  const glowMap = glowTexture();
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowMap,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.scale.set(11, 11, 1);
  core.add(glow);
  const arcs: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(2.1 + i * 0.3, 0.012, 6, 100, Math.PI * 1.55),
      new THREE.MeshBasicMaterial({
        color: "#cefc78",
        transparent: true,
        opacity: 0.42 - i * 0.09,
      }),
    );
    arc.rotation.set(Math.PI / 2 + i * 0.55, 0, i * 1.3);
    core.add(arc);
    arcs.push(arc);
  }
  let seed = 52;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const positions = new Float32Array(950 * 3);
  for (let i = 0; i < 950; i++) {
    positions[i * 3] = (random() - 0.5) * 75;
    positions[i * 3 + 1] = (random() - 0.5) * 40;
    positions[i * 3 + 2] = (random() - 0.5) * 60;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: "#ccd5c4",
      size: 0.032,
      transparent: true,
      opacity: 0.55,
    }),
  );
  scene.add(stars);
  let state: OrbitState = {
    focusedId: null,
    hoveredId: null,
    paused: false,
    reduced: false,
    resetKey: 0,
  };
  let hovered: string | null = null;
  const abort = new AbortController();
  const eventOptions = { signal: abort.signal };
  const planets = projects.map((project, i) => {
    const orbit = new THREE.Group();
    orbit.rotation.z = (i - 1.5) * 0.065;
    scene.add(orbit);
    const points = Array.from(
      { length: 181 },
      (_, j) =>
        new THREE.Vector3(
          Math.cos((j / 180) * Math.PI * 2) * project.radius,
          0,
          Math.sin((j / 180) * Math.PI * 2) * project.radius,
        ),
    );
    const ringMaterial = new THREE.LineBasicMaterial({
      color: project.color,
      transparent: true,
      opacity: 0.17,
    });
    orbit.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        ringMaterial,
      ),
    );
    const map = planetTexture(project.color, i);
    const size = [0.7, 0.84, 0.68, 0.78][i];
    const material = new THREE.MeshStandardMaterial({
      map,
      color: "#ffffff",
      roughness: 0.8,
      metalness: 0.08,
      emissive: project.color,
      emissiveIntensity: 0.025,
    });
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 40, 28),
      material,
    );
    mesh.rotation.z = [0.18, -0.32, 0.25, -0.1][i];
    orbit.add(mesh);
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(size * 1.09, 32, 24),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { tint: { value: new THREE.Color(project.color) } },
        vertexShader:
          "varying vec3 vN; varying vec3 vV; void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}",
        fragmentShader:
          "uniform vec3 tint; varying vec3 vN; varying vec3 vV;void main(){float rim=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),3.);gl_FragColor=vec4(tint,rim*.55);}",
      }),
    );
    mesh.add(atmosphere);
    if (i === 1 || i === 3) {
      const rings = new THREE.Mesh(
        new THREE.RingGeometry(size * 1.4, size * 2.1, 96),
        new THREE.MeshBasicMaterial({
          color: project.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.2,
        }),
      );
      rings.rotation.x = Math.PI / 2.5;
      mesh.add(rings);
      const outer = new THREE.Mesh(
        new THREE.TorusGeometry(size * 2.1, 0.012, 6, 96),
        new THREE.MeshBasicMaterial({
          color: project.color,
          transparent: true,
          opacity: 0.65,
        }),
      );
      outer.rotation.copy(rings.rotation);
      mesh.add(outer);
    }
    const trailPoints = Array.from(
      { length: 35 },
      (_, j) =>
        new THREE.Vector3(
          Math.cos(-j * 0.012) * project.radius,
          0,
          Math.sin(-j * 0.012) * project.radius,
        ),
    );
    const trail = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(trailPoints),
      new THREE.LineBasicMaterial({
        color: project.color,
        transparent: true,
        opacity: 0.45,
      }),
    );
    orbit.add(trail);
    const label = document.createElement("button");
    label.className = "planet-label";
    label.setAttribute("aria-label", `Open ${project.name} details`);
    label.innerHTML = `<small>WORLD ${project.id}</small>${project.name}<span class="label-explore">EXPLORE ↗</span>`;
    labels.appendChild(label);
    label.addEventListener("click", () => onSelect(project), eventOptions);
    label.addEventListener(
      "pointerenter",
      () => {
        hovered = project.id;
      },
      eventOptions,
    );
    label.addEventListener(
      "pointerleave",
      () => {
        hovered = null;
      },
      eventOptions,
    );
    label.addEventListener(
      "focus",
      () => {
        hovered = project.id;
      },
      eventOptions,
    );
    label.addEventListener(
      "blur",
      () => {
        hovered = null;
      },
      eventOptions,
    );
    return {
      project,
      orbit,
      mesh,
      trail,
      label,
      ringMaterial,
      angle: project.angle,
      world: new THREE.Vector3(),
    };
  });
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  function hit(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.intersectObjects(
      planets.map((p) => p.mesh),
      false,
    )[0];
    return planets.find((p) => p.mesh === intersection?.object);
  }
  let down: { x: number; y: number } | null = null;
  canvas.addEventListener(
    "pointerdown",
    (e) => {
      down = { x: e.clientX, y: e.clientY };
    },
    eventOptions,
  );
  canvas.addEventListener(
    "pointermove",
    (e) => {
      if (!down) {
        hovered = hit(e)?.project.id ?? null;
        canvas.style.cursor = hovered ? "pointer" : "grab";
      }
    },
    eventOptions,
  );
  canvas.addEventListener(
    "pointerleave",
    () => {
      hovered = null;
    },
    eventOptions,
  );
  canvas.addEventListener(
    "pointercancel",
    () => {
      down = null;
    },
    eventOptions,
  );
  canvas.addEventListener(
    "pointerup",
    (e) => {
      const click =
        down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6;
      down = null;
      if (click) {
        const p = hit(e);
        if (p) onSelect(p.project);
      }
    },
    eventOptions,
  );
  let visible = !document.hidden,
    inView = true,
    disposed = false,
    frame = 0,
    last = 0,
    elapsed = 0,
    returning = false;
  const savedPosition = home.clone(),
    savedTarget = new THREE.Vector3(),
    projected = new THREE.Vector3(),
    destination = new THREE.Vector3();
  let hasDrawn = false;
  function schedule() {
    if (!frame && !disposed && visible && inView) {
      last = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }
  function draw(now: number, force = false) {
    frame = 0;
    if (disposed || ((!visible || !inView) && hasDrawn && !force)) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const moving = !state.paused && !state.focusedId;
    if (moving) {
      elapsed += dt;
      coreMesh.rotation.y += dt * 0.12;
      arcs.forEach((arc, i) => (arc.rotation.z += dt * (0.09 + i * 0.025)));
      glow.scale.setScalar(10.5 + Math.sin(elapsed * 0.65) * 0.3);
    }
    const selected = planets.find((p) => p.project.id === state.focusedId);
    planets.forEach((p, i) => {
      const hot =
        hovered === p.project.id ||
        state.hoveredId === p.project.id ||
        state.focusedId === p.project.id;
      if (moving && !hot) p.angle += dt * (0.06 - i * 0.009);
      if (moving) p.mesh.rotation.y += dt * 0.1;
      p.mesh.position.set(
        Math.cos(p.angle) * p.project.radius,
        0,
        Math.sin(p.angle) * p.project.radius,
      );
      p.trail.rotation.y = -p.angle;
      const factor = state.reduced ? 1 : 1 - Math.exp(-dt * 6);
      p.mesh.scale.lerp(destination.setScalar(hot ? 1.17 : 1), factor);
      p.ringMaterial.opacity = THREE.MathUtils.lerp(
        p.ringMaterial.opacity,
        hot ? 0.4 : 0.16,
        factor,
      );
      p.label.classList.toggle("is-hot", hot);
    });
    scene.updateMatrixWorld();
    if (selected) {
      selected.mesh.getWorldPosition(selected.world);
      destination.copy(selected.world).add(new THREE.Vector3(0, 5.2, 9.5));
      const f = state.reduced ? 1 : 1 - Math.exp(-dt * 3);
      camera.position.lerp(destination, f);
      destination.copy(selected.world);
      if (host.clientWidth > 600) destination.x += 3.4;
      controls.target.lerp(destination, f);
      controls.enabled = false;
    } else if (returning) {
      const f = state.reduced ? 1 : 1 - Math.exp(-dt * 3);
      camera.position.lerp(savedPosition, f);
      controls.target.lerp(savedTarget, f);
      if (camera.position.distanceTo(savedPosition) < 0.02) {
        returning = false;
        controls.enabled = true;
      }
    } else controls.enabled = true;
    controls.update();
    const width = host.clientWidth,
      height = host.clientHeight;
    planets.forEach((p) => {
      p.mesh.getWorldPosition(p.world);
      projected.copy(p.world).project(camera);
      const x = (projected.x * 0.5 + 0.5) * width,
        y = (-projected.y * 0.5 + 0.5) * height;
      p.label.hidden = projected.z > 1 || Boolean(selected && selected !== p);
      const labelWidth = p.label.offsetWidth;
      p.label.style.left = `${Math.max(8, Math.min(width - labelWidth - 28, x))}px`;
      p.label.style.top = `${Math.max(70, Math.min(height - 90, y))}px`;
    });
    renderer.render(scene, camera);
    hasDrawn = true;
    labels.hidden = false;
    if (visible && inView) frame = requestAnimationFrame(draw);
  }
  const resize = new ResizeObserver(() => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 600 ? 55 : 42;
    camera.updateProjectionMatrix();
    cancelAnimationFrame(frame);
    frame = 0;
    draw(performance.now(), true);
  });
  resize.observe(host);
  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      if (!inView) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    },
    { rootMargin: "80px" },
  );
  observer.observe(host);
  document.addEventListener(
    "visibilitychange",
    () => {
      visible = !document.hidden;
      if (!visible) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    },
    eventOptions,
  );
  canvas.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      visible = false;
      cancelAnimationFrame(frame);
      frame = 0;
      labels.hidden = true;
      onFailure();
    },
    eventOptions,
  );
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  camera.aspect = host.clientWidth / host.clientHeight;
  camera.fov = host.clientWidth < 600 ? 55 : 42;
  camera.updateProjectionMatrix();
  last = performance.now();
  draw(last);
  return {
    update(next) {
      if (next.focusedId && !state.focusedId) {
        savedPosition.copy(camera.position);
        savedTarget.copy(controls.target);
      }
      if (!next.focusedId && state.focusedId) returning = true;
      if (next.resetKey !== state.resetKey) {
        savedPosition.copy(home);
        savedTarget.set(0, 0, 0);
        returning = true;
        planets.forEach((p) => (p.angle = p.project.angle));
      }
      state = { ...next };
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      abort.abort();
      resize.disconnect();
      observer.disconnect();
      controls.dispose();
      labels.replaceChildren();
      scene.traverse((object) => {
        const renderable = object as THREE.Mesh;
        if (renderable.geometry) renderable.geometry.dispose();
        if (renderable.material) {
          const materials = Array.isArray(renderable.material)
            ? renderable.material
            : [renderable.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
          });
        }
      });
      renderer.dispose();
    },
  };
}
