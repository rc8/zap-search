import * as cheerio from "cheerio";
import type BaseResult from "shared/defs";
import type { ProviderExports } from "shared/defs";

const baseUrl = "https://www.ovagames.com/";

export function generateUrl({ query }: { query: string }) {
  const urlObj = new URL(baseUrl);
  urlObj.searchParams.set("x", "0");
  urlObj.searchParams.set("y", "0");

  urlObj.searchParams.set("s", query);

  const urlString = urlObj.toString();
  console.log(`Generated URL: ${urlString}`);
  return urlString;
}

export function parsePage(page: string): BaseResult[] {
  const $ = cheerio.load(page);
  const results = $(".home-post-wrap");
  const dataResults: BaseResult[] = [];

  results.each((_, el) => {
    try {
      const title = $(el).find("h2 a").attr("title")!.slice(18).trim();
      const link = $(el).find("h2 a").attr("href")!.trim();
      const icon = $(el).find(".post-inside a img.thumbnail").attr("src")!;
      console.log(`Parsed result - Title: ${title}, Link: ${link}, Icon: ${icon}`);
      dataResults.push({
        title,
        link,
        icon,
      });
    } catch (e) {
      console.error("Skipping element due to error:", e);
    }
  });

  console.log(`Parsed ${dataResults.length} results.`);
  return dataResults;
}

export default {
  baseUrl,
  action: "Download",
  id: "ovagames",
  name: "Ova Games",
  category: "Games",

  parsePage,
  generateUrl,
} as ProviderExports;
