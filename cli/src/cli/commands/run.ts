import { Command } from "commander";
import { runSession } from "../../services/session.js";
import { getErrorMessage } from "../../lib/utils/errors.js";

export function registerRunCommand(program: Command): void {
  program
    .command("run")
    .description("Run a one-off agent session")
    .option("--cwd <path>", "Working directory to resolve config", process.cwd())
    .option("--image <ref>", "Direct image reference to use")
    .option("--profile <name>", "Image profile name to use")
    .option("--dry-run", "Print podman command without running")
    .allowUnknownOption(true)
    .passThroughOptions()
    .action(async (options, command) => {
      try {
        const rawArgs = command.args ?? [];
        const passthrough: string[] = [];
        let fallbackImage: string | undefined;
        let fallbackProfile: string | undefined;
        let fallbackDryRun = false;

        for (let i = 0; i < rawArgs.length; i += 1) {
          const arg = rawArgs[i];
          if (arg === "--") continue;
          if (arg === "--image") {
            fallbackImage = rawArgs[i + 1];
            i += 1;
            continue;
          }
          if (arg === "--profile") {
            fallbackProfile = rawArgs[i + 1];
            i += 1;
            continue;
          }
          if (arg === "--dry-run") {
            fallbackDryRun = true;
            continue;
          }
          passthrough.push(arg);
        }

        const exitCode = await runSession({
          cwd: options.cwd,
          mode: "one-off",
          imageReference: options.image ?? fallbackImage,
          imageProfile: options.profile ?? fallbackProfile,
          dryRun: Boolean(options.dryRun) || fallbackDryRun,
          command: passthrough.length > 0 ? passthrough : undefined,
        });
        process.exitCode = exitCode;
      } catch (err) {
        console.error(getErrorMessage(err));
        process.exitCode = 1;
      }
    });
}
