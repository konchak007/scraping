import Browser from "..";
import puppeteerCore, { Browser as BrowserType, Page } from "puppeteer";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";

import { clutch } from "../selectors";
import { Company } from "../types";

function delay(time) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, time)
	});
 }

export const g2GatherData = async (
	browser: Browser
): Promise<any> => {
	const { page } = browser;
	console.log('before waiting');
	// // await page.waitForNavigation()
	 await delay(400);
	// console.log('after waiting');


	await page.screenshot({ path: 'stealth.png', fullPage: true })
	console.log(3)
	// await page.click("input[type='checkbox']");
 await page.waitForNavigation()
 await page.screenshot({ path: 'stealth1.png', fullPage: true })
	const company_name = await browser.getTextValueBySelector(
		'div[itemprop="name"] a'
	);

    const rating = await browser.getTextValueBySelector(
		'.show-for-large .fw-semibold'
	);

	const overview = await browser.getTextValueBySelector(
		'.star-wrapper__desc a'
	);
    //itemprop="description"
    const description = await browser.getTextValueBySelector(
		'div[itemprop="description"]'
	);


	const website = await page.evaluate(() => {
		const linkElement: HTMLAnchorElement = document.querySelector(
			'a[itemprop="url"]'
		);
		return linkElement ? linkElement.href : "";
	});

	 await browser.close();
console.log({
	company_name,
	overview,
	description,rating,
	website
})
	return {
		company_name,
		overview,
	    description,
        website,
		rating
	};
};
