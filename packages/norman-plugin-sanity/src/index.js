const sanityClient = require(`@sanity/client`)
const fillReferences = require(`./fill-references`)

const defaultOptions = {
	query: `*[!(_id in path("drafts.**"))]`,
	dataset: `production`,
	maxReferenceDepth: 10,
	useCdn: false,
}

module.exports = function normanSourceSanity(options){
	options = {
		...defaultOptions,
		...options,
	}
	return async ({ emit }) => {
		const client = sanityClient({
			projectId: options.projectId,
			dataset: options.dataset,
			token: options.token,
			useCdn: options.useCdn,
		})
		const docs = await client.fetch(options.query, {})

		// Create an object to reference entries easier by Sanity ID
		const entriesByID = {}
		docs.forEach(doc => entriesByID[doc._id] = doc)

		docs.forEach(doc => {
			doc = fillReferences(doc, entriesByID, options.maxReferenceDepth)
			emit([`data:sanity`, `data:sanity:${doc._type}`], doc)
		})
	}
}