import axios from "axios";
import { Logger } from "./logger";
import { convert } from "html-to-text";

async function getWebdata(url: string) {
  const res = await axios.get(url);
  if (typeof res.data === "object") {
    return JSON.stringify(res.data);
  } else if (typeof res.data === "string") {
    const webstring = convert(res.data);

    // Cut out as much unneeded characters as possible.
    return webstring
      .replace(/(\r\n|\n|\r)/gm, " ") // Replace all newlines with a space.
      .replace(/\s+/g, " ") // Replace all whitespace with a single space.
      .replace(/[^a-zA-Z0-9 ]/g, ""); // Remove all non alphanumeric characters.
  }
}

const logger = new Logger(
  "SummarizeFunctions",
  process.env.LOG_LEVEL ?? "warn",
  process.env.LOG_DIR
);

/**
 * @param input Object containing a url input for what url to read from the web.
 * @returns The text from the webpage.
 */
export async function readWebpage(input: { url: string }) {
  logger.info(`Reading webpage: ${input.url}`);
  const webdata = await getWebdata(input.url);
  return webdata;
}

export const readWebpage_description = `
Read a webpage. The text contents of the site will be returned. If the site is not text based, the contents will be returned as a json object.
`;
