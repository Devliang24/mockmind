import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/index.ts", "src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node20"
});
