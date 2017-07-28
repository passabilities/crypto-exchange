const Api = require('bitfinex')
const _ = require('lodash')

/**
 * NOTE: Bittrex API returns pairs in "quote-base" order.
 */

class Bitfinex {

  constructor({ key, secret }) {
    this.bitfinex = new Api(key, secret)
  }

  // Public Methods

  static get public() { return new Bitfinex({ key: '', secret: '' }) }

  static ticker() { return Bitfinex.public.ticker(...arguments) }
  ticker(pair) {
    return new Promise((resolve, reject) => {
      pair = pair.replace('_','')
      this.bitfinex.ticker(pair,
        (err, tick) => {
          if(err) {
            reject(err.message)
          } else {
            let { last_price, ask, bid, high, low, volume, timestamp } = tick
            resolve({
              last: parseFloat(last_price),
              ask: parseFloat(ask),
              bid: parseFloat(bid),
              high: parseFloat(high),
              low: parseFloat(low),
              volume: parseFloat(volume),
              timestamp: Math.floor(parseFloat(timestamp) * 1000)
            })
          }
        })
    })
  }

  static assets() { return Bitfinex.public.assets(...arguments) }
  assets() {
    return new Promise((resolve, reject) => {
      this.pairs()
        .then( pairs => {
          let assets = _.reduce(pairs, (result, p) => result.concat(p.split('_')), [])
          assets = _.uniq(assets)
          resolve(assets)
        })
        .catch(reject)
    })
  }

  static pairs() { return Bitfinex.public.pairs(...arguments) }
  pairs() {
    return new Promise((resolve, reject) => {
      this.bitfinex.get_symbols(
        (err, pairs) => {
          if(err) {
            reject(err.message)
          } else {
            resolve(_.map(pairs, p => (
              p.replace(/(.{3})(.{3})/, '$1_$2')
                .toUpperCase()
            )))
          }
        })
    })
  }

  static depth() { return Bitfinex.public.depth(...arguments) }
  depth(pair, count=50) {
    return new Promise((resolve, reject) => {
      pair = pair.replace('_','')
      this.bitfinex.orderbook(pair, { limit_asks: count, limit_bids: count },
        (err, depth) => {
          if(err) {
            reject(err.message)
          } else {
            _.each(depth, (entries, type) => {
              depth[type] = _.map(entries, entry => {
                return [
                  parseFloat(entry.price),
                  parseFloat(entry.amount)
                ]
              })
            })
            resolve(depth)
          }
        })
    })
  }

  // Authenticated Methods

  buy() {
    return privateMethods.addOrder.apply(this, ['buy', ...arguments])
  }

  sell() {
    return privateMethods.addOrder.apply(this, ['sell', ...arguments])
  }

  balances() {
    return new Promise((resolve, reject) => {
      this.bitfinex.wallet_balances(
        (err, balances) => {
          if(err) {
            reject(err.message)
          } else {
            balances = _.filter(balances, b => b.type === 'exchange')
            balances = _.map(balances, (result, b) => {
              let balance = parseFloat(b.amount)
              let available = parseFloat(b.available)
              return {
                asset: b.currency.toUpperCase(),
                balance,
                available,
                pending: balance - available
              }
            })
            resolve(balances)
          }
        })
    })
  }

}

module.exports = Bitfinex

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    return new Promise((resolve, reject) => {
      pair = pair.replace('_','')
      amount = amount.toString()
      rate = rate.toString()
      this.bitfinex.new_order(pair, amount, rate, 'bitfinex', type, 'limit',
        (err, res) => {
          if(err) {
            reject(err.message)
          } else {
            resolve(res)
          }
        })
    })
  }

}
