import { createInterface, Interface } from "node:readline/promises";
import { LoggerInstance } from "#logger";

// A class that uses readline to get user input and reply to it.
export class ChatInterface {
  private rl: Interface;
  private open = true;
  private logger = new LoggerInstance("ChatRL");

  public constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.logger.verbose("Readline interface created");
  }

  public async ask(question: string): Promise<string> {
    const res = await this.rl.question(question);
    if (res === ".exit") {
      await this.close();
      this.logger.verbose("Readline closed by user.");
      return "USER CLOSED CONNECTION";
    }

    return res;
  }

  public async close(): Promise<void> {
    await this.rl.close();
    this.logger.verbose("Readline interface closed");
    this.open = false;
  }

  public async askForInput(): Promise<string> {
    return await this.ask("> ");
  }

  public isOpen() {
    return this.open;
  }
}
