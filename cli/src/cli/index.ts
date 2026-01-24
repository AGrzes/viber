import { Command } from "commander";
import { registerStartCommand } from "./commands/start.js";

const program = new Command();

program
  .name("viber")
  .description("Private orchestration CLI")
  .version("0.1.0");

registerStartCommand(program);

program.parseAsync(process.argv);
