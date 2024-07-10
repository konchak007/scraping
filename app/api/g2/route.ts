"use server";
import { NextRequest } from "next/server";
import Browser from "../../../utils";
import { pageG2Loop } from "../../../utils/g2-steps/nextPageAutomation";
import { g2GatherData } from "../../../utils/g2-steps/g2ProfileGatherData";

// personal page
const results = [];

const chunkSize = 10; // Number of links to process concurrently

export async function POST(req: NextRequest) {
  console.log("scrape/POST");

  try {
    const browser = new Browser();
    await browser.init({
      headless: false,
    });

    const links = await pageG2Loop(browser);
    // const links=['https://www.g2.com/products/samsung-contact-center-pro/reviews']

    const chunks = [];
    for (let i = 0; i < links.length; i += chunkSize) {
      chunks.push(links.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (i: string) => {
          const browser2 = new Browser();
          await browser2.init({
            headless: true,
            defaultViewport: null,
            slowMo: 10,
          });
          await browser2.page.goto(i, { waitUntil: "domcontentloaded" });
          const orgData = await g2GatherData(browser2);
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
