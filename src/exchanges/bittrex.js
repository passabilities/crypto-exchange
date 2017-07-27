const Api = require('node.bittrex.api')
const _ = require('lodash')

const Pair = require('../../lib/pair')

/**
 * NOTE: Bittrex API returns pairs in "quote-base" order.
 */

class Bittrex {

  constructor({ key, secret }) {
    this.bittrex = Api
    this.bittrex.options({
      apikey: key,
      apisecret: secret
    })
  }

  // Public Methods

  ticker(pair) {
    pair = Pair.flip(pair).replace('_','-')
    return new Promise((resolve, reject) => {
      this.bittrex.getmarketsummary({ market: pair },
        (response) => {
          if(response.success) {
            let { Last, Ask, Bid, High, Low, Volume, TimeStamp } = response.result[0]
            resolve({
              last: Last,
              ask: Ask,
              bid: Bid,
              high: High,
              low: Low,
              volume: Volume,
              timestamp: new Date(TimeStamp).getTime()
            })
          } else {
            reject(response.message)
          }
        })
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      this.bittrex.getcurrencies( response => {
        if(response.success) {
          let assets = _.reduce(response.result, (result, data) => (
            data.IsActive ? result.concat([ data.Currency ]) : result
          ), [])
          resolve(assets)
        } else {
          reject(response.message)
        }
      })
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      this.bittrex.getmarkets( response => {
        if(response.success) {
          let pairs = _.map(response.result, market => (
            Pair.flip(market.MarketName.replace('-','_'))
          ))
          resolve(pairs)
        } else
          reject(response.message)
      })
    })
  }

  depth(pair, count=50) {
    pair = Pair.flip(pair).replace('_','-')
    return new Promise((resolve, reject) => {
      this.bittrex.getorderbook({ market: pair, type: 'both', depth: count },
        (response) => {
          let { success, result: { buy, sell } } = response
          if(success) {
            let depth = {
              asks: sell.splice(0, count),
              bids: buy.splice(0, count)
            }
            _.each(depth, (entries, type) => {
              depth[type] = _.map(entries, entry => {
                return [
                  parseFloat(entry.Rate),
                  parseFloat(entry.Quantity)
                ]
              })
            })
            resolve(depth)
          } else {
            reject(response.message)
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
      this.bittrex.getbalances( response => {
        if(response.success) {
          let currencies = _.map(response.result, (currency) => {
            return {
              asset: currency.Currency,
              balance: parseFloat(currency.Balance),
              available: parseFloat(currency.Available),
              pending: parseFloat(currency.Pending)
            }
          })
          resolve(currencies)
        } else
          reject(response.message)
      })
    })
  }

}

module.exports = Bittrex

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = Pair.flip(pair).replace('_','-')
    return new Promise((resolve, reject) => {
      this.bittrex[`${type}limit`]({
        market: pair,
        quantity: amount,
        rate
      }, response => {
        if(response.success) {
          let txid = response.result.uuid
          resolve({
            txid
          })
        } else {
          reject(response.message)
        }
      })
    })
  }

}
