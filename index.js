const Bittrex   = require('./src/exchanges/bittrex')
const GDAX      = require('./src/exchanges/gdax')
const Kraken    = require('./src/exchanges/kraken')

module.exports = {
  bittrex: new Bittrex,
  gdax: new GDAX,
  kraken: new Kraken
}
