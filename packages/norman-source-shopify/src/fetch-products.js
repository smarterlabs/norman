module.exports = async function fetchProducts(norman, client, options, page = 1, failures = 1, previousFetch) {
	let products
	let newProducts
	try {
		if (!previousFetch) {
			products = await client.product.fetchAll(options.fetchSize)
		}
		else {
			products = await client.fetchNextPage(previousFetch)
		}
	}
	catch (err) {
		console.error(err)
		failures++
		if(failures >= options.maxFailures){
			console.log(`Maximum number of errors hit (${options.maxFailures})`)
		}
		setTimeout(() => fetchProducts(norman, client, options, page, failures, previousFetch), options.timeout)
		return
	}

	if (Array.isArray(products)) {
		previousFetch = products
		newProducts = [...products]
	}
	else {
		previousFetch = products.model
		newProducts = [...products.model]
	}
	norman.emit(`data:shopify`, newProducts)
	newProducts.forEach(product => {
		norman.emit(`data:shopify:product`, product)
		// if(product.variants){
		// 	product.variants.forEach(variant => {
		// 		norman.emit(`data:shopify:product:variant`, variant)
		// 	})
		// }
	})

	page++
	let lastProd = newProducts[newProducts.length - 1]

	// Continue if there's another page
	if (lastProd.hasNextPage && (!options.pageLimit || page <= options.pageLimit)) {
		await fetchProducts(norman, client, options, page, failures, previousFetch)
	}

}