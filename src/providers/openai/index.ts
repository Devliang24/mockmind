import { defineProvider } from "../types.js";
import { openaiPreset } from "./preset.js";
import { registerOpenAIRoutes } from "./routes.js";

export const openaiProvider = defineProvider({
  ...openaiPreset,
  registerRoutes: registerOpenAIRoutes
});
