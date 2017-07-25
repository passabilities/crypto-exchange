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
      bitstamp.balance(
        (err, balances) => {
          if(err) {
            reject(err.message)
          } else {
            balances = _.reduce(balances, (result, b, key) => {
              let [ asset, access ] = key.split('_')
              asset = asset.toUpperCase()
              access = access === 'reserved' ? 'pending' : access

              let balance = result[asset] || { asset }
              balance[access] = parseFloat(b)

              return result
            }, {})
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
      bitstamp[type](pair, amount, rate, null,
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
