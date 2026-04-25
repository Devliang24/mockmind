import { defineProvider } from "../types.js";
import { aliyunBailianPreset } from "./preset.js";
import { registerAliyunBailianRoutes } from "./routes.js";

export const aliyunBailianProvider = defineProvider({
  ...aliyunBailianPreset,
  registerRoutes: registerAliyunBailianRoutes
});
