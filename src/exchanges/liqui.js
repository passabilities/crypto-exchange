const Api = require('node.liqui.io')
const _ = require('lodash')

const Pair = require('../../lib/pair')

const { key, secret } = require('../getKeys')('liqui')
const liqui = new Api(key, secret)

/**
 * NOTE: When dealing with pairs, they must be flipped before returned.
 */

class Liqui {

  // Public Methods

  ticker(pair) {
    return new Promise((resolve, reject) => {
      liqui.ticker(pair)
        .then( tick => {
          let { last, sell, buy, high, low, vol, updated } = tick[pair.toLowerCase()]
          resolve({
            last,
            ask: sell,
            bid: buy,
            high,
            low,
            volume: vol,
            timestamp: updated * 1000
          })
        })
        .catch(err => reject(err.error))
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
        .catch(reject)
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      liqui.info()
        .then( info => {
          let pairs = _.keys(info.pairs)
          pairs = _.map(pairs, p => p.toUpperCase())
          resolve(pairs)
        })
        .catch(err => reject(err.error))
    })
  }

  depth(pair, count=50) {
    return new Promise((resolve, reject) => {
      liqui.depth(pair, count)
        .then( depth => {
          depth = depth[pair.toLowerCase()]
          resolve(depth)
        })
        .catch(err => reject(err.error))
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
      liqui.getInfo()
        .then( result => {
          resolve(
            _.map(result.funds, (balance, asset) => {
              return {
                asset,
                balance,
                available: balance,
                // TODO: fetch active orders to determine pending balance
                pending: NaN
              }
            })
          )
        })
        .catch(err => reject(err.error))
    })
  }

}

module.exports = Liqui

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = pair.toLowerCase()
    return new Promise((resolve, reject) => {
      let params = { pair, rate, amount }
      liqui[type](params)
        .then( response => {
          resolve(response)
        })
        .catch(err => reject(err.error))
    })
  }

}
