import { Box3, MathUtils, Vector3 } from "three";
import {
  BREADBOARD,
  BOARD_COLUMN_LIMITS,
  breadboardLayout,
} from "./breadboard-layout.js";
import { replaceBreadboard } from "./parametric-board.js";
import { placeComponent } from "./component-placement.js";

export { BOARD_COLUMN_LIMITS } from "./breadboard-layout.js";

export function createBoardResize(
  board,
  cornerSigns,
  items,
  mountPoint,
  wires,
) {
  const group = board.group;
  const bounds = new Box3().setFromObject(group);
  if (bounds.isEmpty()) return null;
  const direction = cornerSigns.x > 0 ? 1 : -1;
  const corner = new Vector3(
    direction > 0 ? bounds.max.x : bounds.min.x,
    bounds.min.y,
    (bounds.min.z + bounds.max.z) / 2,
  );
  const anchor = new Vector3(
    direction > 0 ? bounds.min.x : bounds.max.x,
    bounds.min.y,
    corner.z,
  );
  const originalColumns =
    board.columns ?? group.children[0]?.userData.columns ?? BREADBOARD.columns;
  const originalLayout = breadboardLayout(originalColumns);
  const originalPosition = group.position.clone();
  const originalWorldPosition = group.getWorldPosition(new Vector3());
  const originalFirstColumn = group.localToWorld(
    new Vector3(originalLayout.firstColumnX, 0, 0),
  );
  const connections = wires?.captureFor(board);
  const attachments = items
    .filter(
      (item) =>
        item.type !== "board" &&
        (item.mountedTo === board || !mountPoint(item)),
    )
    .map((item) => {
      const pin = mountPoint(item);
      const worldMount =
        pin?.clone() ?? item.group.getWorldPosition(new Vector3());
      const localMount = group.worldToLocal(worldMount.clone());
      return {
        item,
        mountedTo: item.mountedTo,
        hasMountPin: !!pin,
        position: item.group.position.clone(),
        worldPosition: item.group.getWorldPosition(new Vector3()),
        worldMount,
        localMount,
        column:
          Math.round(
            (localMount.x - originalLayout.firstColumnX) / originalLayout.pitch,
          ) + 1,
      };
    });
  let currentColumns = originalColumns;

  return {
    corner,
    anchor,
    planeY: bounds.min.y,
    move(worldPoint) {
      const columns = MathUtils.clamp(
        Math.round(
          originalColumns +
            ((worldPoint.x - corner.x) * direction) / originalLayout.pitch,
        ),
        BOARD_COLUMN_LIMITS.min,
        BOARD_COLUMN_LIMITS.max,
      );
      if (columns === currentColumns) return columns;
      const layout = breadboardLayout(columns);
      replaceBreadboard(board, columns);
      currentColumns = columns;
      const worldPosition = originalWorldPosition.clone();
      worldPosition.x +=
        (direction * (layout.width - originalLayout.width)) / 2;
      group.position.copy(
        group.parent ? group.parent.worldToLocal(worldPosition) : worldPosition,
      );
      group.updateWorldMatrix(true, true);
      const firstColumnShift = group
        .localToWorld(new Vector3(layout.firstColumnX, 0, 0))
        .sub(originalFirstColumn);
      for (const attachment of attachments) {
        const child = attachment.item.group;
        let position;
        if (attachment.mountedTo !== board) {
          position = attachment.worldPosition.clone();
        } else if (attachment.column < 1 || attachment.column > columns) {
          attachment.item.mountedTo = null;
          position = attachment.worldPosition.clone().add(firstColumnShift);
          position.y = 0;
        } else {
          attachment.item.mountedTo = board;
          const localMount = attachment.localMount.clone();
          localMount.x += layout.firstColumnX - originalLayout.firstColumnX;
          const target = group.localToWorld(localMount);
          position = attachment.worldPosition
            .clone()
            .add(target.sub(attachment.worldMount));
        }
        child.position.copy(
          child.parent ? child.parent.worldToLocal(position) : position,
        );
        child.updateWorldMatrix(true, true);
        // A casing resting on the board is supported by its footprint, not by
        // a fictional hole column. This also handles growth beneath loose parts.
        if (!attachment.hasMountPin)
          placeComponent(attachment.item, items, false);
      }
      connections?.sync();
      return columns;
    },
    cancel() {
      if (currentColumns !== originalColumns)
        replaceBreadboard(board, originalColumns);
      currentColumns = originalColumns;
      group.position.copy(originalPosition);
      group.updateWorldMatrix(true, true);
      for (const attachment of attachments) {
        attachment.item.mountedTo = attachment.mountedTo;
        attachment.item.group.position.copy(attachment.position);
        attachment.item.group.updateWorldMatrix(true, true);
      }
      connections?.restore();
    },
  };
}
