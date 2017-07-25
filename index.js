const Bitstamp  = require('./src/exchanges/bitstamp')
const Bitfinex  = require('./src/exchanges/bitfinex')
const Bittrex   = require('./src/exchanges/bittrex')
const BTCe      = require('./src/exchanges/btce')
const GDAX      = require('./src/exchanges/gdax')
const Gemini    = require('./src/exchanges/gemini')
const Kraken    = require('./src/exchanges/kraken')
const Liqui     = require('./src/exchanges/liqui')
const Poloniex  = require('./src/exchanges/poloniex')
const Yunbi     = require('./src/exchanges/yunbi')

module.exports = {
  bitstamp: new Bitstamp,
  bitfinex: new Bitfinex,
  bittrex:  new Bittrex,
  btce:     new BTCe,
  gdax:     new GDAX,
  gemini:   new Gemini,
  kraken:   new Kraken,
  liqui:    new Liqui,
  poloniex: new Poloniex,
  // yunbi:    new Yunbi
}
