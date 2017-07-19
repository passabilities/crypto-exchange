const Api = require('yunbi-api-module')
const _ = require('lodash')

const Pair = require('../../lib/pair')

const { key, secret } = require('../getKeys')('yunbi')
const yunbi = new Api(key, secret)

/**
 * NOTE: When dealing with pairs, replace '/' with an underscore.
 */

class Yunbi {

  // buy() {
  //   return privateMethods.addOrder.apply(this, ['buy', ...arguments])
  // }
  //
  // sell() {
  //   return privateMethods.addOrder.apply(this, ['sell', ...arguments])
  // }
  //
  // balances(account) {
  //   return new Promise((resolve, reject) => {
  //     yunbi.getAccount(
  //       (err, account) => {
  //         if(err) {
  //           reject(err)
  //         } else {
  //           resolve(
  //             _.map(account.accounts, a => {
  //               let a = parseFloat(data.available), o = parseFloat(data.onOrders)
  //               {"currency":"cny", "balance":"100243840.0", "locked":"0.0"},
  //               let { currency, balance, locked } = a
  //               balance = parseFloat(balance)
  //               locked = parseFloat(locked)
  //               return {
  //                 asset: currency,
  //                 balance,
  //                 available: balance - locked,
  //                 pending: locked
  //               }
  //             })
  //           )
  //         }
  //       })
  //   })
  // }

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
      yunbi.getMarkets(
        (err, markets) => {
          if(err) {
            reject(err)
          } else {
            markets = _.map(markets, m => {
              let alt
              let [base, quote] = m.name.split('/')

              base = (alt = Yunbi.alts[base]) ? alt : base
              quote = (alt = Yunbi.alts[quote]) ? alt : quote

              return `${base}_${quote}`
            })
            resolve(markets)
          }
        })
    }).catch(console.log)
  }

  depth(pair) {
    pair = pair.replace('_','').toLowerCase()
    return new Promise((resolve, reject) => {
      yunbi.getOrderBook(pair, null,
        (err, depth) => {
          if(err) {
            reject(err)
          } else {
            depth = { buy: depth.bids, sell: depth.asks }
            _.each(depth, (entries, type) => {
              depth[type] = _.map(entries, entry => {
                let { price, volume } = entry
                return [
                  parseFloat(price),
                  parseFloat(volume)
                ]
              })
            })
            resolve(depth)
          }
        })
    })
  }

}

module.exports = Yunbi

Yunbi.alts = {
  '1SŦ': '1ST'
}

const privateMethods = {

  // addOrder(type, pair, amount, rate) {
  //   pair = pair.replace('_','').toLowerCase()
  //   return new Promise((resolve, reject) => {
  //     yunbi.createOrder(pair, type, amount, rate, null
  //       (err, response) => {
  //         if(err) {
  //           reject(error)
  //         } else {
  //           resolve(true)
  //         }
  //       })
  //   })
  // }

}
