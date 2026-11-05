import { defineConfig } from "vite";
import { compilerMiddleware } from "./server/compiler-http.js";
export default defineConfig({
  plugins: [
    {
      name: "ghostlab-local-compiler",
      configureServer(server) {
        server.middlewares.use(compilerMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(compilerMiddleware);
      },
    },
  ],
  build: {
    rollupOptions: { input: { main: "index.html", pilot: "pilot.html" } },
  },
});
