// Offline conversion; OpenCascade/WASM is never shipped to the browser.
import fs from "node:fs/promises";
import * as T from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import occtFactory from "occt-import-js";
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};
const occt = await occtFactory();
for (const type of ["servo", "button", "pot", "led", "resistor", "sensor"]) {
  const result = occt.ReadStepFile(
    await fs.readFile(`assets/cad/${type}.step`),
    {
      linearUnit: "millimeter",
      linearDeflectionType: "absolute_value",
      linearDeflection: 0.08,
      angularDeflection: 0.35,
    },
  );
  if (!result.success) throw new Error(`Cannot convert ${type}`);
  const group = new T.Group();
  for (const [index, part] of result.meshes.entries()) {
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(part.attributes.position.array, 3),
    );
    geometry.setAttribute(
      "normal",
      new T.Float32BufferAttribute(part.attributes.normal.array, 3),
    );
    geometry.setIndex(part.index.array);
    const color = new T.Color().fromArray(part.color ?? [0.25, 0.25, 0.25]);
    if (type === "led" && index === 0) color.set("#e8313e");
    const material = new T.MeshStandardMaterial({
      color,
      roughness: 0.38,
      metalness: 0.15,
    });
    const mesh = new T.Mesh(geometry, material);
    mesh.name = part.name || `${type}-${index}`;
    group.add(mesh);
  }
  const output = await new GLTFExporter().parseAsync(group, { binary: true });
  await fs.writeFile(`public/models/${type}.glb`, Buffer.from(output));
  console.log(`${type}: ${Math.round(output.byteLength / 1024)} KiB`);
}
