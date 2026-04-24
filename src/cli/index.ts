#!/usr/bin/env node
import { Command } from "commander";
import { ZodError } from "zod";
import { validateConfig } from "../config/loader.js";
import { initConfig } from "./commands/init.js";
import { startCommand } from "./commands/start.js";

const program = new Command();

program
  .name("mockmind")
  .description("A TypeScript mock server for OpenAI-compatible and LLM provider APIs")
  .version("0.1.0");

program
  .command("start")
  .description("Start the mock server")
  .option("-c, --config <file>", "config file", "mockmind.yaml")
  .option("--host <host>", "host override")
  .option("-p, --port <port>", "port override")
  .option("--all", "start all implemented protocols (default)")
  .action(async (options) => {
    try {
      await startCommand(options);
    } catch (error) {
      printError(error);
      process.exitCode = 1;
    }
  });

program
  .command("init")
  .description("Create a mockmind.yaml config file")
  .option("-o, --output <file>", "output file", "mockmind.yaml")
  .option("--force", "overwrite existing file", false)
  .option("--all", "generate all-provider sample config", false)
  .action((options) => {
    try {
      initConfig(options.output, options.force);
      console.log(`Created ${options.output}`);
    } catch (error) {
      printError(error);
      process.exitCode = 1;
    }
  });

program
  .command("validate")
  .description("Validate a config file")
  .option("-c, --config <file>", "config file", "mockmind.yaml")
  .action((options) => {
    try {
      validateConfig(options.config);
      console.log("Config is valid");
    } catch (error) {
      printError(error);
      process.exitCode = 1;
    }
  });

function printError(error: unknown): void {
  if (error instanceof ZodError) {
    console.error("Config validation failed");
    for (const issue of error.issues) {
      console.error(`- ${issue.path.join(".") || "root"}: ${issue.message}`);
    }
    return;
  }
  console.error(error instanceof Error ? error.message : String(error));
}

program.parseAsync();
