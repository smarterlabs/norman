exports.on = function(label, fn) {
	const els = this.eventListeners
	if (!(label in els)) {
		els[label] = []
	}
	els[label].push(fn)
	return this
}
exports.emit = function(labels, data, isPromise) {
	const els = this.eventListeners
	if (!Array.isArray(labels)) labels = [labels]
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