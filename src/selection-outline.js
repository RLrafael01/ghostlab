import { Box3, Vector3 } from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export function createSelectionOutline(object) {
  const corners = [
    [-0.5, -0.5, -0.5],
    [0.5, -0.5, -0.5],
    [0.5, 0.5, -0.5],
    [-0.5, 0.5, -0.5],
    [-0.5, -0.5, 0.5],
    [0.5, -0.5, 0.5],
    [0.5, 0.5, 0.5],
    [-0.5, 0.5, 0.5],
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  const geometry = new LineSegmentsGeometry();
  geometry.setPositions(
    edges.flatMap(([start, end]) => [...corners[start], ...corners[end]]),
  );
  const outline = new LineSegments2(
    geometry,
    new LineMaterial({
      color: 0x79ffd5,
      linewidth: 1,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  outline.name = "selection-outline";
  outline.renderOrder = 100;
  const bounds = new Box3();
  const size = new Vector3();
  outline.update = () => {
    bounds.setFromObject(object);
    if (bounds.isEmpty()) return;
    bounds.getCenter(outline.position);
    bounds.getSize(size);
    // Leave space around small connectors so their color remains readable.
    outline.scale.copy(size).addScalar(0.08);
    outline.updateMatrixWorld(true);
  };
  outline.update();
  return outline;
}
