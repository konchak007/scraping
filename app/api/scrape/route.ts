"use server";
import { NextRequest } from "next/server";
import Browser from "../../../utils";
import { CLUTCH } from "../../../utils/constants";
import { highlightsGatherData } from "../../../utils/steps/clutchProfileGatherData";
import { pageLoop } from "../../../utils/steps/nextPageAutomation";

const chunkSize = 10; // Number of links to process concurrently

// personal page
const results = [];

export async function POST(req: NextRequest) {
  console.log("scrape/POST");

  try {
    const browser = new Browser();
    await browser.init({
      headless: false,
    });

    await browser.goto(`${CLUTCH.base}${CLUTCH.support}`);

    // Extract links from the page
    const links = await pageLoop(browser);

    // Split the links array into chunks
    const chunks = [];
    for (let i = 0; i < links.length; i += chunkSize) {
      chunks.push(links.slice(i, i + chunkSize));
    }

    // Process each chunk sequentially
    for (const chunk of chunks) {
      console.log(chunk);
      const chunkResults = await Promise.all(
        chunk.map(async (i) => {
          const browser2 = new Browser();
          await browser2.init({
            headless: false,
          });
          await browser2.page.goto(`${CLUTCH.base}${i}`);
          const orgData = await highlightsGatherData(browser2);
          await browser2.close();
          return orgData;
        }),
      );
      results.push(...chunkResults);
    }
    return Response.json({ results });
  } catch (error) {
    console.log(error);
    return Response.json({ error: error.message, results });
    // res.status(500).json({ error });
  }
}
