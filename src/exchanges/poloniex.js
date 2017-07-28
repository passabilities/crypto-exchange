const Api = require('poloniex-api-node')
const _ = require('lodash')

const Pair = require('../../lib/pair')

/**
 * NOTE: When dealing with pairs, they must be flipped before returned.
 */

class Poloniex {

  constructor({ key, secret }) {
    this.plnx = new Api(key, secret)
  }

  // Public Methods

  static get public() { return new Poloniex({ key: '', secret: '' }) }

  static ticker() { return Poloniex.public.ticker(...arguments) }
  ticker(pair) {
    pair = Pair.flip(pair)

    return new Promise((resolve, reject) => {
      this.plnx.returnTicker()
        .then( tickers => {
          let { last, lowestAsk, highestBid, high24hr, low24hr, quoteVolume } = tickers[pair]
          resolve({
            last: parseFloat(last),
            ask: parseFloat(lowestAsk),
            bid: parseFloat(highestBid),
            high: parseFloat(high24hr),
            low: parseFloat(low24hr),
            volume: parseFloat(quoteVolume),
            timestamp: Date.now()
          })
        })
        .catch(err => reject(err.message))
    })
  }

  static assets() { return Poloniex.public.assets(...arguments) }
  assets() {
    return new Promise((resolve, reject) => {
      this.plnx.returnCurrencies()
        .then( currencies => {
          currencies = _.reduce(currencies, (result, data, sym) => (
            (!data.delisted && !data.disabled) ? result.concat([ sym ]) : result
          ), [] )
          resolve(currencies)
        })
        .catch(err => reject(err.message))
    })
  }

  static pairs() { return Poloniex.public.pairs(...arguments) }
  pairs() {
    return new Promise((resolve, reject) => {
      this.plnx.returnTicker()
        .then( tickers => {
          let pairs = _.keys(tickers)
          pairs = _.map(pairs, Pair.flip)
          resolve(pairs)
        })
        .catch(err => reject(err.message))
    })
  }

  static depth() { return Poloniex.public.depth(...arguments) }
  depth(pair, count=50) {
    pair = Pair.flip(pair)
    return new Promise((resolve, reject) => {
      this.plnx.returnOrderBook(pair, count)
        .then( depth => {
          depth = _.pick(depth, ['asks','bids'])
          _.each(depth, (entries, type) => {
            depth[type] = _.map(entries, entry => _.map(entry, parseFloat))
          })
          resolve(depth)
        })
        .catch(err => reject(err.message))
    })
  }

  // Authenticated Methods

  buy() {
    return privateMethods.addOrder.apply(this, ['buy', ...arguments])
  }

  sell() {
    return privateMethods.addOrder.apply(this, ['sell', ...arguments])
  }

  balances(account) {
    return new Promise((resolve, reject) => {
      this.plnx.returnCompleteBalances(account)
        .then( currencies => {
          resolve(
            _.map(currencies, (data, asset) => {
              let available = parseFloat(data.available)
              let pending = parseFloat(data.onOrders)
              return {
                asset,
                balance: available + pending,
                available,
                pending
              }
            })
          )
        })
        .catch(err => reject(err.message))
    })
  }

}

module.exports = Poloniex

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = Pair.flip(pair)
    return new Promise((resolve, reject) => {
      this.plnx[type](pair, rate, amount, false, false, false)
        .then( response => {
          let txid = response.orderNumber
          resolve({
            txid
          })
        })
        .catch(err => reject(err.message))
    })
  }

}
