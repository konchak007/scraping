"use server";
import puppeteer, { Browser as BrowserType, Page } from "puppeteer";
import chromium from '@sparticuz/chromium-min'
import puppeteerCore from "puppeteer-core";

let browser;

class Browser {
  private instance: BrowserType = null;
  private pageInstance: Page = null;

  async init(config: object) {
    chromium.setGraphicsMode = false
  
    if (process.env.VERCEL_ENV === "production") {
      console.log(124)
      const executablePath = await chromium.executablePath();
  
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: false,
      });
   
    } else {
      browser = await puppeteer.launch(config);
    }

    this.instance = browser;
    this.pageInstance = await browser.newPage();
    this.pageInstance.setDefaultNavigationTimeout(0);
    await this.pageInstance.setViewport({ width: 1080, height: 3024 });
  }

  public goto(url: string, params?: any) {
    return this.page.goto(url);
  }

  public async clickBySelector(selector: string) {
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }

  public async getTextValueBySelector(selector: string) {
    await this.page.waitForSelector(selector);
    const text = await this.page.$eval(selector, (elem) =>
      elem.textContent.trim()
    );

    return text;
  }

  public close() {
    return this.instance.close();
  }

  public async waitForSelector(selector: string) {
    await this.page.waitForSelector(selector);
  }

  public onPage(eventType: any, callback: () => void) {
    this.page.on(eventType, callback);
  }

  public get page() {
    return this.pageInstance;
  }
}

export default Browser;
