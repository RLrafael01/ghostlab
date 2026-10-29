import * as T from "three";
import { loadCAD } from "./cad-models.js";

const previews = new Map();
let queue = Promise.resolve();
// One temporary WebGL context renders all cards, never one context per thumbnail.
export function componentPreview(type) {
  if (!previews.has(type)) {
    const pending = queue.then(async () => {
      const model = await loadCAD(type);
      let renderer;
      try {
        renderer = new T.WebGLRenderer({
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        });
        renderer.setSize(240, 150);
        renderer.setPixelRatio(1);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        const scene = new T.Scene();
        scene.add(model);
        scene.add(new T.HemisphereLight(0xffffff, 0x47515c, 2.5));
        const light = new T.DirectionalLight(0xffffff, 2.5);
        light.position.set(3, 5, 4);
        scene.add(light);
        const bounds = new T.Box3().setFromObject(model);
        const center = bounds.getCenter(new T.Vector3());
        const size = bounds.getSize(new T.Vector3()).length();
        const camera = new T.PerspectiveCamera(35, 240 / 150, 0.001, 100);
        camera.position
          .copy(center)
          .add(
            new T.Vector3(1, 1.3, 1.7).normalize().multiplyScalar(size * 1.8),
          );
        camera.lookAt(center);
        renderer.render(scene, camera);
        return renderer.domElement.toDataURL("image/png");
      } finally {
        model.traverse((object) => {
          if (object.isInstancedMesh) object.dispose();
          object.geometry?.dispose();
          object.material?.map?.dispose();
          object.material?.dispose();
        });
        renderer?.dispose();
        renderer?.forceContextLoss();
      }
    });
    const retryable = pending.catch((error) => {
      previews.delete(type);
      throw error;
    });
    previews.set(type, retryable);
    queue = retryable.catch(() => {});
  }
  return previews.get(type);
}
