const Norman = require(`@smarterlabs/norman`)
const sanitySource = require(`@smarterlabs/norman-source-sanity`)
const shopifySource = require(`@smarterlabs/norman-source-shopify`)

const norman = new Norman({
	collections: {
		'all-products': {
			type: `list`,
			uid: `sku`,
		},
		'product': {
			path: ({ sku }) => `product/${sku}`,
			type: `singleton`,
			merge: `shallow`,
		},
		'site-settings': {
			type: `singleton`,
		},
	},
	on: {
		'data:sanity:product': ({ data, add }) => {
			data.sku = data.defaultProductVariant.sku
			add(`all-products`, data)
			add(`product`, data)
		},
		'data:sanity:siteSettings': ({ data, add }) => {
			add(`site-settings`, data)
		},
		'data:shopify:product': ({ data, add }) => {
			let { handle } = data
			data.variants.forEach(variant => {
				let { sku, id } = variant
				add(`all-products`, {
					sku,
					shopify: {
						id,
						handle,
					},
				})
			})
		},
	},
	plugins: [
		sanitySource({
			projectId: process.env.SANITY_PROJECT_ID,
			dataset: process.env.SANITY_DATASET,
			token: process.env.SANITY_READ_TOKEN,
		}),
		shopifySource({
			domain: `${process.env.SHOPIFY_STORE_NAME}.myshopify.com`,
			accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
			pageLimit: 2,
			fetchSize: 1,
		}),
	],
	dist: `dist`,
	formatJson: process.env.NODE_ENV == `production` ? 0 : 3,
})

norman.build()