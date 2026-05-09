import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/index.ts", "src/index.ts"],
  format: ["esm", "cjs"],
  external: ["better-sqlite3"],
  dts: false,
  sourcemap: true,
  clean: true,
  target: "node20"
});
