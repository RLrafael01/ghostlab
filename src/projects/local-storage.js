import { parseProject, serializeProject } from "./schema.js";

const key = "ghostlab.project.v1";

export function saveLocalProject(storage, project) {
  const json = serializeProject(project);
  storage.setItem(key, json);
  return json;
}

export function readLocalProject(storage) {
  const json = storage.getItem(key);
  if (json === null) throw new Error("Nenhum projeto salvo neste navegador.");
  return parseProject(json);
}
