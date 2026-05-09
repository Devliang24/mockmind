import { defineProvider } from "../types.js";
import { minimaxPreset } from "./preset.js";
import { registerMiniMaxRoutes } from "./routes.js";

export const minimaxProvider = defineProvider({
  ...minimaxPreset,
  registerRoutes: registerMiniMaxRoutes
});
