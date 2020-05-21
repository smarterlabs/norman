const get = require(`lodash/get`)

module.exports = async function build() {

	// Init plugins
	console.log(`Loading plugins...`)
	this.options.plugins.forEach(plugin => plugin(this))
	console.log(`Loaded plugins`)

	await this.emit(`preBuild`, null, true)

	let start = new Date()


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

	console.log(`Building content...`)
	await this.emit(`build`, null, true)
	console.log(`Built content`)

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