import { defineProvider } from "../types.js";
import { moonshotPreset } from "./preset.js";
import { registerMoonshotRoutes } from "./routes.js";

export const moonshotProvider = defineProvider({
  ...moonshotPreset,
  registerRoutes: registerMoonshotRoutes
});
