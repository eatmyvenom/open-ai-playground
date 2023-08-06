/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from "dotenv";
import { OpenAIChat } from "#open-ai";
import fs from "fs-extra";
import { BingInstance } from "#bing";
import { ChatInterface } from "#chat-interface";
import Logger, { bindProcessEvents, logDebugInfo, testLogs } from "#logger";

const logger = Logger;

bindProcessEvents();
logDebugInfo();
testLogs();

const registerEnv = dotenv.config();

if (registerEnv.error) {
  throw registerEnv.error;
}

async function getPrompt() {
  return fs.readFile("./prompt.txt", "utf-8");
}

async function gptTest() {
  const chatInstance = new OpenAIChat({
    openAIConfig: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    chatConfig: {
      model: "gpt-3.5-turbo-0613",
      prompt: await getPrompt(),
    },
  });

  await chatInstance.addFunctionsFromFile("chat-functions");
  chatInstance.addSystemMessage(
    `The current date and time is: ${new Date().toLocaleString()}`
  );

  const res = await chatInstance.chat({
    role: "user",
    content: "What happened to widow maker in the update?",
  });

  logger.debug(res);
}

async function testBing() {
  const bing = new BingInstance({ apiKey: process.env.BING_API_KEY ?? "" });
  logger.info(
    JSON.stringify(await bing.searchSmall("who owns twitter"), null, 2)
  );
}

async function doChat() {
  const term = new ChatInterface();

  const chatInstance = new OpenAIChat({
    openAIConfig: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    chatConfig: {
      model: "gpt-3.5-turbo-16k-0613",
      prompt: await getPrompt(),
    },
    logLevel: process.env.LOG_LEVEL ?? "warn",
  });

  await chatInstance.addFunctionsFromFile("chat-functions");
  chatInstance.addSystemMessage(
    `The current date and time is: ${new Date().toLocaleString()}`
  );

  let aiRes = "";

  while (term.isOpen()) {
    const userIpt = await term.ask(aiRes + "\n> ");
    const res = await chatInstance.chat({
      role: "user",
      content: userIpt,
    });

    aiRes = res.content ?? "AI did not reply.";
  }
}

async function main() {
  await doChat();
}

main();
