import fs from "fs-extra";
import { LoggerInstance } from "./Logger.instance.js";
import path from "path";

let createdDirectory = false;
const logDir = path.join(process.env.PWD ?? "", "logs");
if (!fs.existsSync(logDir)) {
  createdDirectory = true;
  fs.mkdirSync(logDir);
}

export const Logger = new LoggerInstance("main", "🧾");

process.on("warning", (warning) => {
  Logger.warn(warning.message);
  Logger.warn(warning.stack);
});

process.on("exit", (code) => {
  Logger.out(`${Logger.name} exiting with code ${code}`);
});

process.on("uncaughtException", (error, origin) => {
  Logger.err(error.name);
  Logger.err(origin);
  Logger.err(error.message);
  Logger.err(error.stack);
  Logger.err("EXITING PROCESS");

  process.exit(1);
});

const start = new Date();

Logger.debug(`argv: [${process.argv}]`);
Logger.debug(
  createdDirectory
    ? `Creating logs directory at ${logDir}`
    : "Logs directory found"
);
Logger.debug("----- Process info -----");
Logger.debug(`START TIME - ${start.toString()}`);
Logger.debug(`PLATFORM - ${process.platform} ${process.arch}`);
Logger.debug(`PID - ${process.pid}\nCWD - ${process.cwd()}`);
Logger.debug(
  `NODE VERSION - ${process.versions.node}\nV8 VERSION - ${process.versions.v8}`
);

Logger.debug("------------------------");

export default Logger;
export * from "./Logger.instance.js";
