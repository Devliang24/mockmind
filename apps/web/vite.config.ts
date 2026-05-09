import { defineConfig } from "vite";

const backend = "http://127.0.0.1:4000";

export default defineConfig({
  base: "/console/",
  server: {
    proxy: {
      "/health": backend,
      "/__admin": backend,
      "/v1": backend,
      "/chat": backend,
      "/api": backend,
      "/compatible-mode": backend,
      "/compatible-api": backend
    }
  }
});
