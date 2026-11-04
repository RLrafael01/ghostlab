import { Box3, Plane, Vector3 } from "three";

// Treat the breadboard as a support surface, including its holes and center slot.
export function jumperPlacementPoint(raycaster, items) {
  for (const item of items) item.group.updateWorldMatrix(true, true);
  let point =
    raycaster.intersectObjects(
      items.map((item) => item.group),
      true,
    )[0]?.point ??
    raycaster.ray.intersectPlane(
      new Plane(new Vector3(0, 1, 0), 0),
      new Vector3(),
    );
  for (const item of items) {
    if (item.type !== "board") continue;
    const bounds = new Box3().setFromObject(item.group);
    const top = raycaster.ray.intersectPlane(
      new Plane(new Vector3(0, 1, 0), -bounds.max.y),
      new Vector3(),
    );
    if (
      !top ||
      top.x < bounds.min.x ||
      top.x > bounds.max.x ||
      top.z < bounds.min.z ||
      top.z > bounds.max.z
    )
      continue;
    if (
      !point ||
      top.distanceToSquared(raycaster.ray.origin) <
        point.distanceToSquared(raycaster.ray.origin)
    )
      point = top;
  }
  return point;
}
