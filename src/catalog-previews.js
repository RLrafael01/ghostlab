// Authored vector illustrations stay crisp without an additional WebGL context.
export function componentPreview(type) {
  return Promise.resolve(`${import.meta.env.BASE_URL}illustrations/${type}.svg`);
}
