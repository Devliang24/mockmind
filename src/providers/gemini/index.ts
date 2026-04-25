import { defineProvider } from "../types.js";
import { geminiPreset } from "./preset.js";
import { registerGeminiRoutes } from "./routes.js";

export const geminiProvider = defineProvider({
  ...geminiPreset,
  registerRoutes: registerGeminiRoutes
});
