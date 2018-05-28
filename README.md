# crypto-exchange [![npm](https://img.shields.io/npm/v/crypto-exchange.svg)](https://www.npmjs.com/package/crypto-exchange)

Pulls together list of crypto exchanges to interact with their API's in a uniform fashion.

The goal of this project is to be able to interact with a number of different cryptocurrency exchange markets with one standardized package.

## Available Exchanges

* Binance
* Bitfinex
* Bitstamp
* Bittrex
* ~~BTC-e~~ ***shutdown***
* GDAX
* Gemini
* Kraken
* Liqui
* Poloniex
* ~~Yunbi~~

## Usage

* ***NOTE*: Pairs are expected to be in the format *BASE_QUOTE***
* All methods return a promise with the result passed.

### Top Level

#### Exchange List

List of all available exchanges from the package:

```javascript
  const Exchanges = require('crypto-exchange')
  console.log(Object.keys(Exchanges))
  // [
  //   'bittrex',
  //   'gdax'
  //   'kraken',
  //   'poloniex',
  //   ...
  // ]
```

#### pairs

Quickly fetch all available pairs and which exchanges support them.

```javascript
  const Exchanges = require('crypto-exchange')
  Exchanges.pairs()
    .then(console.log)
  // {
  //   BTC_USD: [ 'bitfinex', 'gdax', 'gemini', 'kraken' ],
  //   LTC_USD: [ 'bitfinex', 'gdax', 'kraken' ],
  //   LTC_BTC: [ 'bitfinex', 'bittrex', 'gdax', 'kraken', 'liqui', 'poloniex' ],
  //   ETH_USD: [ 'bitfinex', 'gdax', 'gemini', 'kraken' ],
  //   ETH_BTC: [ 'bitfinex', 'bittrex', 'gdax', 'gemini', 'kraken', 'liqui', 'poloniex' ],
  //   ETC_BTC: [ 'bitfinex', 'bittrex', 'kraken', 'poloniex' ],
  //   ETC_USD: [ 'bitfinex', 'kraken' ],
  //   RRT_USD: [ 'bitfinex' ],
  //   ...
  // }
```

#### assets

Quickly fetch all available assets and which exchanges support them.

```javascript
  const Exchanges = require('crypto-exchange')
  Exchanges.assets()
    .then(console.log)
  // {
  //   BTC: [ 'bitfinex', 'bittrex', 'gdax', 'gemini', 'kraken', 'liqui', 'poloniex' ],
  //   USD: [ 'bitfinex', 'gdax', 'gemini', 'kraken' ],
  //   LTC: [ 'bitfinex', 'bittrex', 'gdax', 'kraken', 'liqui', 'poloniex' ],
  //   ETH: [ 'bitfinex', 'bittrex', 'gdax', 'gemini', 'kraken', 'liqui', 'poloniex' ],
  //   ETC: [ 'bitfinex', 'bittrex', 'kraken', 'poloniex' ],
  //   RRT: [ 'bitfinex' ],
  //   ...
  // }
```

### Public Methods

All public methods are both accessible via a static function and an instance method.
If only working with public methods, it is not neccessary to create an instance of the exchange class (one is created internally).

Both examples call the same method:
```javascript
  const Exchanges = require('crypto-exchange')

  Exchanges.poloniex.ticker('BTC_USDT')
  // => Promise { <pending> }

  const poloniex = new Exchanges.poloniex(apiKeys)
  poloniex.ticker('BTC_USDT')
  // => Promise { <pending> }
```

#### ticker

Return current ticker information for a given pair on an exchange.

```javascript
  ticker(pairs) {
  }
```

###### Arguments

* `pairs` string, array - One or more pairs to fetch the current ticker for.

###### Response

```javascript
  {
    'BTC_USD': {
      last: 2336.00001284,
      ask: 2337.9,
      bid: 2337,
      high: 2380,
      low: 2133,
      volume: 6597.97852916,
      timestamp: 1500461237647 // in milliseconds
    },
    ...
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
  depth(pairs[, count = 50]) {
  }
```

###### Arguments

* `pairs` string, array - One or more pairs to fetch the order book for.
* `depth` number (optional) - How big of an order book to return in each direction. DEFAULT: 50

###### Response

```javascript
  {
    'ETH_BTC': {
      'asks': [
        [
          0.06773,    // price
          10.30181086 // volume
        ],
        ...
      ],
      'bids': [
        [
          0.0676,     // price
          7.59674753  // volume
        ],
        ...
      ]
    },
    ...
  }
```

### Authenticated Methods

To use authenticated methods, you will need to pass any necessary authentication data needed from the exchange in the constructor of the exchange.

All exchanges require a minimum of 2 items:
* `key`
* `secret`

Special case authentication:
* GDAX
  * `passphrase`

Example:
```javascript
  const Exchanges = require('crypto-exchange')

  let bittrex = new Exchanges.bittrex({
    key: '',
    secret: ''
  })

  let gdax = new Exchanges.gdax({
    key: '',
    secret: '',
    passphrase: ''
  })
```

#### buy/sell

Place a buy or sell order on an exchange.

```javascript
  buy(pair, amount[, rate[, type[, extra]]]) {
  }
```

###### Arguments

* `pair` string - A pair value to trade against.
* `amount` number - Number representing the amount of ***BASE*** to buy/sell.
* `rate` number (optional) - Pass a specific rate of the pair to execute.
  * Only optional if exchange API allows "market orders." Must set `type` accordingly.
* `type` string (optional) - Define type of order to execute.
  * Not all exchanges allow to change order type (i.e. market orders).
  * For exchanges that `rate` is required, it will default to a limit order.
* `extra` object (optional) - Extra parameters that are REQUIRED by the exchange, if applicable.

###### Response

```javascript

```

#### balances

Return current total, available, and pending balances for an exchange.

***NOTE***: **Bitfinex** requires a wallet type to fetch. The underlying method fetches all wallet types on request and will refresh, if called, every 2 minutes to allow immediate subsequent calls.

```javascript
  balances([opts]) {
  }
```

###### Arguments

* `opts` object (optional) - Additional options.
  * `type` string (**Bitfinex**) - Wallet type ('deposit', 'exchange', 'trading').

###### Response

```javascript
  {
    'BTC': {
      balance: 0.0000,
      available: 0.0000,
      pending: 0.0000
    },
    ...
  }
```

#### address

Return or create a new address to which funds can be deposited.

***Note:*** Due to how **Coinbase** and GDAX are intertwined, you must pass aditional authentication in order to interact with outside resources.

***Note:*** **Bitfinex** requires a wallet type.

```javascript
  address(sym[, opts]) {
  }
```

###### Arguments

* `sym` string - The asset symbol of the address to fetch.
* `opts` object (optional) - Additional options.
  * `auth` object (**Coinbase**) - Secondary API authentication.
  * `type` string (**Bitfinex**) - Wallet type ('deposit', 'exchange', 'trading').

###### Response

```javascript
  "0xae89158b43000e07e76b205b870a1e34653d2668"
```

## Donate

This project is a work in progress as I'm adding more exchanges and functions. Help support this project with a :coffee: or PR!

BTC: `161kbECzKtDKfLXnC5Lwk2hgsQLtg7BNXd`

ETH: `0xae89158b43000e07e76b205b870a1e34653d2668`
