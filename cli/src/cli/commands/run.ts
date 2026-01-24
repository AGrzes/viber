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
        const passthrough = (command.args ?? []).filter((arg: string) => arg !== "--");

        const exitCode = await runSession({
          cwd: options.cwd,
          mode: "one-off",
          imageReference: options.image,
          imageProfile: options.profile,
          dryRun: Boolean(options.dryRun),
          command: passthrough.length > 0 ? passthrough : undefined,
        });
        process.exitCode = exitCode;
      } catch (err) {
        console.error(getErrorMessage(err));
        process.exitCode = 1;
      }
    });
}
