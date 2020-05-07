const get = require(`lodash/get`)

function findByUID(arr, data, uidPath){
	let uid = get(data, uidPath)
	for(let index = arr.length; index--;){
		if (get(arr[index], uidPath) == uid){
			return index
		}
	}
	return -1
}

module.exports = findByUID