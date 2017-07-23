# crypto-exchange [![npm](https://img.shields.io/npm/v/crypto-exchange.svg)](https://www.npmjs.com/package/crypto-exchange)

Pulls together list of crypto exchanges to interact with their API's in a uniform fashion.

The purpose of this project is to bring together a bunch of cryptocurrency markets into one standardized package.

## Available Exchanges

* Bitfinex
* Bittrex
* BTC-e
* GDAX
* Gemini
* Kraken
* Liqui
* Poloniex
* ~~Yunbi~~

## Usage

* **NOTE: Pairs are expected to be in the format *BASE_QUOTE***
* All methods return a promise with the result passed.

```javascript
  let { bittrex } = require('crypto-exchange')
  bittrex.pairs()
    .then( pairs => {
      console.log(pairs)
    })
  // [
  //   'LTC_BTC',
  //   'DOGE_BTC',
  //   'VTC_BTC',
  //   ...
  // ]
```

### Exchange List

List of all available exchanges from the package:

```javascript
  const exchanges = require('crypto-exchange')
  console.log(Object.keys(exchanges))
  // [
  //   'bittrex',
  //   'gdax'
  //   'kraken',
  //   'poloniex',
  //   ...
  // ]
```

### Public Methods

#### ticker

Return current ticker information for a given pair on an exchange.

```javascript
  ticker(pair) {
  }
```

###### Arguments

* `pair` string - Pair to get tickr information for.

###### Response

```javascript
  {
    last: 2336.00001284,
    ask: 2337.9,
    bid: 2337,
    high: 2380,
    low: 2133,
    volume: 6597.97852916,
    timestamp: 1500461237647 // in milliseconds
  }
```

#### assets

Returns the available assets on an exchange. If the asset is disabled/frozen, it is not included.

```javascript
  assets() {
  }
```

###### Response

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

#### pairs

Returns the available pairs on an exchange.

```javascript
  pairs() {
  }
```

###### Response

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

#### depth

Returns the depth of available buy and sell orders.

```javascript
  depth(pair[, count = 50]) {
  }
```

###### Arguments

* `pair` string - The pair to fetch the order book for.
* `depth` number (optional) - How big of an order book to return in each direction. DEFAULT: 50

###### Response

```javascript
{
  'asks': [
    [
      0.0994,     // price
      50.30181086 // volume
    ],
    ...
  ],
  'bids': [
    [
      0.09936617, // price
      90.59674753 // volume
    ],
    ...
  ]
}
```

### Authenticated Methods

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

#### buy/sell

Place a buy or sell order on an exchange.

```javascript
  buy(pair, amount[, rate]) {
  }
```

###### Arguments

* `pair` string - A pair value to trade against.
* `amount` number - Number representing the amount of ***BASE*** to buy/sell.
* `rate` number (optional) - Pass a specific rate of the pair to execute.

###### Response

```javascript

```

#### balances

Return current total, available, and pending balances for an exchange.

```javascript
  balances() {
  }
```

###### Response

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

## Donate

This project is a work in progress as I'm adding more exchanges and functions. Help support this project with donations or submit a PR!

BTC: `161kbECzKtDKfLXnC5Lwk2hgsQLtg7BNXd`

ETH: `0xae89158b43000e07e76b205b870a1e34653d2668`
