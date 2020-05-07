# Norman

**Note:** This project is in alpha. Documentation is sparse and all APIs are subject to extreme change until beta.

A static data layer for modern websites and applications.

Norman takes data from APIs or any other source, and outputs JSON files. These JSON files can then be uploaded to serve as a static API, or be imported in your code just like a regular module.

## Installation

```bash
npm install @smarterlabs/norman --save
```

or with Yarn:

```bash
yarn add @smarterlabs/norman
```

## Usage

```js
const Norman = require(`@smarterlabs/norman`)
const sanitySource = require(`@smarterlabs/norman-source-sanity`)
const shopifySource = require(`@smarterlabs/norman-source-shopify`)

const norman = new Norman({
   // This is your JSON file "schema"
   collections: {
      // Will output an "all-products.json" file containing an array of objects
      // with product data from both Shopify and Sanity
      'all-products': {
         type: `list`,
         uid: `sku`,       // Object will be merged if the the "sku" property is the same
         merge: `shallow`,
      },
      'site-settings': {
         type: `singleton`,
         merge: `deep`,
      },
   },
   // An object of event handler functions
   // The key is the event label and the value is a function that executes
   // whenever that event occurs.
   on: {
      // Adds/merges some data to the all-products.json file from Sanity
      'data:sanity:product': ({ add, data }) => {
         add(`all-products`, {
            sku: data.sku,
            title: data.title,
         })
      },
      // Adds/merges some data to the all-products.json file from Shopify
      'data:shopify:product': ({ add, data }) => {
         data.variants.forEach(variant => {
            add(`all-products`, {
               sku: variant.sku,
               shopifyId: variant.id,
               inStock: variant.available,
               slug: `/product/${data.handle}`,
            })
         })
      },
   },
   // Source plugins
   plugins: [
      shopifySource({
         domain: `store-name.myshopify.com`,
         storefrontAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
      }),
      sanitySource({
         apiKey: process.env.SHOPIFY_API_KEY,
         projectId: `ic3ki3k`,
         dataset: `production`,
      }),
   ],
})
```