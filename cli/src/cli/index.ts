import { Command } from "commander";

const program = new Command();

program
  .name("viber")
  .description("Private orchestration CLI")
  .version("0.1.0");

program.parseAsync(process.argv);
