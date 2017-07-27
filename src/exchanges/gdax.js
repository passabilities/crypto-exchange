const Api = require('gdax')
const _ = require('lodash')

/**
 * NOTE: GDAX API returns pairs in "base-quote" order.
 */

class GDAX {

  constructor({ key, secret, passphrase }) {
    this.gdax = new Api.AuthenticatedClient(key, secret, passphrase)
  }

  // Public Methods

  ticker(pair) {
    pair = pair.replace('_','-')
    return new Promise((resolve, reject) => {
      let client = new Api.PublicClient(pair)
      client.getProductTicker(
        (err, response, data) => {
          if(err) {
            reject(err.message)
          } else {
            let { price, ask, bid, volume, time } = data
            resolve({
              last: parseFloat(price),
              ask: parseFloat(ask),
              bid: parseFloat(bid),
              high: 'N/A',
              low: 'N/A',
              volume: parseFloat(volume),
              timestamp: new Date(time).getTime()
            })
          }
        })
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      this.gdax.getCurrencies((err, response, data) => {
        if(err) {
          reject(err.message)
        } else {
          let assets = _.map(data, 'id')
          resolve(assets)
        }
      })
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      this.gdax.getProducts((err, response, data) => {
        if(err) {
          reject(err.message)
        } else {
          let pairs = _.map(data, (pair) => {
            return pair.id.replace('-','_')
          })
          resolve(pairs)
        }
      })
    })
  }

  depth(pair, count=50) {
    pair = pair.replace('_','-')
    return new Promise((resolve, reject) => {
      let args = {
        level: 3 // Get full order book
      }
      this.gdax.getProductOrderBook(args, pair,
        (err, response, data) => {
          if(err) {
            reject(err)
          } else {
            let depth = {
              asks: data.asks.splice(0, count),
              bids: data.bids.splice(0, count)
            }
            _.each(depth, (entries, type) => {
              depth[type] = _.map(entries, entry => _.map(entry.splice(0,2), parseFloat))
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
      this.gdax.getAccounts((err, response, data) => {
        if(err) {
          reject(err.message)
        } else {
          let balances = _.map(data, (acct) => {
            return {
              asset: acct.currency,
              balance: parseFloat(acct.balance),
              available: parseFloat(acct.available),
              pending: parseFloat(acct.holds)
            }
          })
          resolve(balances)
        }
      })
    })
  }

}

module.exports = GDAX

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    let params = {
      'product_id': pair,
      'price': rate,
      'size': amount
    }

    return new Promise((resolve, reject) => {
      this.gdax[type](params, (err, response, data) => {
        if(err) {
          reject(err.message)
        } else {
          let txid = data.id
          resolve({txid})
        }
      })
    })
  }
}
