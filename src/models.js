import * as T from "three";
// Procedural presentation models; dimensions are illustrative, not manufacturing CAD.
export function decorate(group, type, pins) {
  const tag = (object, name) => {
    object.userData.pinName = name;
    return object;
  };
  const mat = (color, metalness = 0, roughness = 0.5) =>
    new T.MeshStandardMaterial({ color, metalness, roughness });
  function mesh(geometry, material, x, y, z) {
    const m = new T.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  }
  const cube = (w, h, d, c, x, y, z) =>
    mesh(new T.BoxGeometry(w, h, d), mat(c), x, y, z);
  const cyl = (r, h, c, x, y, z) =>
    mesh(new T.CylinderGeometry(r, r, h, 24), mat(c, 0.6, 0.3), x, y, z);
  function print(label, x, z, width = 1, color = "#eef7eb") {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.font = "bold 52px monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, 256, 83);
    const m = mesh(
      new T.PlaneGeometry(width, width / 4),
      new T.MeshBasicMaterial({
        map: new T.CanvasTexture(c),
        transparent: true,
        depthWrite: false,
      }),
      x,
      0.266,
      z,
    );
    m.rotation.x = -Math.PI / 2;
  }
  if (type === "uno") {
    cube(3, 0.16, 2.2, 0x087e92, 0, 0.17, 0);
    for (const z of [-0.91, 0.91]) {
      cube(2.2, 0.22, 0.18, 0x151b1e, 0.2, 0.35, z);
      for (let i = 0; i < 9; i++)
        tag(
          cube(0.09, 0.02, 0.09, 0x62686a, -0.8 + i * 0.24, 0.467, z),
          pins[i + (z > 0 ? 9 : 0)],
        );
    }
    cube(1.1, 0.18, 0.35, 0x172027, 0.3, 0.35, 0.2);
    for (let i = 0; i < 14; i++)
      for (const z of [0.0, 0.4])
        cube(0.04, 0.09, 0.1, 0xadb7b8, -0.2 + i * 0.075, 0.3, z);
    cube(0.55, 0.38, 0.48, 0xb5c1c5, -1.35, 0.4, -0.42);
    cube(0.025, 0.24, 0.32, 0x26353b, -1.635, 0.4, -0.42);
    const jack = cyl(0.18, 0.5, 0x161c23, -1.25, 0.4, 0.65);
    jack.rotation.z = Math.PI / 2;
    for (const x of [-0.9, -0.55]) {
      cyl(0.12, 0.3, 0x334351, x, 0.4, 0.5);
      cyl(0.105, 0.015, 0xc0ccce, x, 0.56, 0.5);
    }
    for (const x of [-1.32, 1.32])
      for (const z of [-0.92, 0.92]) {
        cyl(0.09, 0.012, 0xd2bd77, x, 0.26, z);
        cyl(0.05, 0.015, 0x1a3038, x, 0.27, z);
      }
    print("UNO", 0.55, -0.38, 0.8);
    print("DIGITAL", 0.1, -0.68, 0.9);
    print("ANALOG IN", 0.5, 0.68, 0.8);
    for (let i = 0; i < 6; i++) {
      cube(0.14, 0.025, 0.05, 0xc6b28b, -0.9 + i * 0.18, 0.27, -0.3);
      cube(0.07, 0.02, 0.05, 0x2b3737, -0.9 + i * 0.18, 0.29, -0.3);
    }
  }
  if (type === "board") {
    cube(4, 0.24, 2, 0xedece4, 0, 0.12, 0);
    cube(3.8, 0.015, 0.12, 0xa7aaa7, 0, 0.246, 0);
    for (let col = 0; col < 25; col++)
      for (let row = 0; row < 10; row++) {
        const z = (row < 5 ? -1 : 1) * (0.16 + (row % 5) * 0.105);
        const hole = cyl(0.026, 0.014, 0x555c5d, -1.75 + col * 0.145, 0.252, z);
        hole.userData.pinName = `${"abcdefghij"[row]}${col + 1}`;
      }
    for (const side of [-1, 1])
      for (const rail of [0, 1]) {
        const z = side * (0.78 + rail * 0.12);
        cube(3.75, 0.01, 0.012, rail ? 0x397ca8 : 0xce5856, 0, 0.251, z);
        for (let col = 0; col < 25; col++)
          cyl(0.022, 0.015, 0x646b6e, -1.75 + col * 0.145, 0.254, z - 0.035);
      }
  }
  if (type === "resistor") {
    const body = cyl(0.16, 0.65, 0xd4b283, 0, 0.2, 0);
    body.rotation.z = Math.PI / 2;
    for (const [x, c] of [
      [-0.2, 0xc94731],
      [-0.08, 0xc94731],
      [0.05, 0x683923],
      [0.24, 0xd6b554],
    ]) {
      const band = cyl(0.164, 0.04, c, x, 0.2, 0);
      band.rotation.z = Math.PI / 2;
    }
    for (const [i, x] of [-0.5, 0.5].entries()) {
      const wire = tag(cyl(0.025, 0.4, 0xb7c3c7, x, 0.2, 0), pins[i]);
      wire.rotation.z = Math.PI / 2;
    }
  }
  if (type === "led") {
    for (const [i, x] of [-0.12, 0.12].entries())
      tag(cyl(0.025, 0.5, 0xcbd2d6, x, 0.25, 0), pins[i]);
    const glass = new T.MeshPhysicalMaterial({
      color: 0xef243f,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      clearcoat: 1,
    });
    mesh(new T.CylinderGeometry(0.22, 0.22, 0.3, 32), glass, 0, 0.55, 0);
    mesh(
      new T.SphereGeometry(0.22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      glass.clone(),
      0,
      0.7,
      0,
    );
    cyl(0.26, 0.06, 0xaf263b, 0, 0.38, 0);
  }
  if (type === "servo") {
    pins.forEach((p, i) =>
      tag(
        cube(
          0.45,
          0.055,
          0.06,
          [0x34221b, 0xc33532, 0xe8a448][i],
          0.8,
          0.2,
          -0.15 + i * 0.15,
        ),
        p,
      ),
    );
    cube(1.2, 0.85, 0.7, 0x2059a5, 0, 0.43, 0);
    cube(1.55, 0.08, 0.4, 0x2362af, 0, 0.7, 0);
    cyl(0.25, 0.22, 0x245da2, -0.25, 0.94, 0);
    cyl(0.13, 0.1, 0xe6e4dc, -0.25, 1.1, 0);
    cube(1.1, 0.08, 0.16, 0xe9e8e0, 0.05, 1.15, 0);
    for (const x of [-0.4, -0.1, 0.2, 0.5])
      cyl(0.025, 0.012, 0x818a8c, x, 1.197, 0);
    cube(0.65, 0.35, 0.012, 0xe0d7b3, 0.1, 0.4, 0.356);
  }
  if (type === "sensor") {
    pins.forEach((p, i) =>
      tag(cube(0.06, 0.06, 0.35, 0xd1bd7a, -0.3 + i * 0.2, 0.18, -0.47), p),
    );
    cube(1.7, 0.1, 0.7, 0x177a92, 0, 0.15, 0);
    for (const x of [-0.48, 0.48]) {
      cyl(0.32, 0.4, 0xc5ced0, x, 0.4, 0);
      cyl(0.26, 0.015, 0x35444b, x, 0.61, 0);
      for (let i = -3; i <= 3; i++)
        cube(0.43, 0.012, 0.012, 0x8c989c, x, 0.622, i * 0.055);
    }
  }
  if (type === "button") {
    cube(0.7, 0.18, 0.7, 0x252d32, 0, 0.15, 0);
    cube(0.62, 0.06, 0.62, 0xa3b0b5, 0, 0.27, 0);
    cyl(0.18, 0.22, 0x20292e, 0, 0.4, 0);
    for (const [a, x] of [-0.37, 0.37].entries())
      for (const [b, z] of [-0.2, 0.2].entries())
        tag(cube(0.18, 0.08, 0.07, 0xc1c8ca, x, 0.08, z), pins[a * 2 + b]);
  }
  if (type === "pot") {
    pins.forEach((p, i) =>
      tag(cube(0.06, 0.06, 0.35, 0xc8c9bb, -0.2 + i * 0.2, 0.1, 0.42), p),
    );
    cyl(0.38, 0.3, 0x2766a5, 0, 0.2, 0);
    cyl(0.25, 0.16, 0xb4b9b4, 0, 0.43, 0);
    cyl(0.12, 0.4, 0xbfc5c3, 0, 0.67, 0);
    cube(0.02, 0.015, 0.2, 0x344249, 0, 0.875, 0);
  }
}
