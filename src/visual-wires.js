import * as T from "three";

export function terminalPosition(item, name) {
  let point = null;
  item.group.updateWorldMatrix(true, true);
  item.group.traverse((object) => {
    if (point) return;
    const index = object.userData.pinNames?.indexOf(name) ?? -1;
    if (index >= 0) {
      const matrix = new T.Matrix4();
      object.getMatrixAt(index, matrix);
      point = new T.Vector3().setFromMatrixPosition(matrix);
      object.localToWorld(point);
    } else if (object.userData.pinName === name) {
      object.geometry.computeBoundingBox();
      point = object.geometry.boundingBox.getCenter(new T.Vector3());
      object.localToWorld(point);
    }
  });
  return point;
}

// Visual jumpers only: no electrical connectivity or firmware behavior is inferred.
export function createVisualWires(scene) {
  const wires = [];
  function dispose(wire) {
    scene.remove(wire.mesh);
    wire.mesh.geometry.dispose();
    wire.mesh.material.dispose();
  }
  return {
    connect(from, fromPin, to, toPin, color, lift = 0.7) {
      const mesh = new T.Mesh(
        new T.BufferGeometry(),
        new T.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.08 }),
      );
      mesh.castShadow = true;
      scene.add(mesh);
      wires.push({ from, fromPin, to, toPin, mesh, lift, previous: "" });
    },
    removeFor(item) {
      for (let i = wires.length - 1; i >= 0; i--)
        if (wires[i].from === item || wires[i].to === item) {
          dispose(wires[i]);
          wires.splice(i, 1);
        }
    },
    update() {
      for (const wire of wires) {
        const a = terminalPosition(wire.from, wire.fromPin);
        const b = terminalPosition(wire.to, wire.toPin);
        if (!a || !b) {
          wire.mesh.visible = false;
          continue;
        }
        wire.mesh.visible = true;
        const signature = [...a.toArray(), ...b.toArray()].join(",");
        if (signature === wire.previous) continue;
        wire.previous = signature;
        const height = Math.max(a.y, b.y) + wire.lift;
        const curve = new T.CatmullRomCurve3([
          a,
          a.clone().add(new T.Vector3(0, 0.16, 0)),
          new T.Vector3(a.x, height, a.z),
          new T.Vector3(b.x, height, b.z),
          b.clone().add(new T.Vector3(0, 0.16, 0)),
          b,
        ]);
        wire.mesh.geometry.dispose();
        wire.mesh.geometry = new T.TubeGeometry(curve, 48, 0.025, 8, false);
      }
    },
  };
}

// Lowest vertices of a lead give a mounting reference, unlike its mesh center.
export function leadTip(item, name) {
  let result = null;
  item.group.updateWorldMatrix(true, true);
  item.group.traverse((object) => {
    if (result || object.userData.pinName !== name || !object.isMesh) return;
    const positions = object.geometry.attributes.position;
    const points = [];
    let lowest = Infinity;
    for (let i = 0; i < positions.count; i++) {
      const point = new T.Vector3()
        .fromBufferAttribute(positions, i)
        .applyMatrix4(object.matrixWorld);
      points.push(point);
      lowest = Math.min(lowest, point.y);
    }
    const tips = points.filter((point) => point.y < lowest + 0.0001);
    result = tips
      .reduce((sum, point) => sum.add(point), new T.Vector3())
      .divideScalar(tips.length);
  });
  return result;
}
