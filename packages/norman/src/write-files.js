const { outputFile } = require(`fs-extra`)
const { join } = require(`path`)
const download = require(`download`)
// const js = require(`javascript-stringify`)
const toml = require(`@iarna/toml`)

const cwd = process.cwd()

const maxDepth = 200

function deepClone(o, depth = 0){
	depth = depth + 1
	if(typeof o !== `object`){
		return o
	}
	if(depth > maxDepth){
		return
	}
	if(Array.isArray(o)){
		const clone = []
		for(let i = 0; i < o.length; i++){
			clone[i] = deepClone(o[i], depth)
		}
		return clone
	}
	const clone = {}
	for(let i in o){
		clone[i] = deepClone(o[i], depth)
	}
	return clone
}

// function removeCircularReferences(o){
// 	const cache = []
// 	o = JSON.stringify(o, function(_, value) {
// 		if (typeof value === `object` && value !== null) {
// 			if (cache.indexOf(value) !== -1) {
// 				// Circular reference found, discard key
// 				return
// 			}
// 			// Store value in our collection
// 			cache.push(value)
// 		}
// 		return value
// 	})
// 	return JSON.parse(o)
// }

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
		space = 3
		let contents = this.files[originalPath]

		// Remove circular references
		contents = deepClone(contents)

		let path = join(cwd, options.dist, `${originalPath}.${options.filetype}`)
		if (options.filetype === `json`) {
			contents = JSON.stringify(contents, null, space)
		}
		else if (options.filetype === `js`) {
			// Removes functions
			contents = JSON.stringify(contents)
			contents = JSON.parse(contents)

			// contents = js.stringify(contents, null, space)
			contents = JSON.stringify(contents, null, space)
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