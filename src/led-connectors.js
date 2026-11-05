import * as T from "three";
import { leadTip } from "./visual-wires.js";

// Visible connection guides keep the CAD's buried lead centers out of the interaction.
export function addLedConnectors(model) {
  const lens = model.getObjectByName("Funda");
  if (!lens) return;
  model.updateWorldMatrix(true, true);
  const bounds = new T.Box3().setFromObject(lens);
  for (const [name, pin, sign, color] of [
    ["Anodo", "Ânodo +", 1, "#ff7784"],
    ["Catodo", "Cátodo −", -1, "#7ac8ff"],
  ]) {
    const lead = model.getObjectByName(name);
    if (!lead) continue;
    const tip = leadTip({ group: model }, pin);
    if (!tip) continue;
    const position = new T.Vector3(
      (sign > 0 ? bounds.max.x : bounds.min.x) + sign * 0.18,
      bounds.min.y + 0.1,
      tip.z,
    );
    lead.userData.connectionPoint = lead
      .worldToLocal(position.clone())
      .toArray();
    const guide = new T.Line(
      new T.BufferGeometry().setFromPoints([
        model.worldToLocal(tip),
        model.worldToLocal(position.clone()),
      ]),
      new T.LineDashedMaterial({
        color,
        dashSize: 0.025,
        gapSize: 0.018,
        depthTest: false,
      }),
    );
    guide.computeLineDistances();
    guide.userData.connectionGuide = true;
    guide.renderOrder = 5;
    guide.raycast = () => {};
    const target = new T.Mesh(
      new T.TorusGeometry(0.075, 0.012, 8, 24),
      new T.MeshBasicMaterial({ color }),
    );
    target.position.copy(model.worldToLocal(position.clone()));
    target.rotation.x = Math.PI / 2;
    target.userData.pinName = pin;
    target.userData.connectionTarget = true;
    // The ring denotes a filled drop target: rays through its opening must not
    // fall through to a breadboard contact behind the LED connector.
    const hitArea = new T.Mesh(
      new T.CircleGeometry(0.075, 32),
      new T.MeshBasicMaterial({ side: T.DoubleSide }),
    );
    hitArea.visible = false;
    hitArea.userData.pinName = pin;
    hitArea.userData.connectionTarget = true;
    target.add(hitArea);
    model.add(guide, target);
    const material = new T.MeshBasicMaterial({ color });
    const minus = new T.Mesh(new T.BoxGeometry(0.065, 0.008, 0.014), material);
    minus.position.copy(target.position).add(new T.Vector3(sign * 0.14, 0, 0));
    minus.userData.pinName = pin;
    minus.userData.connectionTarget = true;
    model.add(minus);
    if (sign > 0) {
      const upright = new T.Mesh(
        new T.BoxGeometry(0.014, 0.008, 0.065),
        material.clone(),
      );
      upright.position.copy(minus.position);
      upright.userData.pinName = pin;
      upright.userData.connectionTarget = true;
      model.add(upright);
    }
  }
}
