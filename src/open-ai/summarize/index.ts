import { readFile } from "fs-extra";
import { OpenAIChat } from "../chat/index.js";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import { LoggerInstance } from "#logger";

const logger = new LoggerInstance("SummarizeFunctions");

export function chunkString(str: string, maxLen = 3000) {
  if (str.length > maxLen) {
    const newStr: any[] = str.split("\n");

    newStr.forEach((_: string, i: number) => {
      if (_.length > maxLen) {
        const chunks = [];
        // split into smaller chunks of 3000 characters each

        for (let j = 0; j < _.length; j += maxLen) {
          chunks.push(_.substring(j, j + maxLen));
        }

        newStr[i] = chunks;
      }
    });

    return newStr.flat();
  }

  return [str];
}

export async function summarizeText(
  text: string[],
  keywords: string[],
  topic: string
) {
  const worker = new OpenAIChat({
    openAIConfig: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    chatConfig: {
      model: "gpt-3.5-turbo-16k-0613",
      prompt: await readFile("./summarize-prompt.txt", "utf-8"),
    },
  });

  await worker.addFunctionsFromFile("summarize-functions");

  let summary = "";
  for (const chunk of text.flat()) {
    worker.addSystemMessage(`CURRENT SUMMARY:\n${summary ?? "none"}`);
    worker.addSystemMessage(
      "Write a concise summary of the chunk of the webpage to add to the summary. Do not restate the summary."
    );
    worker.messages.push(
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Read the chunk of text and summarize it. The topic is ${topic}. The key phrases are ${keywords.join(
          ", "
        )}.`,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: "getTextChunk",
        function_call: {
          name: "getTextChunk",
          arguments: "",
        },
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.Function,
        name: "getWebpageChunk",
        content: chunk,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content:
          "Write a concise summary what all the needed information of the chunk of the webpage to add to the summary. Do not restate the summary.",
      }
    );

    const res = await worker.chat();

    summary += `${res}\n\n`;

    if (summary.length > 3000) {
      summary = await summarizeText(
        chunkString(summary, 3000),
        keywords,
        topic
      );
    }
  }

  logger.info("Summary complete.");
  return summary;
}
