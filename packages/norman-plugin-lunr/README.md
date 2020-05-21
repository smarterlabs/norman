# @smarterlabs/norman-plugin-lunr

Creates lunr indexes with [Norman](https://github.com/smarterlabs/norman#readme).

## Installation

```bash
npm install --save @smarterlabs/norman-plugin-lunr
```

or with Yarn

```bash
yarn add @smarterlabs/norman-plugin-lunr
```

## Usage

```js
const Norman = require(`@smarterlabs/norman`)
const lunrPlugin = require(`@smarterlabs/norman-source-shopify`)

const norman = new Norman({
   collections: {
      'lunr-index': {
         type: `lunr`,
         ref: `id`,
         fields: [`title`, `sku`]
      },
   },
   on: {
      'data:shopify:product': ({ add, data }) => {
         add(`lunr-index`, data)
      },
   },
   plugins: [
      lunrPlugin(),
   ],
})
```