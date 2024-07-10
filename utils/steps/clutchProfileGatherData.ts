import Browser from "..";
import { clutch } from "../selectors";
import { Company } from "../types";

export const highlightsGatherData = async (
	browser: Browser
): Promise<Company> => {
	const { page } = browser;

	const company_name = await browser.getTextValueBySelector(
		clutch.profile.title
	);

	const overview = await browser.getTextValueBySelector(
		clutch.profile.summaryText
	);

	const result = await page.evaluate(() => {
		const listItems = document.querySelectorAll(
			"li.profile-summary__detail.sg-text.sg-tooltip"
		);
		const obj = {};
		Array.from(listItems).forEach((item) => {
			let tooltipContent = item.getAttribute("data-tooltip-content");
			tooltipContent = tooltipContent.replace(/<i>/g, "").replace(/<\/i>/g, ""); // Remove <i> and </i> tags
			const titleText = (
				item.querySelector("span.sg-text__title") as HTMLElement
			)?.innerText?.trim();
			obj[tooltipContent] = titleText;
		});
		return obj;
	});

	const services = await page.evaluate(() => {
		const items = document.querySelectorAll("ul.chart-legend--list li");
		return Array.from(items).map((item) => {
			const service = item.querySelector("a")?.innerText?.trim();
			const percentage = item.querySelector("span")?.innerText?.trim();
			return { [service]: percentage };
		});
	});

	const metrics = await page.evaluate(() => {
		const averageReviewRating = (
			document?.querySelector(
				'div[name="metrics-average-review-rating"] span.sg-rating__number'
			) as HTMLElement
		)?.innerText?.trim();
		const totalReviews = (
			document.querySelector(
				'div[name="metrics-total-reviews"] span.sg-colored-card--accent'
			) as HTMLElement
		)?.innerText?.trim();
		const averageReferralRating = (
			document?.querySelector(
				"div.profile-metrics--card:nth-child(3) span.sg-colored-card--accent"
			) as HTMLElement
		)?.innerText?.trim();
		const mostCommonProjectSize = (
			document?.querySelector(
				"div.profile-metrics--card:nth-child(4) span.sg-colored-card--accent"
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
			"address.detailed-address"
		);
		return addressElement?.innerText?.trim() || "";
	});

	// const phone = await browser.getTextValueBySelector('a[itemprop="telephone"]');

	const website = await page.evaluate(() => {
		const linkElement: HTMLAnchorElement = document.querySelector(
			"li.profile-quick-menu__visit-website a"
		);
		return linkElement ? linkElement.href : "";
	});

	const linkedInLink = await page.evaluate(() => {
		const linkElement: HTMLAnchorElement = document?.querySelector(
			'a[aria-label="View LinkedIn"]'
		);
		return linkElement ? linkElement.href : "";
	});

	// new tab 1
	await page.waitForSelector(clutch.profile.chartClients, {
		visible: true,
	});

	await page.click(clutch.profile.chartClients);

	await page.waitForSelector(clutch.profile.chartClientsActive, {
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
	await page.waitForSelector(clutch.profile.chartIndustries, {
		visible: true,
	});

	await page.click(clutch.profile.chartIndustries);

	await page.waitForSelector(clutch.profile.chartIndustriesActive, {
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

		// new tab focus
		await page.waitForSelector('button[aria-label="Chart Focus"]', {
			visible: true,
		});
		await page.click('button[aria-label="Chart Focus"]');
		await page.waitForSelector('button[aria-label="Chart Focus"].active', {
			visible: true,
		});
		const focusTab = {}

	 await page.waitForSelector('#legend_title');
		// const noFocus = await page.$eval('.chart-legend__zero-caption', (elem) =>
		//   elem.textContent.trim()
		// );
		const style = await page.evaluate(() => {
			const element = document?.querySelector('#legend_title');
			const style = window?.getComputedStyle(element);
			return {
			  display: style.getPropertyValue('display'),
			  // Add more properties as needed
			};
		  });
	console.log(style.display.includes('block'))
		if(style.display.includes('block')){
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
				focusTab
			};
			
		}
		await page.waitForSelector('#focus-chart_dropdown-list div');
	
		const childCount = await page.evaluate((sel) => {
			const parentElement = document.querySelector(sel);
			return parentElement ? parentElement.children.length : 0;
		  }, '#focus-chart_dropdown-list div');
	


		for (let i = 0; i <= childCount; i++) {
			const text1 = await browser.getTextValueBySelector(
				'#focus-dropdown-title'
				);

				const t = await page.evaluate(() => {
					const items = document.querySelectorAll("ul.chart-legend--list li");
					return Array.from(items).map((item) => {
						const service = (item as HTMLElement)?.innerText?.trim().split("\n")[0];
						const percentage = (item as HTMLElement)?.innerText
							?.trim()
							.split("\n")[1];
						return { [service]: percentage };
					});
				});
				focusTab[text1]= t
				await page.focus('#focus-chart_dropdown-button');
				await page.click('#focus-chart_dropdown-button');
				await page.waitForSelector('#focus-chart_dropdown-list div');
			
				const next = await page.$(`#focus-chart_dropdown-list div:nth-child(${i+1})`)
		
				if(next){
					await page.click(`#focus-chart_dropdown-list div:nth-child(${i+1})`);
				}
				


		  }
		  
	
	

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
		focusTab
	};
};
