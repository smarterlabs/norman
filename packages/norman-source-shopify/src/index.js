const Client = require(`shopify-buy`)
const fetch = require(`node-fetch`)
const fetchProducts = require(`./fetch-products`)

if(!global.fetch) global.fetch = fetch

function normanSourceSanity(options){
	options = {
		...defaultOptions,
		...options,
	}
	return async norman => {
		const client = Client.buildClient({
			domain: options.domain,
			storefrontAccessToken: options.accessToken,
		})
		await fetchProducts(norman, client, options)
	}
}

const defaultOptions = {
	maxFailures: 20,
	fetchSize: 250,
	timeout: 1000,
	pageLimit: 0,
}

module.exports = normanSourceSanity