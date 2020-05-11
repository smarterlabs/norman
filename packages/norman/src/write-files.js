const { outputFile } = require(`fs-extra`)
const { join } = require(`path`)
const download = require(`download`)
const js = require(`javascript-stringify`)

const cwd = process.cwd()

async function writeFiles(){
	let promises = []
	for (let originalPath in this.files) {
		let { space } = this.options
		if (!space) space = null
		else if (space == true) space = 3
		let contents
		let path = join(cwd, this.options.dist, `${originalPath}.${this.options.filetype}`)
		if(this.options.filetype == `json`){
			contents = JSON.stringify(this.files[originalPath], null, space)
		}
		else if(this.options.filetype == `js`){
			contents = this.files[originalPath]
			// Removes functions
			contents = JSON.stringify(contents)
			contents = JSON.parse(contents)

			contents = js.stringify(contents, null, space)
			contents = [`module.exports`, `=`, contents].join(space ? ` ` : ``)
		}
		promises.push(outputFile(path, contents))
	}
	for(let path in this.assets){
		let fullPath = join(cwd, this.options.dist, path)
		promises.push(downloadAsset(fullPath, this.assets[path]))
	}
	await Promise.all(promises)
}

async function downloadAsset(path, url){
	const contents = await download(url)
	await outputFile(path, contents)
}

module.exports = writeFiles