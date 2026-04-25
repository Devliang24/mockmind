import { defineProvider } from "../types.js";
import { zhipuPreset } from "./preset.js";
import { registerZhipuRoutes } from "./routes.js";

export const zhipuProvider = defineProvider({
  ...zhipuPreset,
  registerRoutes: registerZhipuRoutes
});
