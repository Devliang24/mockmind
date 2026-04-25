import { defineProvider } from "../types.js";
import { anthropicPreset } from "./preset.js";
import { registerAnthropicRoutes } from "./routes.js";

export const anthropicProvider = defineProvider({
  ...anthropicPreset,
  registerRoutes: registerAnthropicRoutes
});
