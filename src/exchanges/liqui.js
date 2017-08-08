const Api = require('node.liqui.io')
const _ = require('lodash')

/**
 * NOTE: When dealing with pairs, they must be flipped before returned.
 */

class Liqui {

  constructor({ key, secret }) {
    this.liqui = new Api(key, secret)
  }

  // Public Methods

  ticker(pair) {
    return new Promise((resolve, reject) => {
      pair = _.reduce(Liqui.alts, (value, sym, alt) => value.replace(sym, alt), pair)
      this.liqui.ticker(pair)
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
          let alt, assets = _.reduce(pairs, (result, p) => result.concat(p.split('_')), [])
          assets = _.uniq(assets)
          assets = _.map(assets, a => (alt = Liqui.alts[a]) ? alt : a)
          resolve(assets)
        })
        .catch(reject)
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      this.liqui.info()
        .then( info => {
          let pairs = _.keys(info.pairs)
          pairs = _.map(pairs, pair => {
            pair = pair.toUpperCase()
            pair = _.reduce(Liqui.alts, (value, sym, alt) => value.replace(alt, sym), pair)
            return pair
          })
          resolve(pairs)
        })
        .catch(err => reject(err.error))
    })
  }

  depth(pair, count=50) {
    return new Promise((resolve, reject) => {
      pair = _.reduce(Liqui.alts, (value, sym, alt) => value.replace(sym, alt), pair)
      this.liqui.depth(pair, count)
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
      this.liqui.getInfo()
        .then( result => {
          resolve(
            _.reduce(result.funds, (result, balance, asset) => {
              asset = (alt = Liqui.alts[asset]) ? alt : asset

              result[asset] = {
                balance,
                available: balance,
                // TODO: fetch active orders to determine pending balance
                pending: NaN
              }

              return result
            }, {})
          )
        })
        .catch(err => reject(err.error))
    })
  }

  address(asset) {
    return new Promise((resolve, reject) => {
      asset = _.reduce(Liqui.alts, (value, sym, alt) => value.replace(sym, alt), asset)
      // TODO: fetch addresses - Endpoint does not exist.
      reject('Not implemented.')
    })
  }

}

module.exports = Liqui

Liqui.alts = {
  'BCC': 'BCH'
}

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = _.reduce(Liqui.alts, (value, sym, alt) => value.replace(sym, alt), pair)
    pair = pair.toLowerCase()
    return new Promise((resolve, reject) => {
      let params = { pair, rate, amount }
      this.liqui[type](params)
        .then( response => {
          resolve(response)
        })
        .catch(err => reject(err.error))
    })
  }

}
