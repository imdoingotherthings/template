import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

const requestPage = async () => {
	const url =
		'https://www.ebay.com/sch/i.html?_from=R40&_nkw=iphone+7+plus&_sacat=0&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1';
	const response = await fetch(url);
	const responseJson = await response.text();
	return responseJson;
};

const webscrape = async () => {
	// load the html
	const html = await requestPage();
	const $ = cheerio.load(html, null, false);

	// model object
	let filteredResponse = {};

	// render each element in the ul
	$('#srp-river-results > ul').each((i, ul) => {
		const children = $(ul).children();
		let childrenLength = 0;

		// loop thru the children of the ul
		children.each((i, li) => {
			// using toLocaleString to compare with the elements we will receive
			const now = new Date().toLocaleString('en-US', {
				weekday: 'short',
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour12: false,
			});

			// parse html to string
			const element = $(li).text();

			// use slice to get the month of the toLocaleString()
			const month = now.slice(5, 8);

			// filter out the search
			if (element.includes('Sold') && element.includes(month)) {
				const eWindow = element.indexOf('Opens in a new window');
				const eCondition = element.indexOf('or tab');
				const newCondition = eCondition + 6;
				const priceUnfiltered = element.slice(newCondition).split('$')[1];
				const priceDecimal = priceUnfiltered.indexOf('.');
				const splitCondition = element.slice(newCondition).split('$')[0];

				// let filterdCondition;
				const preOwned = splitCondition.indexOf('Pre-Owned');
				const brandNew = splitCondition.indexOf('Brand New');
				const partsOnly = splitCondition.indexOf('Parts Only');
				const openBox = splitCondition.indexOf('Open Box');
				const refurbished = splitCondition.indexOf('Refurbished');

				// create id and object for each item
				if (splitCondition.includes('Pre-Owned')) {
					return (filteredResponse[`${uuid()}`] = {
						date: element.slice(5, 18),
						title: element.substring(27, eWindow),
						condition: splitCondition.substring(preOwned, preOwned + 9), // filtered condition
						soldPrice: priceUnfiltered.substring(0, priceDecimal + 3),
					});
				} else if (splitCondition.includes('Brand New')) {
					return (filteredResponse[`${uuid()}`] = {
						date: element.slice(5, 18),
						title: element.substring(27, eWindow),
						condition: splitCondition.substring(brandNew, brandNew + 9), // filtered condition
						soldPrice: priceUnfiltered.substring(0, priceDecimal + 3),
					});
				} else if (splitCondition.includes('Parts Only')) {
					return (filteredResponse[`${uuid()}`] = {
						date: element.slice(5, 18),
						title: element.substring(27, eWindow),
						condition: splitCondition.substring(partsOnly, partsOnly + 10), // filtered condition
						soldPrice: priceUnfiltered.substring(0, priceDecimal + 3),
					});
				} else if (splitCondition.includes('Open Box')) {
					return (filteredResponse[`${uuid()}`] = {
						date: element.slice(5, 18),
						title: element.substring(27, eWindow),
						condition: splitCondition.substring(openBox, openBox + 8), // filtered condition
						soldPrice: priceUnfiltered.substring(0, priceDecimal + 3),
					});
				} else if (splitCondition.includes('Refurbished')) {
					return (filteredResponse[`${uuid()}`] = {
						date: element.slice(5, 18),
						title: element.substring(27, eWindow),
						condition: splitCondition.substring(refurbished, refurbished + 11), // filtered condition
						soldPrice: priceUnfiltered.substring(0, priceDecimal + 3),
					});
				}

				// create id and object for each item
				// filteredResponse[`${uuid()}`] = {
				// 	date: element.slice(5, 18),
				// 	title: element.substring(27, eWindow),
				// 	condition: element.slice(newCondition).split('$')[0],
				// 	soldPrice: priceUnfiltered.substring(0, priceDecimal + 3),
				// };
				childrenLength++;
			}
		});

		// console.log(`children length: ${childrenLength}`);
		return filteredResponse;
	});
	console.log(`filteredResponse Object: `, filteredResponse);
};

export { webscrape };
