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


  const elements = await page.evaluate((selector) => {
    const allElements = Array.from(document.querySelectorAll(selector));
    return allElements
      .filter(el => !el.classList.contains('sg-pagination-v2-disabled'))
      .map(el => {
        const classes = Array.from(el.classList);
        return `${el.tagName.toLowerCase()}.${classes.join('.')}`;
      });
  }, clutch.nextPage);


  if (elements.length>0) {
    pageNumber += 1;
    await browser.close();
    const newbBrowser = new Browser();
    await newbBrowser.init({
      headless: false,
    });
console.log(pageNumber)
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
