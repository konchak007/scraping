"use server";
import puppeter  from "puppeteer-extra";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
 import puppeteerCore, { Browser as BrowserType, Page } from "puppeteer";
//  import Stealth from "puppeteer-extra-plugin-stealth";
 const StealthPlugin = require('puppeteer-extra-plugin-stealth');

let browser;
const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--incognito']
class Browser {
  private instance: BrowserType = null;
  private pageInstance: Page = null;

  async init(config: object) {
    const AnonymizeUA = require('puppeteer-extra-plugin-anonymize-ua')()
  puppeter.use(AnonymizeUA);
    browser =  await puppeter.use(
      StealthPlugin(),
  ).launch({...config})
  const ws_endpoint_url = browser.wsEndpoint();
//   browser = await puppeter.connect({
//     browserWSEndpoint: ws_endpoint_url
// });




    this.instance = browser;
    
    this.pageInstance = await browser.newPage() as Page;
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
