# crypto-exchange
Pulls together list of crypto exchanges to interact with their API's in a uniform fashion.

The purpose of this project is to bring together a bunch of cryptocurrency markets into one standardized package.

## Available Exchanges

* Bittrex
* GDAX
* Kraken
* Poloniex

## Usage

* **NOTE: Pairs are expected to be in the format *BASE_QUOTE***
* All methods return a promise with the result passed.

```javascript
let { bittrex } = require('crypto-exchange')
bittrex.pairs()
  .then( pairs => {
    console.log(pairs)
  })
// => [
//      'LTC_BTC',
//      'DOGE_BTC',
//      'VTC_BTC',
//      ...
//    ]
```

## Public Methods

### assets

Returns the available assets on an exchange. If the asset is disabled/frozen, it is not included.

```javascript
  assets() {
  }
```

##### Response

```javascript
  [
    'AMP',
    'ARDR',
    'BCY',
    'BELA',
    'BLK',
    'BTC',
    ...
  ]
```

### pairs

Returns the available pairs on an exchange.

```javascript
  pairs() {
  }
```

##### Response

```javascript
  [
    'BCN_BTC',
    'BELA_BTC',
    'BLK_BTC',
    'BTCD_BTC',
    'BTM_BTC',
    ...
  ]
```

### orderbook

Returns the order book of the buy and sell orders.

```javascript
  orderbook(pair[, depth = 20]) {
  }
```

##### Arguments

* `pair` string - The pair to fetch the order book for.
* `depth` number (optional) - How big of an order book to return in each direction. DEFAULT: 20

##### Response

```javascript
{
  'buy': [
    [
      0.09936617, // price
      90.59674753 // volume
    ],
    ...
  ],
  'sell': [
    [
      0.0994,     // price
      50.30181086 // volume
    ],
    ...
  ]
}
```

## Authenticated Methods

To use authenticated methods, you will need to have a file called `api_keys.json` in the root of your project directory. Any necessary authentication for an exchange should be stored in this file.

All exchanges require a minimum of 2 items:
* `key`
* `secret`

Special case authentication:
* GDAX
  * `passphrase`

Example:
```json
{
  "bittrex": {
    "key": "",
    "secret": ""
  },
  "gdax": {
    "key": "",
    "secret": "",
    "passphrase": ""
  }
}
```

### buy/sell

Place a buy or sell order on an exchange.

```javascript
  buy(pair, amount[, rate]) {
  }
```

##### Arguments

* `pair` string - A pair value to trade against.
* `amount` number - Number representing the amount of ***BASE*** to buy/sell.
* `rate` number (optional) - Pass a specific rate of the pair to execute.

##### Response

```javascript

```

### balances

Return current total, available, and pending balances for an exchange.

```javascript
  balances() {
  }
```

##### Response

```javascript
  {
    'ETH_BTC': {
      balance: 0.0000,
      available: 0.0000,
      pending: 0.0000
    },
    ...
  }
```

