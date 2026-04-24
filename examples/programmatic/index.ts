import { createMockLLMServer } from "mockmind";

const server = await createMockLLMServer({
  port: 4000,
  config: {
    scenarios: [{
      id: "programmatic-hello",
      provider: "openai",
      endpoint: "/v1/chat/completions",
      priority: 0,
      match: { messagesContain: "hello" },
      response: { type: "text", content: "Hello from programmatic MockMind." }
    }]
  }
});

await server.start();
console.log(`MockMind running at ${server.url}`);

process.on("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});
