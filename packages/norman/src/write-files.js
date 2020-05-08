const { outputFile } = require(`fs-extra`)
const { join } = require(`path`)
const download = require(`download`)

async function writeFiles(){
	let promises = []
	for (let originalPath in this.files) {
		let { formatJson } = this.options
		if (!formatJson) formatJson = null
		else if(formatJson == true) formatJson = 3
		let contents = JSON.stringify(this.files[originalPath], null, formatJson)
		let path = join(this.options.dist, `${originalPath}.${this.options.filetype}`)
		if(this.options.filetype == `js`){
			contents = `module.exports = ${contents}`
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
	console.log(`downloadAsset`)
	const contents = await download(url)
	await outputFile(path, contents)
}

module.exports = writeFiles