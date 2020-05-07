const Norman = require(`@smarterlabs/norman`)
const shopifySource = require(`@smarterlabs/norman-source-shopify`)

let shopifyProgress = 0

const norman = new Norman({
	files: {
		'all-products-arr': {
			type: `list`,
		},
	},
	dist: `dist`,
	plugins: [
		shopifySource({
			domain: `${process.env.SHOPIFY_STORE_NAME}.myshopify.com`,
			accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
			pageLimit: 2,
			fetchSize: 1,
		}),
	],
	on: {
		'data:shopify:product': ({ data, add }) => {
			let { handle } = data
			data.variants.forEach(variant => {
				let { sku, id } = variant
				add(`all-products-arr`, [
					sku,
					id,
					handle,
				])
			})
			console.log(`Fetched ${shopifyProgress += data.variants.length} Shopify variants`)
		},
	},
})

norman.build()