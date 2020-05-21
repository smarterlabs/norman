const Norman = require(`@smarterlabs/norman`)
const sanitySource = require(`@smarterlabs/norman-source-sanity`)
const shopifySource = require(`@smarterlabs/norman-source-shopify`)
const lunrPlugin = require(`@smarterlabs/norman-plugin-lunr`)
const get = require(`lodash/get`)

let shopifyTotal = 0

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
			filetype: `json`,
		},
		'site-settings': {
			type: `singleton`,
		},
		'lunr-index': {
			type: `lunr`,
			fields: [`sku`, `title`],
		},
		netlify: {
			type: `singleton`,
			filetype: `toml`,
			data: {
				redirects: [
					{
						from: `/api/headers`,
						to: `https://postman-echo.com/headers`,
						status: 200,
						force: true,
						headers: {
							"Test-Header": `success`,
						},
					},
				],
			},
		},
		'images': {
			type: `asset`,
		},
	},
	on: {
		'data:sanity:product': ({ data, add }) => {
			data.sku = data.defaultProductVariant.sku
			add(`lunr-index`, data)
			add(`all-products`, data)
			add(`product`, data)
		},
		'data:shopify:product': ({ data, add }) => {
			console.log(`Fetched ${shopifyTotal += data.variants.length} Shopify variants`)
			data.variants.forEach(variant => {
				let { sku } = variant
				add(`all-products`, {
					sku,
					...data,
				})
			})
		},
		'data:sanity:siteSettings': ({ data, add }) => {
			add(`site-settings`, data)
			add(`images`, {
				fileName: `logo.svg`,
				url: get(data, `logo.asset.url`),
			})
		},
		'data:sanity:redirect': ({ add, data }) => {
			add(`netlify`, {
				redirects: [{
					from: data.from,
					to: data.to,
					status: data.status,
				}],
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
		lunrPlugin(),
	],
	dist: `dist`,
	filetype: `js`,
	space: process.env.NODE_ENV == `production` ? 0 : 3,
})

norman.build()