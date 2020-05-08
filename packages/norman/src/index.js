const deepMerge = require(`deepmerge`)
const { basename, join } = require(`path`)
const defaultOptions = require(`./default-options`)
const writeFiles = require(`./write-files`)
const findByUID = require(`./find-by-uid`)

class Norman{
	constructor(options){
		this.options = {
			...defaultOptions,
			...options,
		}

		this.eventListeners = {}
		this.files = {}
		this.assets = {}

		this.on = on.bind(this)
		this.emit = emit.bind(this)
		this.build = build.bind(this)
		this.add = add.bind(this)
		this.writeFiles = writeFiles.bind(this)

		for(let label in this.options.on){
			this.on(label, this.options.on[label])
		}

		return this
	}
}

async function build(){
	let start = new Date()
	let promises = []
	this.options.plugins.forEach(plugin => {
		promises.push(plugin(this))
	})
	console.log(`Loading plugins...`)
	await Promise.all(promises)
	console.log(`Loaded plugins`)
	console.log(`Writing files...`)
	await this.writeFiles()
	console.log(`Wrote files`)
	let finish = new Date()
	let ms = finish - start
	let sec = ms / 1000
	let min = sec / 60
	let totalTime
	if(min >= 1) totalTime = `${min} minutes`
	else if (sec >= 1) totalTime = `${sec} seconds`
	else totalTime = `${ms} milliseconds`
	console.log(`Built in ${totalTime}`)
	return this
}

function add(label, data, options) {
	if(!data) return
	options = {
		...this.options.defaults,
		...this.options.collections[label],
		...options,
	}
	// If we're overriding the path
	let fileName = label
	if(options.path){
		if(typeof options.path == `function`){
			fileName = options.path(data)
		}
		else{
			fileName = options.path
		}
	}
	let { files, assets } = this

	// List documents
	if(options.type == `list`){
		if(!files[fileName]){
			files[fileName] = []
		}
		// Merge item in list
		if(options.uid){
			if(!(`merge` in options) || options.merge == true){
				options.merge = `shallow`
			}
			let index = findByUID(files[fileName], data, options.uid)
			if (index > -1){
				if (options.merge == `shallow`) {
					let obj = files[fileName][index]
					for(let i in data){
						obj[i] = data[i]
					}
				}
				else if (options.merge == `deep`) {
					files[fileName][index] = deepMerge(files[fileName][index], data)
				}
				else {
					files[fileName].push(data)
				}
			}
			else{
				files[fileName].push(data)
			}
		}
		// Append to list
		else {
			files[fileName].push(data)
		}
	}

	// Singleton documents
	else if(options.type == `singleton`){
		if(options.merge){
			files[fileName] = {
				...files[fileName],
				...data,
			}
		}
		else {
			files[fileName] = data
		}
	}

	// Assets
	else if(options.type == `asset`){
		let filePath = fileName
		if(typeof data == `string`){
			data = {
				fileName: basename(data),
				url: data,
			}
		}
		if (data.fileName && data.url) {
			assets[join(filePath, data.fileName)] = data.url
		}
	}


	return this
}

function on(label, fn){
	const els = this.eventListeners
	if(!(label in els)){
		els[label] = []
	}
	els[label].push(fn)
	return this
}
function emit(labels, data, isPromise){
	const els = this.eventListeners
	if(!Array.isArray(labels)) labels = [labels]
	if (!isPromise) {
		labels.forEach(label => {
			if (!els[label]) return
			els[label].forEach(event => event({ data, ...this }))
		})
		return this
	}
	const promises = []
	labels.forEach(label => {
		if (!els[label]) return
		els[label].forEach(event => {
			promises.push(event({ data, ...this }))
		})
	})
	return Promise.all(promises)
}

module.exports = Norman