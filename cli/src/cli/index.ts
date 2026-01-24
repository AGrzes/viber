import { Command } from "commander";
import { registerConfigCommand } from "./commands/config.js";
import { registerStartCommand } from "./commands/start.js";

const program = new Command();

program
  .name("viber")
  .description("Private orchestration CLI")
  .version("0.1.0");

registerStartCommand(program);
registerConfigCommand(program);

program.parseAsync(process.argv);
