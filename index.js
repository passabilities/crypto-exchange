const Bittrex   = require('./src/exchanges/bittrex')
const GDAX      = require('./src/exchanges/gdax')
const Kraken    = require('./src/exchanges/kraken')
const Poloniex  = require('./src/exchanges/poloniex')
const Yunbi     = require('./src/exchanges/yunbi')

module.exports = {
  bittrex: new Bittrex,
  gdax: new GDAX,
  kraken: new Kraken,
  poloniex: new Poloniex,
  yunbi: new Yunbi
}
