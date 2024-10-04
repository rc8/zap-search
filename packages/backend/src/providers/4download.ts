import type BaseResult from "shared/defs";
import type { ProviderExports } from "shared/defs";
import { fetchPage, webSearch } from "../utils";
import * as cheerio from "cheerio";

const baseUrl = "https://4download.net";

export function generateUrl({ query }: { query: string }) {
  const urlObj = new URL(baseUrl);

  urlObj.searchParams.set("do", "search");
  urlObj.searchParams.set("s", query);

  const urlString = urlObj.toString();
  console.log(`Generated URL: ${urlString}`);
  return urlString;
}

export async function fetchResults(url: string): Promise<BaseResult[]> {
  const query = new URL(url).searchParams.get("s");

  const formdata = new FormData();
  formdata.append("subaction", "search");
  formdata.append("do", "search");
  formdata.append("story", query);

  const page = await fetchPage(url, {
    method: "post",
    body: formdata,
  });

  const $ = cheerio.load(page);

  const results = $("main a.item-serial");
  const dataResults: BaseResult[] = [];

  results.each((_, el) => {
    const _title = $(el)
      .find(".item-title")
      .contents()
      .filter(() => this.nodeType === 3)
      .text()
      .trim();
    const _serie = $(el).find(".item-title .is-serie").text().trim();

    const title = `${_title} ${_serie}`;
    const link = $(el).attr("href")!.trim();

    const data: BaseResult = {
      title,
      link,
    };

    dataResults.push(data);
  });

  return dataResults;
}

export default {
  baseUrl,
  action: "Download",
  id: "4download",
  name: "4Download",
  category: "Producing",

  fetchResults,
  generateUrl,
} as ProviderExports;