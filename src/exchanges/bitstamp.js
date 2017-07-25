const Api = require('bitstamp')
const _ = require('lodash')

const Pair = require('../../lib/pair')

const { key, secret } = require('../getKeys')('bitstamp')
const bitstamp = new Api(key, secret)

/**
 * NOTE: Bittrex API returns pairs in "quote-base" order.
 */

class Bitstamp {

  // Public Methods

  ticker(pair) {
    return new Promise((resolve, reject) => {
      pair = pair.replace('_','').toLowerCase()
      bitstamp.ticker(pair,
        (err, tick) => {
          if(err) {
            reject(err)
          } else {
            let { last, ask, bid, high, low, volume, timestamp } = tick
            resolve({
              last: parseFloat(last),
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

  assets() {
    return new Promise((resolve, reject) => {
      this.pairs()
        .then( pairs => {
          let assets = _.reduce(pairs, (result, p) => result.concat(p.split('_')), [])
          assets = _.uniq(assets)
          resolve(assets)
        })
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      resolve([
        'BTC_USD',
        'BTC_EUR',
        'EUR_USD',
        'XRP_USD',
        'XRP_EUR',
        'XRP_BTC',
        'LTC_USD',
        'LTC_EUR',
        'LTC_BTC'
      ])
    })
  }

  depth(pair, count=50) {
    return new Promise((resolve, reject) => {
      pair = pair.replace('_','')
      bitstamp.order_book(pair,
        (err, depth) => {
          if(err) {
            reject(err.message)
          } else {
            depth = _.pick(depth, ['asks','bids'])
            _.each(depth, (entries, type) => {
              entries = entries.slice(0, count)
              depth[type] = _.map(entries, e => _.map(e, parseFloat))
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
      bitfinex.wallet_balances(
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

module.exports = Bitstamp

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    return new Promise((resolve, reject) => {
      pair = pair.replace('_','')
      amount = amount.toString()
      rate = rate.toString()
      bitfinex.new_order(pair, amount, rate, 'bitfinex', type, 'limit',
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
