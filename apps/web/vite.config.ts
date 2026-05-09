import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = "http://127.0.0.1:4000";

export default defineConfig({
  base: "/console/",
  plugins: [react()],
  build: {
    emptyOutDir: true
  },
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
