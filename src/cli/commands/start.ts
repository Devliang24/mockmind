import { loadConfig } from "../../config/loader.js";
import { providerRegistry } from "../../providers/registry.js";
import { createMockMindServer } from "../../server/create-server.js";

export async function startCommand(options: { config?: string; host?: string; port?: string | number }): Promise<void> {
  const config = loadConfig(options.config);
  if (options.host) config.server.host = options.host;
  if (options.port) config.server.port = Number(options.port);

  const { app } = await createMockMindServer(config);
  await app.listen({ host: config.server.host, port: config.server.port });

  const base = `http://${config.server.host}:${config.server.port}`;
  console.log("MockMind running\n");
  console.log(`Local:   ${base}`);
  console.log(`Health:  ${base}/health`);
  console.log(`Admin:   ${base}/__admin/requests`);
  console.log("\nOpenAI-compatible baseURL:");
  console.log(`  ${base}/v1`);
  console.log("\nEnabled providers:");
  for (const provider of providerRegistry) {
    console.log(`  ${provider.displayName}:`);
    for (const route of provider.routes) {
      console.log(`    ${route}`);
    }
  }
}
