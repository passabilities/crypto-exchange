# v2.3.3

* Hot fix for Bitfinex balances.

# v2.3.2

* Need wallet type for Bitfinex balance and adderss fetching.

# v2.3.1

* Fix GDAX package to install.

# v2.3.0

* Add TypeScript typings.

# v2.2.4

* Context bug fixed. #11

# v2.2.3

* Fix `balances()` to return in format expected.

# v2.2.2

* Add alt name filter for DASH (`DSH -> DASH`) on Bitfinex.

# v2.2.1

* Add alt name filter for Bitcoin Cash (`BCC -> BCH`) on Bittrex and Liqui.

# v2.2.0

* Add `address` method to fetch or create deposit addresses for an assets.

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
