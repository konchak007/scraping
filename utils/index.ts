"use server";
import puppeter from "puppeteer";
import puppeteerCore, { Browser as BrowserType, Page } from "puppeteer-core";
//  import chromium from "@sparticuz/chromium-min";
// import chromium from 'chrome-aws-lambda'
 const chromium = require('@sparticuz/chromium-min');
// const chromium = require("@sparticuz/chromium");
let browser;
const CHROMIUM_PATH =
  "https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar";
class Browser {
  private instance: BrowserType = null;
  private pageInstance: Page = null;

  async init(config: object) {
    // chromium.setGraphicsMode = false
  
    if (process.env.VERCEL_ENV === "production") {
      console.log(124)
  
      browser = await puppeteerCore.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chromium.defaultViewport,
        // executablePath:await chromium.executablePath('/Applications/Google\ Chrome.app'),
        executablePath: await chromium.executablePath(CHROMIUM_PATH),
        headless: chromium.headless,
        
      });
   
    } else {
      browser = await puppeter.launch({...config});
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
