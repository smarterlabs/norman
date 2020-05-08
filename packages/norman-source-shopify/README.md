# @smarterlabs/norman-source-shopify

Allows use of Shopify data in [Norman](https://github.com/smarterlabs/norman#readme).

## Installation

```bash
npm install --save @smarterlabs/norman-source-shopify
```

or with Yarn

```bash
yarn add @smarterlabs/norman-source-shopify
```

## Usage

**Note:** At the moment, this plugin only pulls in product data. This may change in the future, but for now we welcome any pull requests to expand the functionality of this plugin.

```js
const Norman = require(`@smarterlabs/norman`)
const shopifySource = require(`@smarterlabs/norman-source-shopify`)

const norman = new Norman({
   plugins: [
      shopifySource({
         // Required options
         domain: `store-name.myshopify.com`,
         storefrontAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,

         // Other options and defaults
         maxFailures: 20,  // Number of failed fetches allowed before exiting process
         fetchSize: 250,   // Number of products to fetch at once, max 250
         timeout: 1000,    // Number of ms to wait before retrying after a fetch error
         pageLimit: 0,     // Set to zero to not restrict the number of page requests
      }),
   ],
   on: {
      'data:shopify:product': ({ data }) => {
         console.log(`Product:`, data)
      },
   }
})
```