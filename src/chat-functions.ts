import { LoggerInstance } from "#logger";
import { OpenAIChat } from "#open-ai";
import fs from "fs-extra";

const logger = new LoggerInstance("ChatFunctions");

export function currentDate(locale: string) {
  return new Date().toLocaleDateString(locale);
}

export const currentDate_description = `
Assistant does not know what day, month, or year it is. This function will return the current date.
`;

/**
 * @param input Full prompt for what to search for and summarize. The prompt should have as much information as the helper could need.
 */
export async function askHelper(input: string) {
  logger.info(`Asking helper "${input}"`);

  const worker = new OpenAIChat({
    openAIConfig: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    chatConfig: {
      model: "gpt-3.5-turbo-0613",
      prompt: await fs.readFile("./worker-prompt.txt", "utf-8"),
    },
  });

  await worker.addFunctionsFromFile("worker-functions");
  const res = await worker.chat({
    role: "user",
    content: input,
  });

  return res.content ?? "Helper did not reply.";
}

export const askHelper_description = `
Ask a helper AI to gather information. Use natural language to ask the helper AI to do something. The more information the helper has the better.
`;
