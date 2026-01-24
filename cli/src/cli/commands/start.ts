import { Command } from "commander";
import { runSession } from "../../services/session.js";
import { getErrorMessage } from "../../lib/utils/errors.js";

export function registerStartCommand(program: Command): void {
  program
    .command("start")
    .description("Start an interactive agent session")
    .option("--cwd <path>", "Working directory to resolve config", process.cwd())
    .option("--dry-run", "Print podman command without running")
    .action(async (options) => {
      try {
        const exitCode = await runSession({
          cwd: options.cwd,
          mode: "interactive",
          dryRun: Boolean(options.dryRun),
        });
        process.exitCode = exitCode;
      } catch (err) {
        console.error(getErrorMessage(err));
        process.exitCode = 1;
      }
    });
}
