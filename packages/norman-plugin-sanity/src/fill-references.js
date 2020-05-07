module.exports = function fillReferences(obj, entriesByID, maxDepth, depth = 1) {
	depth++
	if (depth >= maxDepth) return obj
	if (typeof obj != `object`) return obj
	for (let i in obj) {
		if (obj[i]._ref) {
			if (!entriesByID[obj[i]._ref]) {
				console.error(`Reference not found!`)
				process.exit(1)
			}
			obj[i] = entriesByID[obj[i]._ref]
		}
		obj[i] = fillReferences(obj[i], entriesByID, maxDepth, depth)
	}
	return obj
}