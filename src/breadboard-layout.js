// Coordinates in meters match the original 830-contact board's 2.54 mm pitch.
export const BREADBOARD = Object.freeze({
  columns: 63,
  rowsPerSide: 5,
  pitch: 0.00254,
  outerRowZ: 0.01397,
  sceneScale: 44.5,
});

export const BOARD_COLUMN_LIMITS = Object.freeze({ min: 10, max: 126 });

export function breadboardLayout(requestedColumns = BREADBOARD.columns) {
  const columns = Math.max(
    BOARD_COLUMN_LIMITS.min,
    Math.min(
      BOARD_COLUMN_LIMITS.max,
      Number.isFinite(requestedColumns)
        ? Math.round(requestedColumns)
        : BREADBOARD.columns,
    ),
  );
  const pitch = BREADBOARD.pitch * BREADBOARD.sceneScale;
  const firstColumnX = -((columns - 1) * pitch) / 2;
  const railCount = Math.floor((columns - 3) / 6) * 5;
  const topY = 0.425;
  const terminals = [];
  for (let side = 0; side < 2; side++) {
    const sign = side ? 1 : -1;
    for (let row = 0; row < BREADBOARD.rowsPerSide; row++)
      for (let column = 0; column < columns; column++)
        terminals.push({
          name: `${"abcdefghij"[side * 5 + row]}${column + 1}`,
          electricalGroup: `strip:${side}:${column + 1}`,
          position: [
            firstColumnX + column * pitch,
            topY,
            sign *
              (BREADBOARD.outerRowZ - row * BREADBOARD.pitch) *
              BREADBOARD.sceneScale,
          ],
        });
    for (let rail = 0; rail < 2; rail++)
      for (let column = 0; column < railCount; column++)
        terminals.push({
          name: `${side ? "Inferior" : "Superior"} ${rail ? "−" : "+"} ${column + 1}`,
          electricalGroup: `rail:${side}:${rail}`,
          position: [
            firstColumnX + (1.5 + column + Math.floor(column / 5)) * pitch,
            topY,
            sign * (0.020995 + rail * BREADBOARD.pitch) * BREADBOARD.sceneScale,
          ],
        });
  }
  return {
    columns,
    pitch,
    firstColumnX,
    width: columns * pitch + 0.23,
    depth: 2.45,
    bottomY: 0.02,
    topY,
    holeSize: 0.048,
    railCount,
    contactCount: terminals.length,
    terminals,
  };
}
