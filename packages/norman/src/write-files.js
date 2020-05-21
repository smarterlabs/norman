const { outputFile } = require(`fs-extra`)
const { join } = require(`path`)
const download = require(`download`)
const js = require(`javascript-stringify`)
const toml = require(`@iarna/toml`)

const cwd = process.cwd()

module.exports = async function writeFiles() {
	console.log(`Writing files...`)
	let promises = []
	for (let originalPath in this.files) {
		let options = {
			...this.options,
			...this.options.collections[originalPath],
			...this.fileOptions[originalPath],
		}
		let { space } = options
		if (!space) space = null
		else if (space == true) space = 3
		let contents = this.files[originalPath]
		let path = join(cwd, options.dist, `${originalPath}.${options.filetype}`)
		if (options.filetype === `json`) {
			contents = JSON.stringify(contents, null, space)
		}
		else if (options.filetype === `js`) {
			// Removes functions
			contents = JSON.stringify(contents)
			contents = JSON.parse(contents)

			contents = js.stringify(contents, null, space)
			contents = [`module.exports`, `=`, contents].join(space ? ` ` : ``)
		}
		else if (options.filetype === `toml`) {
			contents = toml.stringify(contents)
		}
		const input = { options, contents }
		this.emit(`format`, input)
		contents = input.contents
		promises.push(outputFile(path, contents))
	}
	for (let path in this.assets) {
		let options = {
			...this.options,
			...this.options.collections[path],
		}
		let fullPath = join(cwd, options.dist, path)
		promises.push(downloadAsset(fullPath, this.assets[path]))
	}
	await Promise.all(promises)
}

async function downloadAsset(path, url) {
	const contents = await download(url)
	await outputFile(path, contents)
}