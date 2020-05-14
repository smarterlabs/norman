const get = require(`lodash/get`)

module.exports = async function build() {
	let start = new Date()
	let promises = []

	// Populate with default data
	let collections = get(this, `options.collections`, {})
	for (let name in collections) {
		let collection = collections[name]
		if (collection.data) {
			this.files[name] = collection.data
			this.fileOptions[name] = {
				...this.fileOptions[name],
				...collection,
			}
		}
	}

	// Add data from plugins
	this.options.plugins.forEach(plugin => {
		promises.push(plugin(this))
	})
	console.log(`Loading plugins...`)
	await Promise.all(promises)
	console.log(`Loaded plugins`)

	// Write results to files
	console.log(`Writing files...`)
	await this.writeFiles()
	console.log(`Wrote files`)

	// Display results
	let finish = new Date()
	let ms = finish - start
	let sec = ms / 1000
	let min = sec / 60
	let totalTime
	if (min >= 1) totalTime = `${min} minutes`
	else if (sec >= 1) totalTime = `${sec} seconds`
	else totalTime = `${ms} milliseconds`
	console.log(`Built in ${totalTime}`)
	return this
}