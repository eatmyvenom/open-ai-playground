import { writeFile } from "fs-extra";
import { join } from "path";

const logLevels = ["debug", "info", "warn", "error"];

export class Logger {
  private logLevel: number;
  private name: string;
  private logDirectory?: string;

  constructor(name: string, logLevel: string, logDirectory?: string) {
    this.name = name;
    this.logLevel = logLevels.indexOf(logLevel);
    this.logDirectory = logDirectory;
  }

  public debug(...args: any[]) {
    this.log(0, [...args].join("\n") + "\n");
  }

  public info(...args: any[]) {
    this.log(1, [...args].join("\n") + "\n");
  }

  public warn(...args: any[]) {
    this.log(2, [...args].join("\n") + "\n");
  }

  public error(...args: any[]) {
    this.log(3, [...args].join("\n") + "\n");
  }

  public setLogLevel(logLevel: string) {
    this.logLevel = logLevels.indexOf(logLevel);
  }

  private log(level: number, text: string) {
    if (this.logLevel <= level) {
      const logString = `[${this.name}] (${logLevels[level]}) ${text}`;
      process.stdout.write(logString);
      if (typeof this.logDirectory === "string") {
        writeFile(
          join(
            process.cwd(),
            this.logDirectory,
            `${process.env.START_TIME}.log`
          ),
          logString + "\n",
          {
            flag: "a",
          }
        ).catch((err) => console.error(err));
      }
    }
  }
}
