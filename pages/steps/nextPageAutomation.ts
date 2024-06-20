import Browser from '../../utils';
import { clutch } from '../../utils/selectors';

const links: string[] = [];

let pageNumber = 0;
export const pageLoop = async (browser: Browser) => {
  const { page } = browser;

  await page.waitForSelector(clutch.organizationList);

  const hrefs = await page.evaluate((selector: string) => {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map((elem) => elem.getAttribute('href'));
  }, clutch.organizationLink);
  links.push(...hrefs);

  const ele = await page.$('.page-item.next');

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
        waitUntil: 'networkidle0',
      }
    );
    await pageLoop(newbBrowser);
  }
  await browser.close();

  return links;
};
