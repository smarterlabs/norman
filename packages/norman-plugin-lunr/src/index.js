const lunr = require(`lunr`)

module.exports = function normanPluginLunr(){
	return norman => {

		for (let i in norman.options.collections) {
			const collection = norman.options.collections[i]
			if (collection.type === `lunr`) {
				collection.lunr = true
				collection.type = `list`
				collection.filetype = `json`
			}
		}

		norman.on(`format`, ({ data }) => {
			if (!data.options.lunr) return data.contents
			console.log(`Creating Lunr index...`)
			data.contents = JSON.parse(data.contents)
			const index = lunr(function () {
				data.options.fields.forEach(field => {
					this.field(field)
				})
				data.contents.forEach(function (doc) {
					this.add(doc)
				}, this)
			})
			data.contents = JSON.stringify(index)
		})
	}
}