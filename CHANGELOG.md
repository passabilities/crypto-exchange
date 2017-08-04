
* Add `address` method to fetch or create deposit addresses for assets for:
  * Bitfinex
  * Bittrex
  * Coinbase/GDAX
  * Kraken
  * Poloniex

# v2.1.1

* Cache `assets` and `pairs` after initial fetch per exchange.

# v2.1.0

* Can pass `ticker` and `depth` methods an array for quick batch fetching.
* Add `pairs` and `assets` methods to top level of module.
* BTCe is disabled due to site being taken down. [More info](http://www.reuters.com/article/us-greece-russia-arrest-idUSKBN1AB1OP)

# v2.0.1

* Add static methods for public functions. No need to create a new instance if only working with public functions.

# v2.0.0

* Exchanges do not come already instanciated and must now be done manually.
* Will not look for API keys in `api_keys.json` anymore. Instead, the keys are expected to be passed in on initialization of each exchange.

# v1.1.0

* Exchanges added:
  * Bitfinex
* `depth` method now returns `{ asks, bids }` instead of `{ sell, buy }`

# v1.0.3

* Exchanges added:
  * Liqui
  * BTC-e

# v1.0.2

* Exchanges added:
  * Gemini
* Poloniex buy/sell functions fixed.

# v1.0.1

* Exchanges added:
  * Bittrex
  * GDAX
  * Kraken
  * Poloniex
  * Yunbi
