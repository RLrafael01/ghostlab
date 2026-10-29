import { BREADBOARD } from "./breadboard-layout.js";
import * as T from "three";

// Authored silkscreen overlays, not a reproduction of the manufacturer's PCB artwork.
function decal(group, width, depth, x, y, z, paint) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = Math.round((2048 * depth) / width);
  const ctx = canvas.getContext("2d");
  ctx.scale(canvas.width / width, canvas.height / depth);
  ctx.translate(width / 2, depth / 2);
  paint(ctx);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 8;
  const mesh = new T.Mesh(
    new T.PlaneGeometry(width, depth),
    new T.MeshStandardMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      roughness: 0.7,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.userData.surfaceDecal = true;
  mesh.raycast = () => {}; // Markings never hide terminal hit targets.
  group.add(mesh);
}
export function finishSurface(scene, type, headers) {
  if (type === "uno") {
    const opening = new T.Mesh(
      new T.PlaneGeometry(8.6, 7.4),
      new T.MeshStandardMaterial({ color: "#202a2c", roughness: 0.8 }),
    );
    opening.position.set(-5.6, 7.5, -34.59);
    opening.rotation.y = Math.PI;
    scene.add(opening);
    const insert = new T.Mesh(
      new T.BoxGeometry(4.8, 2.2, 0.12),
      new T.MeshStandardMaterial({ color: "#b9beb8", roughness: 0.6 }),
    );
    insert.position.set(-5.6, 7.3, -34.64);
    scene.add(insert);

    decal(scene, 53, 76.4, -16.1, 2.07, 3.62, (ctx) => {
      ctx.fillStyle = "#e0f0e9";
      ctx.textAlign = "center";
      ctx.font = "bold 5px sans-serif";
      ctx.fillText("UNO", 1, 2);
      ctx.font = "1.5px monospace";
      ctx.fillText("GHOSTLAB", 1, 5);
      ctx.font = "1.1px monospace";
      ctx.fillText("ATmega328P", 0, 9);
      for (const header of headers)
        header.names.forEach((name, i) => {
          ctx.save();
          const x = header.x > 0 ? header.x - 3.2 : header.x + 3.2;
          ctx.translate(x + 16.1, header.start + i * 2.5 - 3.62);
          ctx.rotate(-Math.PI / 2);
          ctx.font = "1.05px monospace";
          ctx.fillText(name, 0, 0);
          ctx.restore();
        });
      ctx.strokeStyle = "#a2d5bf";
      ctx.lineWidth = 0.2;
      ctx.strokeRect(-8, -8, 17, 19);
      ctx.font = "1.25px monospace";
      ctx.fillText("DIGITAL / PWM", 15, 24);
      ctx.fillText("POWER", -15, -8);
      ctx.fillText("ANALOG IN", -14, 32);
    });
  }
  if (type === "board") {
    decal(scene, 0.165, 0.055, 0, 0.00913, 0, (ctx) => {
      ctx.fillStyle = "#4e6269";
      ctx.textAlign = "center";
      ctx.font = ".00145px monospace";
      for (let col = 0; col < BREADBOARD.columns; col++) {
        if (col !== 0 && (col + 1) % 5 !== 0 && col !== 62) continue;
        for (const z of [-0.0165, 0.0175])
          ctx.fillText(
            String(col + 1),
            BREADBOARD.firstColumnX + col * BREADBOARD.pitch,
            z,
          );
      }
      for (let side = 0; side < 2; side++)
        for (let row = 0; row < BREADBOARD.rowsPerSide; row++) {
          const z =
            (side ? 1 : -1) * (BREADBOARD.outerRowZ - row * BREADBOARD.pitch);
          for (const x of [-0.0804, 0.0804])
            ctx.fillText("abcdefghij"[side * 5 + row], x, z + 0.0005);
        }
    });
  }
  scene.traverse((mesh) => {
    if (!mesh.isMesh || mesh.isInstancedMesh || mesh.userData.surfaceDecal)
      return;
    const material = mesh.material;
    if (type === "board") {
      material.roughness = 0.68;
      material.metalness = 0;
    }
    if (type === "sensor") {
      const geometry = mesh.geometry.toNonIndexed();
      const position = geometry.attributes.position;
      const colors = [];
      for (let i = 0; i < position.count; i += 3) {
        const x =
          (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3;
        const y =
          (position.getY(i) + position.getY(i + 1) + position.getY(i + 2)) / 3;
        const z =
          (position.getZ(i) + position.getZ(i + 1) + position.getZ(i + 2)) / 3;
        const centerDistance = Math.min(
          Math.hypot(x - 12.5, y),
          Math.hypot(x + 12.5, y),
        );
        const color = new T.Color(
          z > 10 && centerDistance < 6
            ? "#343b40"
            : Math.abs(z) < 1.7
              ? "#146c91"
              : "#bbc5cb",
        );
        for (let j = 0; j < 3; j++) colors.push(color.r, color.g, color.b);
      }
      geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
      mesh.geometry.dispose();
      mesh.geometry = geometry;
      material.color.set("white");
      material.vertexColors = true;
      material.metalness = 0.45;
      material.roughness = 0.35;
    }

    if (type === "led" && mesh.name === "Funda") {
      mesh.material = new T.MeshPhysicalMaterial({
        color: "#ca182c",
        roughness: 0.17,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        transmission: 0.25,
        thickness: 0.07,
      });
      material.dispose();
    } else if (
      type === "led" ||
      mesh.name.startsWith("Pin") ||
      mesh.name === "pins" ||
      (type === "pot" && mesh.name !== "pot-0")
    ) {
      material.metalness = 0.78;
      material.roughness = 0.28;
    } else if (type === "servo") {
      material.roughness = 0.3;
      material.metalness = 0.05;
    }
  });
}
