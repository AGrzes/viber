import { Command } from "commander";
import { CliError, getErrorMessage } from "../../lib/utils/errors.js";
import {
  deleteEnvMapping,
  getEnvMapping,
  listEnvMappings,
  setEnvMapping,
  type EnvMappingScope,
} from "../../lib/config/envMappingsStore.js";

function resolveScope(options: { global?: boolean }): EnvMappingScope {
  return options.global ? "global" : "project";
}

function parseAssignment(input: string): { key: string; value: string } {
  const index = input.indexOf("=");
  if (index <= 0) {
    throw new CliError("Expected assignment in the form KEY=value");
  }
  return {
    key: input.slice(0, index),
    value: input.slice(index + 1),
  };
}

export function registerEnvCommand(program: Command): void {
  const env = program.command("env").description("Manage env mappings");

  env
    .command("list")
    .description("List env mappings (project scope by default)")
    .option("--global", "Use global scope")
    .option("--cwd <path>", "Working directory to resolve project config", process.cwd())
    .action(async (options) => {
      try {
        const scope = resolveScope(options);
        const items = await listEnvMappings(scope, options.cwd);
        if (items.length === 0) {
          console.log("No env mappings defined.");
          return;
        }
        for (const entry of items) {
          console.log(`${entry.key}=${entry.value}`);
        }
      } catch (err) {
        console.error(getErrorMessage(err));
        process.exitCode = 1;
      }
    });

  env
    .command("get")
    .description("Get an env mapping (project scope by default)")
    .argument("<key>", "Mapping key")
    .option("--global", "Use global scope")
    .option("--cwd <path>", "Working directory to resolve project config", process.cwd())
    .action(async (key: string, options) => {
      try {
        const scope = resolveScope(options);
        const entry = await getEnvMapping(scope, key, options.cwd);
        if (!entry) {
          throw new CliError(`Env mapping not found: ${key}`);
        }
        console.log(entry.value);
      } catch (err) {
        console.error(getErrorMessage(err));
        process.exitCode = 1;
      }
    });

  env
    .command("set")
    .description("Set an env mapping (project scope by default)")
    .argument("<assignment>", "KEY=value")
    .option("--global", "Use global scope")
    .option("--cwd <path>", "Working directory to resolve project config", process.cwd())
    .action(async (assignment: string, options) => {
      try {
        const scope = resolveScope(options);
        const { key, value } = parseAssignment(assignment);
        await setEnvMapping(scope, key, value, options.cwd);
        console.log(`Saved env mapping: ${key}`);
      } catch (err) {
        console.error(getErrorMessage(err));
        process.exitCode = 1;
      }
    });

  env
    .command("delete")
    .description("Delete an env mapping (project scope by default)")
    .argument("<key>", "Mapping key")
    .option("--global", "Use global scope")
    .option("--cwd <path>", "Working directory to resolve project config", process.cwd())
    .action(async (key: string, options) => {
      try {
        const scope = resolveScope(options);
        await deleteEnvMapping(scope, key, options.cwd);
        console.log(`Deleted env mapping: ${key}`);
      } catch (err) {
        console.error(getErrorMessage(err));
        process.exitCode = 1;
      }
    });
}
