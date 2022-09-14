import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

// TODO: refine search even further for iphone

const iPhoneSearch = [
	'4',
	'5',
	'5s',
	'6',
	'6 plus',
	'6s plus',
	'7',
	'7 plus',
	'7s',
	'8',
	'8 plus',
	'se',
	'x',
	'xr',
	'xs',
	'xs max',
	'11',
	'11 pro',
	'11 pro max',
	'12',
	'12 mini',
	'12 pro',
	'12 pro max',
	'13',
	'13 mini',
	'13 pro',
	'13 pro max',
];

const requestPage = async searchTerm => {
	const lowerCaseSearch = searchTerm.toLowerCase();
	const iphoneSearch = lowerCaseSearch.substring(0, 6);
	const modelSearch = iPhoneSearch.indexOf(lowerCaseSearch.slice(6));

	const url = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=iphone+${iPhoneSearch[modelSearch]}&_sacat=0&LH_Sold=1&LH_Complete=1&rt=nc&LH_BIN=1`;
	const response = await fetch(url);
	const responseJson = await response.text();
	return responseJson;
};

const webscrape = async (searchTerm, dayChange = 0) => {
	const lowerCaseSearch = searchTerm.toLowerCase();
	const modelSearch = iPhoneSearch.indexOf(lowerCaseSearch.substring(6));

	if (modelSearch === -1) {
		return { status: 503, success: false, message: 'not a valid search term' };
	}

	console.log(modelSearch);
	console.log(`dayChange: `, dayChange);

	// load the html
	const html = await requestPage(searchTerm);
	// if (html.status !== 200) return html;

	const $ = cheerio.load(html, null, false);

	// model object
	let filteredResponse = {};

	// render each element in the ul
	$('#srp-river-results > ul').each((i, ul) => {
		const children = $(ul).children();

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
			const day = now.slice(8, 11);

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

				// additional filters
				const caseCover = element.toLowerCase().indexOf('case');
				const lotOf = element.toLowerCase().indexOf('Lot of');
				const glass = element.toLowerCase().indexOf('glass');

				// compare date

				// console.log(new Date(element.slice(5, 18)).getUTCDate(), Number(day));

				if (new Date(element.slice(5, 18)).getUTCDate() === Number(day - dayChange)) {
					if (caseCover === -1 && lotOf === -1 && glass === -1) {
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
					}
				}
			}
		});
	});
	return { status: 200, success: true, message: 'filted ebay data', data: filteredResponse };
};

export { webscrape };
