const Api = require('btc-e')
const _ = require('lodash')

const Pair = require('../../lib/pair')

/**
 * NOTE: When dealing with pairs, they must be flipped before returned.
 */

class BTCe {

  constructor({ key, secret }) {
    this.btce = new Api(key, secret)
  }

  // Public Methods

  ticker(pair) {
    return new Promise((resolve, reject) => {
      pair = pair.toLowerCase()
      this.btce.ticker(pair,
        (err, tick) => {
          if(err) {
            reject(err.message)
          } else {
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
        .catch(reject)
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      this.btce.info((err, data) => {
        if(err) {
          reject(err.message)
        } else {
          resolve(_.map(data.pairs, (info, pair) => pair.toUpperCase()))
        }
      })
    })
  }

  depth(pair, count=50) {
    return new Promise((resolve, reject) => {
      pair = pair.toLowerCase()
      this.btce.depth(pair, count,
        (err, depth) => {
          if(err) {
            reject(err.message)
          } else {
            depth = depth[pair.toLowerCase()]
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
      this.btce.getInfo()
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

module.exports = BTCe

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = pair.toLowerCase()
    return new Promise((resolve, reject) => {
      let params = { pair, type, rate, amount }
      this.btce.trade(params)
        .then( response => {
          resolve(response)
        })
        .catch(err => reject(err.error))
    })
  }

}
