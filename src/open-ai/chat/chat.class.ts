import { NoMessageResponseError } from "#errors";
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  ConfigurationParameters,
  CreateChatCompletionRequest,
  OpenAIApi,
} from "openai";
import { getFunctions } from "../util";
import { Logger } from "../../logger";
import { inspect } from "util";

type UsableFunction = ChatCompletionFunctions & {
  fn: (...args: any[]) => any;
};

interface OpenAIChatConfig {
  openAIConfig: ConfigurationParameters;
  chatConfig: Partial<CreateChatCompletionRequest> & {
    model: string;
    prompt?: string;
  };
  logLevel?: string;
}

export class OpenAIChat {
  private readonly config: OpenAIChatConfig;
  private openai: OpenAIApi;
  public readonly messages: ChatCompletionRequestMessage[];
  public readonly functions: ChatCompletionFunctions[] = [];
  private callableFunctions: { [key: string]: (...args: any[]) => any } = {};
  private logger: Logger;

  public constructor(cfg: OpenAIChatConfig) {
    this.config = cfg;
    this.openai = new OpenAIApi(new Configuration(this.config.openAIConfig));
    this.messages = [
      { role: "system", content: this.config.chatConfig.prompt },
    ];

    this.logger = new Logger(
      "OpenAIChat",
      this.config.logLevel ?? "warn",
      process.env.LOG_DIR
    );

    delete this.config.chatConfig.prompt;
  }

  public async chat(
    message?: ChatCompletionRequestMessage
  ): Promise<ChatCompletionRequestMessage> {
    if (message) this.messages.push(message);

    const response = await this.openai.createChatCompletion({
      ...this.config.chatConfig,
      functions: this.functions,
      messages: this.messages,
    });

    this.logger.debug(`Response: ${inspect(response, true, 4)}`);
    const newMsg = response.data.choices[0].message;

    if (newMsg === undefined) {
      throw new NoMessageResponseError();
    }

    this.messages.push(newMsg);

    if (newMsg.function_call !== undefined) {
      const fn = this.callableFunctions[newMsg.function_call.name ?? ""];
      const args = JSON.parse(newMsg.function_call.arguments ?? "");

      this.logger.info(
        `Calling function ${newMsg.function_call.name}(${Object.values(args)
          .map((arg) => `${JSON.stringify(arg)}`)
          .join(",")})`
      );

      let fnRes;
      try {
        fnRes = await fn.apply(this, Object.values(args));
      } catch (err: any) {
        this.logger.error(
          JSON.stringify(err?.response?.data.error ?? err, null, 2)
        );
        this.logger.error(err.stack);
      }

      this.logger.debug(`Function result: ${JSON.stringify(fnRes)}`);

      this.messages.push({
        role: "function",
        name: newMsg.function_call.name,
        content: fnRes,
      });
      return await this.chat();
    }

    return newMsg;
  }

  public addFunctions(functions: UsableFunction[]) {
    functions.forEach(({ name, description, parameters, fn }) => {
      this.functions.push({
        name,
        description,
        parameters,
      });
      this.callableFunctions[name] = fn;
    });

    return this;
  }

  /**
   * Insert a fake function call into the message history.
   * @param name The name of the function
   * @param args The args that assisant uses for the function
   * @param result The result the function should return
   */
  public insertFakeFunction(name: string, args: string[], result: string) {
    this.messages.push({
      role: "assistant",
      function_call: {
        name,
        arguments: JSON.stringify(args),
      },
    });
    this.messages.push({
      role: "function",
      name,
      content: result,
    });

    return this;
  }

  /**
   * Read functions from a file and add them to the assistant.
   * @param file The file to load functions from
   */
  public async addFunctionsFromFile(file: string) {
    const functions = await getFunctions(file);
    this.addFunctions(functions as UsableFunction[]);

    return this;
  }

  /**
   * Add a system message to the message history.
   * @param message The message to add
   */
  public addSystemMessage(message: string) {
    this.messages.push({ role: "system", content: message });

    return this;
  }
}
