const Api = require('gemini-api').default
const _ = require('lodash')

const Pair = require('../../lib/pair')

const { key, secret } = require('../getKeys')('gemini')
const gemini = new Api({ key, secret, sandbox: false })

/**
 * NOTE: Pairs are in the format 'basequote'.
 */

class Gemini {

  // Public Methods

  ticker(pair) {
    let exPair = pair.replace('_','')
    return new Promise((resolve, reject) => {
      gemini.getTicker(exPair)
        .then( ticker => {
          let { last, ask, bid, volume } = ticker
          resolve({
            last: parseFloat(last),
            ask: parseFloat(ask),
            bid: parseFloat(bid),
            high: 'N/A',
            low: 'N/A',
            volume: parseFloat(volume[Pair.quote(pair)]),
            timestamp: Date.now()
          })
        })
        .catch(err => reject(err.message))
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      // The api does not have an endpoint to return available assets.
      resolve([
        'BTC',
        'ETH',
        'USD'
      ])
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      // The api does not have a uniform way to parse the pairs.
      resolve([
        'BTC_USD',
        'ETH_USD',
        'ETH_BTC'
      ])
    })
  }

  depth(pair, count=50) {
    pair = pair.replace('_','')
    return new Promise((resolve, reject) => {
      let params = {
        limit_bids: count,
        limit_asks: count
      }
      gemini.getOrderBook(pair, params)
        .then( depth => {
          depth = { buy: depth.bids, sell: depth.asks }
          _.each(depth, (entries, type) => {
            depth[type] = _.map(entries, entry => [ parseFloat(entry.price), parseFloat(entry.amount) ])
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
      plnx.returnCompleteBalances(account)
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

module.exports = Gemini

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = Pair.flip(pair)
    return new Promise((resolve, reject) => {
      plnx.sell(pair, rate, amount, false, false, false)
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
