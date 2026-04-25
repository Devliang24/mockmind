import { defineProvider } from "../types.js";
import { deepseekPreset } from "./preset.js";
import { registerDeepSeekRoutes } from "./routes.js";

export const deepseekProvider = defineProvider({
  ...deepseekPreset,
  registerRoutes: registerDeepSeekRoutes
});
