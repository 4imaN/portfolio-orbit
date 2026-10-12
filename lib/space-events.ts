import * as THREE from "three";

/** Time advances only when the scene runs: pausing never skips a visit. */
export function createSpaceEvents(scene: THREE.Scene, random = Math.random) {
  const ship = new THREE.Group();
  ship.name = "visitor-ship";
  ship.visible = false;
  scene.add(ship);
  const hull = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 16),
    new THREE.MeshStandardMaterial({
      color: "#88979d",
      metalness: 0.85,
      roughness: 0.25,
    }),
  );
  hull.scale.set(1, 0.24, 1);
  ship.add(hull);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: "#7bffc2",
      emissive: "#41dcab",
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      metalness: 0.2,
      roughness: 0.2,
    }),
  );
  dome.position.y = 0.1;
  ship.add(dome);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.025, 8, 48),
    new THREE.MeshBasicMaterial({ color: "#adffe0" }),
  );
  rim.rotation.x = Math.PI / 2;
  ship.add(rim);
  for (let i = 0; i < 8; i++) {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshBasicMaterial({ color: i % 2 ? "#a0ffd4" : "#cefc78" }),
    );
    lamp.position.set(
      Math.cos((i * Math.PI) / 4) * 0.6,
      -0.08,
      Math.sin((i * Math.PI) / 4) * 0.6,
    );
    ship.add(lamp);
  }
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: "#cefc78",
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.22, 1, 16, 1, true),
    beamMaterial,
  );
  beam.visible = false;
  scene.add(beam);
  const dock = new THREE.Vector3(2.8, 2.6, 0.7);
  const approach = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-22, 9, -12),
    new THREE.Vector3(-10, 6, -4),
    new THREE.Vector3(-2, 4, 3),
    dock,
  ]);
  const departure = new THREE.CatmullRomCurve3([
    dock,
    new THREE.Vector3(6, 4, 2),
    new THREE.Vector3(12, 9, -6),
    new THREE.Vector3(28, 15, -20),
  ]);
  const comet = new THREE.Group();
  comet.name = "passing-comet";
  comet.visible = false;
  scene.add(comet);
  comet.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 8),
      new THREE.MeshBasicMaterial({ color: "#e3faff" }),
    ),
  );
  const tailPositions = new Float32Array(30 * 3),
    tailColors = new Float32Array(30 * 3);
  for (let i = 0; i < 30; i++) {
    tailPositions[i * 3] = -i * 0.15;
    tailColors.set(
      [0.55 * (1 - i / 30), 0.85 * (1 - i / 30), 1 - i / 30],
      i * 3,
    );
  }
  const tailGeometry = new THREE.BufferGeometry();
  tailGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(tailPositions, 3),
  );
  tailGeometry.setAttribute("color", new THREE.BufferAttribute(tailColors, 3));
  comet.add(
    new THREE.Line(
      tailGeometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  let time = 0,
    shipStart = 7 + random() * 7,
    cometStart = 3 + random() * 5;
  let phase: "idle" | "approach" | "refuel" | "departure" = "idle";
  const cometFrom = new THREE.Vector3(),
    cometTo = new THREE.Vector3(),
    direction = new THREE.Vector3();
  function newComet() {
    const sign = random() < 0.5 ? -1 : 1;
    cometFrom.set(-22 * sign, 8 + random() * 5, -10 + random() * 15);
    cometTo.set(22 * sign, -2 + random() * 8, -12);
    direction.subVectors(cometTo, cometFrom).normalize();
    comet.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
  }
  newComet();
  return {
    tick(dt: number) {
      time += Math.max(0, dt);
      const age = time - shipStart;
      phase =
        age < 0
          ? "idle"
          : age < 6
            ? "approach"
            : age < 10
              ? "refuel"
              : age < 15
                ? "departure"
                : "idle";
      ship.visible = phase !== "idle";
      beam.visible = phase === "refuel";
      if (phase === "approach") {
        const t = age / 6;
        ship.position.copy(approach.getPoint(1 - Math.pow(1 - t, 2)));
        ship.rotation.z = Math.sin(t * Math.PI) * 0.25;
      }
      if (phase === "refuel") {
        ship.position.copy(dock);
        ship.position.y += Math.sin(age * 2) * 0.08;
        ship.rotation.z = Math.sin(age) * 0.035;
        direction.copy(ship.position);
        beam.position.copy(direction).multiplyScalar(0.5);
        beam.scale.y = direction.length();
        beam.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize(),
        );
        beamMaterial.opacity = 0.16 + Math.sin(age * 6) * 0.05;
      }
      if (phase === "departure") {
        const t = (age - 10) / 5;
        ship.position.copy(departure.getPoint(t * t));
        ship.rotation.z = -Math.sin(t * Math.PI) * 0.25;
      }
      if (age >= 15) shipStart = time + 22 + random() * 28;
      const cometAge = time - cometStart;
      comet.visible = cometAge >= 0 && cometAge < 2.7;
      if (comet.visible)
        comet.position.lerpVectors(cometFrom, cometTo, cometAge / 2.7);
      if (cometAge >= 2.7) {
        cometStart = time + 9 + random() * 18;
        newComet();
      }
      return phase === "refuel"
        ? "VISITOR REFUELING AT THE SUN"
        : phase === "approach"
          ? "INCOMING VISITOR"
          : phase === "departure"
            ? "UNTIL THE NEXT ORBIT"
            : comet.visible
              ? "A COMET PASSING THROUGH"
              : "";
    },
    get phase() {
      return phase;
    },
    set visible(value: boolean) {
      ship.visible = value && phase !== "idle";
      beam.visible = value && phase === "refuel";
      if (!value) comet.visible = false;
    },
  };
}
