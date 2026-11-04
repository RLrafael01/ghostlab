import { Box3, MathUtils, Vector3 } from "three";

export const BOARD_SCALE_LIMITS = Object.freeze({ min: 0.5, max: 2 });

export function createBoardResize(board, cornerSigns, items, mountPoint) {
  const group = board.group;
  const bounds = new Box3().setFromObject(group);
  if (bounds.isEmpty()) return null;
  const corner = new Vector3(
    cornerSigns.x > 0 ? bounds.max.x : bounds.min.x,
    bounds.min.y,
    cornerSigns.z > 0 ? bounds.max.z : bounds.min.z,
  );
  const anchor = new Vector3(
    cornerSigns.x > 0 ? bounds.min.x : bounds.max.x,
    bounds.min.y,
    cornerSigns.z > 0 ? bounds.min.z : bounds.max.z,
  );
  const diagonal = corner.clone().sub(anchor);
  if (diagonal.lengthSq() < 1e-10) return null;
  const originalPosition = group.position.clone();
  const originalScale = group.scale.clone();
  const originalWorldPosition = group.getWorldPosition(new Vector3());
  const attachments = items
    .filter((item) => item.mountedTo === board)
    .map((item) => {
      const worldMount =
        mountPoint(item)?.clone() ?? item.group.getWorldPosition(new Vector3());
      return {
        item,
        position: item.group.position.clone(),
        worldPosition: item.group.getWorldPosition(new Vector3()),
        worldMount,
        localMount: group.worldToLocal(worldMount.clone()),
      };
    });

  return {
    corner,
    anchor,
    planeY: bounds.min.y,
    move(worldPoint) {
      const offset = worldPoint.clone().sub(anchor);
      offset.y = 0;
      const requestedScale =
        (originalScale.x * offset.dot(diagonal)) / diagonal.lengthSq();
      const scale = MathUtils.clamp(
        requestedScale,
        BOARD_SCALE_LIMITS.min,
        BOARD_SCALE_LIMITS.max,
      );
      const factor = scale / originalScale.x;
      const worldPosition = originalWorldPosition
        .clone()
        .sub(anchor)
        .multiplyScalar(factor)
        .add(anchor);
      group.scale.copy(originalScale).multiplyScalar(factor);
      group.position.copy(
        group.parent ? group.parent.worldToLocal(worldPosition) : worldPosition,
      );
      group.updateWorldMatrix(true, true);
      for (const attachment of attachments) {
        const target = group.localToWorld(attachment.localMount.clone());
        const position = attachment.worldPosition
          .clone()
          .add(target.sub(attachment.worldMount));
        const child = attachment.item.group;
        child.position.copy(
          child.parent ? child.parent.worldToLocal(position) : position,
        );
        child.updateWorldMatrix(true, true);
      }
      return scale;
    },
    cancel() {
      group.position.copy(originalPosition);
      group.scale.copy(originalScale);
      group.updateWorldMatrix(true, true);
      for (const attachment of attachments) {
        attachment.item.group.position.copy(attachment.position);
        attachment.item.group.updateWorldMatrix(true, true);
      }
    },
  };
}
