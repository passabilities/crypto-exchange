const Bittrex   = require('./src/exchanges/bittrex')
const GDAX      = require('./src/exchanges/gdax')
const Kraken    = require('./src/exchanges/kraken')
const Poloniex  = require('./src/exchanges/poloniex')

module.exports = {
  bittrex: new Bittrex,
  gdax: new GDAX,
  kraken: new Kraken,
  poloniex: new Poloniex
}
