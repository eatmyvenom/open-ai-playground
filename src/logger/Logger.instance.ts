import fs from "fs-extra";
import path from "node:path";
import { inspect } from "node:util";
import { Writable } from "node:stream";
import chalk, { ColorName, ModifierName } from "chalk";

export class LoggerInstance {
  private static loggers: LoggerInstance[] = [];

  private static logLevels = [
    "ERROR",
    "WARN",
    "LOG",
    "INFO",
    "DEBUG",
    "VERBOSE",
  ];

  /**
   * This is static to allow the developer to choose a global default or a per instance emoji
   */
  public static defaultEmoji = "🧾";

  /**
   * This is static to allow the developer to choose a global default or a per instance emoji
   */
  public static logLevel = process.env.LOG_LEVEL ?? 5;

  public constructor(
    public name: string,
    public emoji = LoggerInstance.defaultEmoji,
    public writeFiles = true,
    public logLevel = LoggerInstance.logLevel,
    public logStream = process.stdout,
    public errorStream = process.stderr,
    public formatters = new LoggerInstance.formatters()
  ) {
    this.verbose("Registered logger");
    LoggerInstance.loggers.push(this);
  }

  /**
   * Log content to stdout or a file
   *
   * @param {any} content
   */
  public log(content: any | any[]) {
    this.print("LOG", this.formatters.sanatize(content), this.name);
  }

  public out = this.log;

  /**
   * Log content to stdout or a file
   *
   * @param {any} content
   */
  public info(content: any | any[]) {
    this.print(
      "INFO",
      this.formatters.sanatize(content),
      this.name,
      "greenBright"
    );
  }

  /**
   * Log content to stdout or a file
   *
   * @param {string} event
   * @param {any} content
   */
  public event(event: string, content: any | any[]) {
    this.print(
      event.toUpperCase(),
      this.formatters.sanatize(content),
      this.name,
      "bgBlue"
    );
  }

  /**
   * Log content to stdout or a file
   *
   * @param {string} name
   * @param {string} color
   * @param {any} content
   */
  public custom(
    name: string,
    color: ColorName | ModifierName,
    content: any | any[]
  ) {
    this.print(
      name.toUpperCase(),
      this.formatters.sanatize(content),
      this.name,
      color
    );
  }

  /**
   * Log content to stdout or a file
   *
   * @param {any} content
   */
  public warn(content: any | any[]) {
    this.print(
      "WARN",
      this.formatters.sanatize(content),
      this.name,
      "yellowBright"
    );
  }

  /**
   * Log content to stdout or a file
   *
   * @param {any} content
   */
  public debug(content: any | any[]) {
    this.print(
      "DEBUG",
      this.formatters.sanatize(content),
      this.name,
      "magentaBright"
    );
  }

  public dbg = this.debug;

  /**
   * Log content to stdout or a file
   *
   * @param {any} content
   */
  public explain(content: any | any[]) {
    this.print("EXPLN", this.formatters.sanatize(content), this.name, "cyan");
  }

  /**
   * Log content to stdout or a file
   *
   * @param {any} content
   */
  public verbose(content: any | any[]) {
    this.print("VERBOSE", this.formatters.sanatize(content), this.name, "gray");
  }

  /**
   * Log content to stderr or a file
   *
   * @param {any} content
   */
  public error(content: any | any[]) {
    this.print(
      "ERROR",
      this.formatters.sanatize(content),
      this.name,
      "redBright",
      "❌"
    );
  }

  public err = this.error;

  private shouldLog(level: string): boolean {
    return LoggerInstance.logLevels.includes(level.toUpperCase())
      ? LoggerInstance.logLevels.slice(0, Number(this.logLevel)).includes(level)
      : true;
  }

  /**
   * @param {string} type
   * @param {*} string
   * @param {string} name
   * @param {string} color
   * @param {string} emoji
   */
  private print(
    type: string,
    logData: any,
    name = "",
    color: ColorName | ModifierName = "reset",
    emoji = this.emoji
  ) {
    emoji = emoji ? `${emoji.trim()} ` : "";
    const logType = this.formatters.logLevel(type, color);
    const logName = this.formatters.logName(name);

    const logFilePath = path.join(
      process.env.PWD ?? "",
      "logs",
      `${name.trim()}-${type !== "ERROR" ? "out" : "err"}.log`
    );

    const stream: Writable =
      type !== "ERROR" ? this.logStream : this.errorStream;

    for (let logStr of logData?.toString()?.split("\n") ?? "") {
      const time = this.formatters.logTime();
      logStr = chalk[color](logStr);

      if (this.shouldLog(type)) {
        const str = `${emoji}${time}${logName}${logType}${logStr}\n`;
        stream.write(str);
      }

      if (this.writeFiles) {
        const fileString = `${this.formatters.longTime()} - ${logStr}\n`;
        fs.writeFile(logFilePath, fileString, { flag: "a" }).catch(
          console.error
        );
      }
    }
  }

  /**
   * This is a public static class as opposed to many other things to give the dev
   * the ability to either overwrite a formatter globally for all logs or for one
   * specific logger instance.
   *
   * @static
   * @memberof LoggerInstance
   */
  public static formatters = class {
    logLevel = (type: string, color: ColorName | ModifierName) =>
      `${chalk[color](type.slice(0, 7).padEnd(7))} | `;

    logName = (n = "") =>
      `${chalk.cyanBright(n.trim().slice(0, 8).padEnd(8))} | `;

    logTime = () => `${chalk.blueBright(this.shortTime().trim())} | `;

    longTime(): string {
      const d = new Date();
      const month = `${`0${d.getMonth() + 1}`.slice(-2)}`;
      const day = `${`0${d.getDate()}`.slice(-2)}`;

      const hour = `${`0${d.getHours()}`.slice(-2)}`;
      const minute = `${`0${d.getMinutes()}`.slice(-2)}`;
      const sec = `${`0${d.getSeconds()}`.slice(-2)}`;
      const milli = `${`00${d.getMilliseconds()}`.slice(-3)}`;

      return `${month}-${day}T${hour}:${minute}:${sec}:${milli}`.trim();
    }

    shortTime(): string {
      const d = new Date();

      const month = `${`0${d.getMonth() + 1}`.slice(-2)}`;
      const day = `${`0${d.getDate()}`.slice(-2)}`;

      const hour = `${`0${d.getHours()}`.slice(-2)}`;
      const minute = `${`0${d.getMinutes()}`.slice(-2)}`;
      const sec = `${`0${d.getSeconds()}`.slice(-2)}`;

      return `${month}-${day} ${hour}:${minute}:${sec}`;
    }

    sanatize(content: any): string {
      if (Array.isArray(content)) {
        return content.map(this.sanatize).join("\n");
      } else if (typeof content === "object") {
        return inspect(content);
      } else {
        return `${content}`;
      }
    }
  };
}
