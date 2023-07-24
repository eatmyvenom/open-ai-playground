import axios from "axios";
import { BingInstance } from "./bing";
import { Logger } from "./logger";
import { OpenAIChat } from "./open-ai";
import { readFile } from "fs-extra";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { chunkString, summarizeText } from "./open-ai/summarize";

const logger = new Logger(
  "WorkerFunctions",
  process.env.LOG_LEVEL ?? "warn",
  process.env.LOG_DIR
);

async function getWebdata(url: string) {
  const res = await axios.get(url);
  if (typeof res.data === "object") {
    return JSON.stringify(res.data);
  } else if (typeof res.data === "string") {
    const dom = new JSDOM(res.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article?.textContent ?? "No text found.";
  }
}

/**
 * @param input Object containing a query input for what query string to use from the web.
 */
export async function searchInternet(input: { query: string }) {
  logger.info(`Searching internet: ${input.query}`);
  const bing = new BingInstance({ apiKey: process.env.BING_API_KEY ?? "" });
  const res = await bing.searchSmall(input.query);
  logger.info("Search completed.");
  return JSON.stringify(res);
}

export const searchInternet_description = `
Gather search results from bing. Bing will respond with the most up to date information in a json format.
`;

/**
 * @returns Information from the web site.
 */
export async function readWebpage(
  url: string,
  topic: string,
  keywords: string[]
) {
  logger.info(`Reading webpage: ${url}`);
  logger.info(
    `Searching for topic: ${topic}, using keywords: "${keywords.join(", ")}"`
  );
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

  let webstring: any;
  try {
    webstring = await getWebdata(url);

    if (webstring === undefined) {
      throw new Error("Could not get web data. Web data is undefined.");
    }
  } catch (err: any) {
    logger.error(err);
    return err.message ?? err;
  }

  const webdata = chunkString(webstring, 3000);

  logger.info(`Webpage read. ${webdata.length} chunks found.`);
  logger.info("Summerizing...");

  const summary = await summarizeText(webdata, keywords, topic);

  logger.info("Summary complete.");
  return summary;
}

export const readWebpage_description = `
Read a webpage. The webpage information will be returned as a summary.
`;
