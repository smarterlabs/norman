const { outputFile } = require(`fs-extra`)
const { join } = require(`path`)
const download = require(`download`)
const js = require(`javascript-stringify`)

async function writeFiles(){
	let promises = []
	for (let originalPath in this.files) {
		let { space } = this.options
		if (!space) space = null
		else if (space == true) space = 3
		let contents
		let path = join(this.options.dist, `${originalPath}.${this.options.filetype}`)
		if(this.options.filetype == `json`){
			contents = JSON.stringify(this.files[originalPath], null, space)
		}
		else if(this.options.filetype == `js`){
			contents = [
				`module.exports`,
				`=`,
				js.stringify(this.files[originalPath], null, space),
			].join(space ? ` ` : ``)
		}
		promises.push(outputFile(path, contents))
	}
	for(let path in this.assets){
		let fullPath = join(this.options.dist, path)
		promises.push(downloadAsset(fullPath, this.assets[path]))
	}
	await Promise.all(promises)
}

async function downloadAsset(path, url){
	const contents = await download(url)
	await outputFile(path, contents)
}

module.exports = writeFiles