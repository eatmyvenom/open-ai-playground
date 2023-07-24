import { createInterface, Interface } from "node:readline/promises";

// A class that uses readline to get user input and reply to it.
export class ChatInterface {
  private rl: Interface;
  private open = true;

  public constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  public async ask(question: string): Promise<string> {
    const res = await this.rl.question(question);
    if (res === ".exit") {
      await this.close();
      return "USER CLOSED CONNECTION";
    }

    return res;
  }

  public async close(): Promise<void> {
    await this.rl.close();
    this.open = false;
  }

  public async askForInput(): Promise<string> {
    return await this.ask("> ");
  }

  public isOpen() {
    return this.open;
  }
}
