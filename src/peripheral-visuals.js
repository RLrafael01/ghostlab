import * as T from "three";

export function preparePeripheralVisual(item) {
  if (item.type === "button") {
    const cap = item.group.getObjectByName("button-4");
    if (!cap) return { update() {} };
    item.group.updateWorldMatrix(true, true);
    cap.userData.peripheralControl = "button";
    const rest = cap.position.clone();
    const relative = cap.parent.matrixWorld
      .clone()
      .invert()
      .multiply(item.group.matrixWorld);
    const offset = new T.Vector3(0, -0.03, 0)
      .applyMatrix4(relative)
      .sub(new T.Vector3().applyMatrix4(relative));
    let depression = 0;
    return {
      update(deltaSeconds) {
        const target = item.pressed ? 1 : 0;
        const step = Math.max(0, deltaSeconds) * 20;
        depression += T.MathUtils.clamp(target - depression, -step, step);
        cap.position.copy(rest).addScaledVector(offset, depression);
        cap.updateWorldMatrix(true, true);
      },
    };
  }
  if (item.type === "pot") {
    const shaft = item.group.getObjectByName("pot-2");
    if (!shaft) return { update() {} };
    item.group.updateWorldMatrix(true, true);
    shaft.geometry.computeBoundingBox();
    const relative = item.group.matrixWorld
      .clone()
      .invert()
      .multiply(shaft.matrixWorld);
    const bounds = shaft.geometry.boundingBox.clone().applyMatrix4(relative);
    const pivot = new T.Group();
    pivot.position.copy(bounds.getCenter(new T.Vector3()));
    item.group.add(pivot);
    pivot.updateWorldMatrix(true, true);
    pivot.attach(shaft);
    shaft.userData.peripheralControl = "pot";
    const pointer = new T.Mesh(
      new T.BoxGeometry(0.025, 0.018, 0.12),
      new T.MeshStandardMaterial({ color: "#77ead0", roughness: 0.35 }),
    );
    pointer.name = "pot-pointer";
    pointer.userData.peripheralControl = "pot";
    pointer.position.set(0, bounds.max.y - pivot.position.y + 0.012, -0.055);
    pivot.add(pointer);
    return {
      update() {
        const value = Number.isFinite(item.value)
          ? T.MathUtils.clamp(item.value, 0, 1)
          : 0.5;
        pivot.rotation.y = (value - 0.5) * Math.PI * 1.5;
        pivot.updateWorldMatrix(true, true);
      },
    };
  }
  if (item.type === "servo") {
    const shaft = item.group.getObjectByName("servo-0");
    if (!shaft) return { update() {} };
    item.group.updateWorldMatrix(true, true);
    shaft.geometry.computeBoundingBox();
    const relative = item.group.matrixWorld
      .clone()
      .invert()
      .multiply(shaft.matrixWorld);
    const bounds = shaft.geometry.boundingBox.clone().applyMatrix4(relative);
    const pivot = new T.Group();
    pivot.position.copy(bounds.getCenter(new T.Vector3()));
    item.group.add(pivot);
    pivot.updateWorldMatrix(true, true);
    pivot.attach(shaft);
    const material = new T.MeshStandardMaterial({
      color: "#f6f3e9",
      roughness: 0.45,
    });
    const horn = new T.Mesh(new T.BoxGeometry(0.42, 0.04, 0.09), material);
    horn.name = "servo-horn";
    horn.position.set(0.16, bounds.max.y - pivot.position.y + 0.026, 0);
    const hub = new T.Mesh(
      new T.CylinderGeometry(0.1, 0.1, 0.05, 24),
      material.clone(),
    );
    hub.position.y = horn.position.y;
    pivot.add(horn, hub);
    let angle = 90;
    let gate;
    function updateGate() {
      if (!item.gate) return;
      if (!gate) {
        angle = 0;
        gate = new T.Group();
        gate.name = "gate-arm";
        gate.position.copy(pivot.position);
        gate.position.y += horn.position.y;
        for (let index = 0; index < 8; index++) {
          const stripe = new T.Mesh(
            new T.BoxGeometry(0.22, 0.1, 0.1),
            new T.MeshStandardMaterial({
              color: index % 2 ? "#f4eee3" : "#d63734",
            }),
          );
          stripe.position.x = 0.11 + index * 0.22;
          gate.add(stripe);
        }
        item.group.add(gate);
      }
    }
    pivot.rotation.y = Math.PI / 2;
    pivot.updateWorldMatrix(true, true);
    return {
      update(deltaSeconds, state) {
        updateGate();
        if (state?.active && Number.isFinite(state.angle)) {
          const target = T.MathUtils.clamp(state.angle, 0, 180);
          const step = Math.max(0, deltaSeconds) * 300;
          angle += T.MathUtils.clamp(target - angle, -step, step);
          pivot.rotation.y = (angle * Math.PI) / 180;
          pivot.updateWorldMatrix(true, true);
        }
        if (gate) gate.rotation.z = T.MathUtils.degToRad(angle);
      },
    };
  }
  return { update() {} };
}
