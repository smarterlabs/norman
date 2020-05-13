const defaultOptions = require(`./default-options`)
const writeFiles = require(`./write-files`)
const build = require(`./build`)
const add = require(`./add`)
const { on, emit } = require(`./events`)

module.exports = class Norman {
	constructor(options) {
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

		for (let label in this.options.on) {
			this.on(label, this.options.on[label])
		}

		return this
	}
}