import puppeteer, { Page } from "puppeteer";
import Browser from "../../utils";
import { CLUTCH } from "../../utils/constants";
import { clutch } from "../../utils/selectors";
import { highlightsGatherData } from "../steps/clutchProfileGatherData";
import { pageLoop } from "../steps/nextPageAutomation";

const chunkSize = 10; // Number of links to process concurrently

export default async function handler(req, res) {
  try {
    const browser = new Browser();
    await browser.init({
      headless: false,
    });

    await browser.goto(`${CLUTCH.base}${CLUTCH.support}`);

    // Extract links from the page
    const links = await pageLoop(browser);

    // personal page
    // links.splice(10);
    // const results = [];
    // for (const org of links) {
    //   const browser2 = new Browser();
    //   await browser2.init({
    //     headless: false,
    //   });
    //   await browser2.page.goto(`${CLUTCH.base}${org}`);
    //   const orgData = await highlightsGatherData(browser2);
    //   await browser2.close();
    //   results.push(orgData);
    // }
    // links.splice(10);

    // const results = await Promise.all(
    //   links.map(async (i) => {
    //     const browser2 = new Browser();
    //     await browser2.init({
    //       headless: false,
    //     });
    //     await browser2.page.goto(`${CLUTCH.base}${i}`);
    //     const orgData = await highlightsGatherData(browser2);
    //     await browser2.close();
    //     return orgData;
    //   })
    // );

    const results = [];

    // Split the links array into chunks
    const chunks = [];
    for (let i = 0; i < links.length; i += chunkSize) {
      chunks.push(links.slice(i, i + chunkSize));
    }

    // Process each chunk sequentially
    for (const chunk of chunks) {
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

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error });
  }
}
