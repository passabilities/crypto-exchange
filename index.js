const Bittrex   = require('./src/exchanges/bittrex')
const GDAX      = require('./src/exchanges/gdax')

module.exports = {
  bittrex: new Bittrex,
  gdax: new GDAX
}
