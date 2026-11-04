import * as T from "three";

export function terminalPosition(item, name, occurrence = 0) {
  let point = null;
  let seen = 0;
  item.group.updateWorldMatrix(true, true);
  item.group.traverse((object) => {
    if (point) return;
    const index =
      object.userData.pinNames?.findIndex(
        (pin) => pin === name && seen++ === occurrence,
      ) ?? -1;
    if (index >= 0) {
      const matrix = new T.Matrix4();
      object.getMatrixAt(index, matrix);
      point = new T.Vector3().setFromMatrixPosition(matrix);
      object.localToWorld(point);
    } else if (object.userData.pinName === name && seen++ === occurrence) {
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
  let gesture = null,
    serial = 0;
  const handles = new T.Group();
  const endPosition = (end) =>
    end.item
      ? terminalPosition(end.item, end.pin, end.occurrence ?? 0)
      : end.position.clone();
  const cloneEnd = (end) => ({ ...end, position: end.position.clone() });
  function dispose(wire) {
    if (gesture?.wire === wire) gesture = null;
    for (const handle of wire.handles) {
      handles.remove(handle);
      handle.geometry.dispose();
      handle.material.dispose();
    }
    scene.remove(wire.mesh);
    wire.mesh.geometry.dispose();
    wire.mesh.material.dispose();
  }
  const api = {
    handles,
    addLoose(position, color = "#e9b640") {
      const wire = api.connect(null, null, null, null, color, 0.35);
      wire.ends[0].position.copy(position).add(new T.Vector3(-0.8, 0.12, 0));
      wire.ends[1].position.copy(position).add(new T.Vector3(0.8, 0.12, 0));
      return wire;
    },
    remove(id) {
      const index = wires.findIndex((wire) => wire.id === id);
      if (index < 0) return;
      dispose(wires[index]);
      wires.splice(index, 1);
    },
    get active() {
      return !!gesture;
    },
    snapshot() {
      return wires.map((wire) => ({
        id: wire.id,
        ends: wire.ends.map((end) => ({
          componentId: end.item?.id ?? null,
          pin: end.item ? end.pin : null,
          occurrence: end.item ? (end.occurrence ?? 0) : null,
          position: endPosition(end)?.toArray() ?? null,
        })),
      }));
    },
    begin(wire, index) {
      if (gesture || !wires.includes(wire)) return false;
      const original = cloneEnd(wire.ends[index]);
      const position = endPosition(original);
      if (!position) return false;
      gesture = { wire, index, original };
      wire.ends[index] = { item: null, pin: null, position };
      return true;
    },
    move(position) {
      if (gesture) gesture.wire.ends[gesture.index].position.copy(position);
    },
    finish(target) {
      if (!gesture) return;
      const { wire, index } = gesture;
      if (target && endPosition(target))
        wire.ends[index] = { ...target, position: endPosition(target) };
      gesture = null;
    },
    cancel() {
      if (!gesture) return;
      gesture.wire.ends[gesture.index] = gesture.original;
      gesture = null;
    },
    connect(from, fromPin, to, toPin, color, lift = 0.7) {
      const mesh = new T.Mesh(
        new T.BufferGeometry(),
        new T.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.08 }),
      );
      mesh.castShadow = true;
      scene.add(mesh, handles);
      const wire = {
        id: ++serial,
        mesh,
        lift,
        previous: "",
        ends: [
          { item: from, pin: fromPin, position: new T.Vector3() },
          { item: to, pin: toPin, position: new T.Vector3() },
        ],
        handles: [],
      };
      wire.ends.forEach((end, index) => {
        const handle = new T.Mesh(
          new T.BoxGeometry(0.09, 0.19, 0.09),
          new T.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.35,
            roughness: 0.4,
          }),
        );
        handle.userData.jumper = { wire, index };
        handles.add(handle);
        wire.handles.push(handle);
      });
      wires.push(wire);
      return wire;
    },
    removeFor(item) {
      for (let i = wires.length - 1; i >= 0; i--)
        if (
          wires[i].ends.some((end) => end.item === item) ||
          (gesture?.wire === wires[i] && gesture.original.item === item)
        ) {
          dispose(wires[i]);
          wires.splice(i, 1);
        }
    },
    update(delta = 1, reducedMotion = true) {
      for (const wire of wires) {
        const points = wire.ends.map((end, index) => {
          const target = endPosition(end);
          const handle = wire.handles[index];
          handle.visible = !!target;
          if (!target) return null;
          const elevated = target.clone();
          if (gesture?.wire === wire && gesture.index === index)
            elevated.y += 0.25;
          if (!handle.userData.placed || reducedMotion)
            handle.position.copy(elevated);
          else handle.position.lerp(elevated, 1 - Math.exp(-delta * 22));
          if (handle.position.distanceTo(elevated) < 0.0001)
            handle.position.copy(elevated);
          handle.userData.placed = true;
          return handle.position.clone();
        });
        const [a, b] = points;
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
  return api;
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
