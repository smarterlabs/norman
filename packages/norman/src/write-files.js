const { outputFile } = require(`fs-extra`)
const { join } = require(`path`)

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
	await Promise.all(promises)
}

module.exports = writeFiles