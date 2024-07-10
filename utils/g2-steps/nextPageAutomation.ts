import Browser from "..";

const links: string[] = [];
let pageNumber = 0;

export const pageG2Loop = async (browser: Browser) => {
  const { page } = browser;

  await browser.goto(`https://www.g2.com/categories/call-center-infrastructure-cci?order=g2_score&page=1#product-list`,{
    waitUntil: "networkidle0",
  });

  // await page.waitForNavigation({
  //   waitUntil: 'networkidle0',
  // });
  await page.waitForSelector('#product-cards #category-list-first-product:last-child',{timeout:50000});


  const hrefs = await page.evaluate((selector: string) => {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map((elem) => elem.getAttribute("href"));
  }, '.product-card__product-name a');
  links.push(...hrefs);

  if (pageNumber !== 11) {
    pageNumber += 1;
    await browser.close();
    const newbBrowser = new Browser();
    await newbBrowser.init({
      headless: false,
    });
console.log( `https://www.g2.com/categories/call-center-infrastructure-cci?order=g2_score&page=${pageNumber}#product-list`)
    await newbBrowser.goto(
        `https://www.g2.com/categories/call-center-infrastructure-cci?order=g2_score&page=${pageNumber}#product-list`,
      {
        waitUntil: "networkidle0",
      },
    );
    await pageG2Loop(newbBrowser);
  }
  await browser.close();
console.log(links)
  return links;
};
