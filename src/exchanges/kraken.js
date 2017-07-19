const Api = require('kraken-api')
const _ = require('lodash')

const Pair = require('../../lib/pair')

const { key, secret } = require('../getKeys')('kraken')
const kraken = new Api(key, secret)

/**
 * NOTE: Kraken API returns pairs with no separator and deals with alt-names for assets.
 */

class Kraken {

  // Public Methods

  assets() {
    return new Promise((resolve, reject) => {
      kraken.api('Assets', null, (err, data) => {
        if(err) {
          reject(err.message)
        } else {
          let alt, assets
          assets = _.map(data.result, ({ altname }) => (
            (alt = Kraken.alts[altname]) ? alt : altname
          ))
          resolve(assets)
        }
      })
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      kraken.api('AssetPairs', null, (err, pairData) => {
        if(err) {
          reject(err.message)
        } else {
          kraken.api('Assets', null, (err, assetData) => {
            if(err) {
              reject(err.message)
            } else {
              let pairs = _.map(pairData.result, ({ base, quote }) => {
                let asset, alt
                asset = _.find(assetData.result, (data, name) => name === base)
                base = asset ? asset.altname : base
                base = (alt = Kraken.alts[base]) ? alt : base

                asset = _.find(assetData.result, (data, name) => name === quote)
                quote = asset ? asset.altname : quote
                quote = (alt = Kraken.alts[quote]) ? alt : quote

                return `${base}_${quote}`
              })
              pairs = _.uniq(pairs)

              resolve(pairs)
            }
          })
        }
      })
    })
  }

  depth(pair, count=50) {
    pair = _.reduce(Kraken.alts, (value, sym, alt) => value.replace(sym, alt), pair)
    pair = pair.replace('_','')

    return new Promise((resolve, reject) => {
      kraken.api('Depth', { pair, count },
        (err, response) => {
          if(err) {
            reject(err)
          } else {
            let [depth] = _.values(response.result)
            depth = { buy: depth.bids, sell: depth.asks }
            _.each(depth, (entries, type) => {
              depth[type] = _.map(entries, entry => _.map(entry.slice(0, 2), parseFloat))
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
      kraken.api('Balance', null, (err, balanceResponse) => {
        if(err) {
          reject(err.message)
        } else {
          let balances = balanceResponse.result
          kraken.api('Assets', null, (err, assetData) => {
            if(err) {
              reject(err.message)
            } else {
              kraken.api('OpenOrders', null, (err, ordersResponse) => {
                if(err) {
                  reject(err)
                } else {
                  balances = _.map(balances, (balance, asset) => {
                    asset = _.find(assetData.result, (data, name) => name === asset)
                    asset = asset ? asset.altname : asset

                    balance = parseFloat(balance)
                    let pending = _.reduce(ordersResponse.result.open, (sum, o) => {
                      if(o.descr.pair.substring(0, asset.length) === asset)
                        return sum + parseFloat(o.vol)
                      return sum
                    }, 0)
                    let available = balance - pending

                    // Replace alt name after dealing with Kraken response
                    let alt
                    asset = (alt = Kraken.alts[asset]) ? alt : asset

                    return {
                      asset,
                      balance,
                      available,
                      pending: balance - pending
                    }
                  })
                  resolve(balances)
                }
              })
            }
          })
        }
      })
    })
  }

}

module.exports = Kraken

Kraken.alts = {
  'XBT': 'BTC'
}

const privateMethods = {

  addOrder(type, pair, amount, rate, ordertype='limit') {
    pair = _.reduce(Kraken.alts, (value, sym, alt) => value.replace(sym, alt), pair)
    pair = pair.replace('_', '')

    let data = {
      pair,
      type,
      price: rate,
      ordertype,
      volume: amount
    }

    return new Promise((resolve, reject) => {
      kraken.api('AddOrder', data,
        (err, response) => {
          if(err) {
            reject(err.message)
          } else {
            let { txid } = response.result
            resolve({
              txid
            })
          }
        })
    })
  }

}
