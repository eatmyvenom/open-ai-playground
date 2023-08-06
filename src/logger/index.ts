import fs from "fs-extra";
import { LoggerInstance } from "./Logger.instance.js";
import path from "path";

const start = new Date();

let createdDirectory = false;
const logDir = path.join(process.env.PWD ?? "", "logs");
if (!fs.existsSync(logDir)) {
  createdDirectory = true;
  fs.mkdirSync(logDir);
}

export const Logger = new LoggerInstance("main", "🧾");

export function bindProcessEvents() {
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
}

export function logDebugInfo() {
  Logger.debug(`argv: [${process.argv}]`);
  Logger.verbose(
    createdDirectory
      ? `Creating logs directory at ${logDir}`
      : "Logs directory found"
  );
  Logger.debug("----- Process info -----");
  Logger.debug(`START TIME - ${start.toString()}`);
  Logger.verbose(`PLATFORM - ${process.platform} ${process.arch}`);
  Logger.verbose(`PID - ${process.pid}`);
  Logger.debug(`CWD - ${process.cwd()}`);
  Logger.debug(`NODE VERSION - ${process.versions.node}`);
  Logger.verbose(`V8 VERSION - ${process.versions.v8}`);

  Logger.debug("------------------------");
}

export function testLogs() {
  Logger.error("TEST");
  Logger.warn("TEST");
  Logger.log("TEST");
  Logger.info("TEST");
  Logger.debug("TEST");
  Logger.verbose("TEST");
  Logger.event("tester", "Testing occuring");
  Logger.explain("TEST");
  Logger.custom("CUSTOM", "strikethrough", "TEST");
}

export default Logger;
export * from "./Logger.instance.js";
