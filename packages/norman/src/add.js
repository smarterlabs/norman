const deepMerge = require(`deepmerge`)
const { basename, join } = require(`path`)
const findByUID = require(`./find-by-uid`)

module.exports = function add(label, data, options) {
	if (!data) return
	options = {
		...this.options.defaults,
		...this.options.collections[label],
		...options,
	}
	// If we're overriding the path
	let fileName = label
	if (options.path) {
		if (typeof options.path == `function`) {
			fileName = options.path(data)
		}
		else {
			fileName = options.path
		}
	}
	let { files, fileOptions, assets } = this
	fileOptions[fileName] = options

	// List documents
	if (options.type == `list`) {
		if (!files[fileName]) {
			files[fileName] = []
		}
		// Merge item in list
		if (options.uid) {
			if (!(`merge` in options) || options.merge == true) {
				options.merge = `shallow`
			}
			let index = findByUID(files[fileName], data, options.uid)
			if (index > -1) {
				if (options.merge == `shallow`) {
					let obj = files[fileName][index]
					for (let i in data) {
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
			else {
				files[fileName].push(data)
			}
		}
		// Append to list
		else {
			files[fileName].push(data)
		}
	}

	// Singleton documents
	else if (options.type == `singleton`) {
		if (options.merge === `shallow`) {
			files[fileName] = {
				...files[fileName],
				...data,
			}
		}
		else if (options.merge === `deep`) {
			files[fileName] = deepMerge(files[fileName], data)
		}
		else {
			files[fileName] = data
		}
	}

	// Assets
	else if (options.type == `asset`) {
		let filePath = fileName
		if (typeof data == `string`) {
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