import { defineProvider } from "../types.js";
import { azurePreset } from "./preset.js";
import { registerAzureRoutes } from "./routes.js";

export const azureProvider = defineProvider({
  ...azurePreset,
  registerRoutes: registerAzureRoutes
});
