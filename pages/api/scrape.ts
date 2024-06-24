"use server";
import chromium from "chrome-aws-lambda";
import Browser from "../../utils";
import { CLUTCH } from "../../utils/constants";
import { clutch } from "../../utils/selectors";
import { Company } from "./download";
// import { highlightsGatherData } from "../steps/clutchProfileGatherData";
// import { pageLoop } from "../steps/nextPageAutomation";

const links: string[] = [];

let pageNumber = 0;
const pageLoop = async (browser: Browser) => {
  const { page } = browser;

  await page.waitForSelector(clutch.organizationList);

  const hrefs = await page.evaluate((selector: string) => {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map((elem) => elem.getAttribute("href"));
  }, clutch.organizationLink);
  links.push(...hrefs);

  const ele = await page.$(".page-item.next");

  if (ele) {
    pageNumber += 1;
    await browser.close();
    const newbBrowser = new Browser();
    await newbBrowser.init({
      headless: false,
    });

    await newbBrowser.goto(
      `https://clutch.co/call-centers/customer-support?page=${pageNumber}`,
      {
        waitUntil: "networkidle0",
      },
    );
    await pageLoop(newbBrowser);
  }
  await browser.close();

  return links;
};

export const highlightsGatherData = async (
  browser: Browser,
): Promise<Company> => {
  const { page } = browser;

  const company_name = await browser.getTextValueBySelector(
    clutch.profile.title,
  );

  const overview = await browser.getTextValueBySelector(
    clutch.profile.summaryText,
  );

  const result = await page.evaluate(() => {
    const listItems = document.querySelectorAll(
      "li.profile-summary__detail.sg-text.sg-tooltip",
    );
    const obj = {};
    Array.from(listItems).forEach((item) => {
      let tooltipContent = item.getAttribute("data-tooltip-content");
      tooltipContent = tooltipContent.replace(/<i>/g, "").replace(/<\/i>/g, ""); // Remove <i> and </i> tags
      const titleText = (
        item.querySelector("span.sg-text__title") as HTMLElement
      ).innerText.trim();
      obj[tooltipContent] = titleText;
    });
    return obj;
  });

  const services = await page.evaluate(() => {
    const items = document.querySelectorAll("ul.chart-legend--list li");
    return Array.from(items).map((item) => {
      const service = item.querySelector("a").innerText.trim();
      const percentage = item.querySelector("span").innerText.trim();
      return { [service]: percentage };
    });
  });

  const metrics = await page.evaluate(() => {
    const averageReviewRating = (
      document?.querySelector(
        'div[name="metrics-average-review-rating"] span.sg-rating__number',
      ) as HTMLElement
    )?.innerText?.trim();
    const totalReviews = (
      document.querySelector(
        'div[name="metrics-total-reviews"] span.sg-colored-card--accent',
      ) as HTMLElement
    )?.innerText?.trim();
    const averageReferralRating = (
      document?.querySelector(
        "div.profile-metrics--card:nth-child(3) span.sg-colored-card--accent",
      ) as HTMLElement
    )?.innerText?.trim();
    const mostCommonProjectSize = (
      document?.querySelector(
        "div.profile-metrics--card:nth-child(4) span.sg-colored-card--accent",
      ) as HTMLElement
    )?.innerText?.trim();

    return {
      "Average Review Rating": averageReviewRating,
      "Total Reviews": totalReviews,
      "Average Referral Rating": averageReferralRating,
      "Most Common Project Size": mostCommonProjectSize,
    };
  });

  const addressText = await page.evaluate(() => {
    const addressElement: HTMLElement = document?.querySelector(
      "address.detailed-address",
    );
    return addressElement?.innerText?.trim() || "";
  });

  // const phone = await browser.getTextValueBySelector('a[itemprop="telephone"]');

  const website = await page.evaluate(() => {
    const linkElement: HTMLAnchorElement = document.querySelector(
      "li.profile-quick-menu__visit-website a",
    );
    return linkElement ? linkElement.href : "";
  });

  const linkedInLink = await page.evaluate(() => {
    const linkElement: HTMLAnchorElement = document?.querySelector(
      'a[aria-label="View LinkedIn"]',
    );
    return linkElement ? linkElement.href : "";
  });

  // new tab 1
  await page.waitForSelector('button[aria-label="Chart Clients"]', {
    visible: true,
  });

  await page.click('button[aria-label="Chart Clients"]');

  await page.waitForSelector('button[aria-label="Chart Clients"].active', {
    visible: true,
  });
  const clientServices = await page.evaluate(() => {
    const items = document.querySelectorAll("ul.chart-legend--list li");
    return Array.from(items).map((item) => {
      const service = (item as HTMLElement)?.innerText?.trim().split("\n")[0];
      const percentage = (item as HTMLElement)?.innerText
        ?.trim()
        .split("\n")[1];
      return { [service]: percentage };
    });
  });

  // new tab industries
  await page.waitForSelector('button[aria-label="Chart Industries"]', {
    visible: true,
  });

  await page.click('button[aria-label="Chart Industries"]');

  await page.waitForSelector('button[aria-label="Chart Industries"].active', {
    visible: true,
  });
  const industriesServices = await page.evaluate(() => {
    const items = document.querySelectorAll("ul.chart-legend--list li");
    return Array.from(items).map((item) => {
      const service = (item as HTMLElement)?.innerText?.trim().split("\n")[0];
      const percentage = (item as HTMLElement)?.innerText
        ?.trim()
        .split("\n")[1];
      return { [service]: percentage };
    });
  });

  await browser.close();

  return {
    company_name,
    overview,
    result,
    services,
    metrics,
    adress: addressText,
    website,
    linkedInLink,
    clientServices,
    industriesServices,
  };
};

const chunkSize = 10; // Number of links to process concurrently

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const browser = new Browser();
      await browser.init({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });

      await browser.goto(`${CLUTCH.base}${CLUTCH.support}`);

      // Extract links from the page
      const links = await pageLoop(browser);

      // personal page
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
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
