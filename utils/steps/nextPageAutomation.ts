import Browser from "..";
import { CLUTCH } from "../constants";
import { clutch } from "../selectors";

const links: string[] = [];

let pageNumber = 0;
export const pageLoop = async (browser: Browser) => {
  const { page } = browser;

  await page.waitForSelector(clutch.organizationList);

  const hrefs = await page.evaluate((selector: string) => {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map((elem) => elem.getAttribute("href"));
  }, clutch.organizationLink);
  links.push(...hrefs);

  const ele = await page.$(clutch.nextPage);

  if (ele) {
    pageNumber += 1;
    await browser.close();
    const newbBrowser = new Browser();
    await newbBrowser.init({
      headless: false,
    });

    await newbBrowser.goto(
      `${CLUTCH.base}${CLUTCH.support}?page=${pageNumber}`,
      {
        waitUntil: "networkidle0",
      },
    );
    await pageLoop(newbBrowser);
  }
  await browser.close();

  return links;
};
