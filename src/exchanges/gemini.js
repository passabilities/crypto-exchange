const Api = require('gemini-api').default
const _ = require('lodash')

const Pair = require('../../lib/pair')

/**
 * NOTE: Pairs are in the format 'basequote'.
 */

class Gemini {

  constructor({ key, secret }) {
    this.gemini = new Api({ key, secret, sandbox: false })
  }

  static fixPair(pair) {
    return pair.replace('_','')
  }

  // Public Methods

  ticker(pair) {
    let exPair = Gemini.fixPair(pair)
    return new Promise((resolve, reject) => {
      this.gemini.getTicker(exPair)
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
    pair = Gemini.fixPair(pair)
    return new Promise((resolve, reject) => {
      let params = {
        limit_bids: count,
        limit_asks: count
      }
      this.gemini.getOrderBook(pair, params)
        .then( depth => {
          _.each(depth, (entries, type) => {
            depth[type] = _.map(entries, entry => [ parseFloat(entry.price), parseFloat(entry.amount) ])
          })
          resolve(depth)
        })
        .catch(err => reject(err.message))
    })
  }

  trades(pair, opts={}) {
    return new Promise((resolve, reject) => {
      pair = Gemini.fixPair(pair)

      _.defaults(opts, {
        limit: 50
      })
      opts.limit_trades = opts.limit

      this.gemini.getTradeHistory(pair, opts)
        .then( trades => {
          resolve(_.map(trades, t => ({
            id: t.tid,
            price: parseFloat(t.price),
            amount: parseFloat(t.amount),
            type: t.type,
            ts: t.timestampms
          })))
        }).catch(e => console.log(e))
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
      this.gemini.getMyAvailableBalances()
        .then( balances => {
          resolve(
            _.reduce(balances, (result, data) => {
              let balance = parseFloat(data.amount)
              let available = parseFloat(data.available)

              result[data.currency] = {
                balance,
                available,
                pending: balance - available
              }

              return result
            }, {})
          )
        })
        .catch(err => reject(err.message))
    })
  }

  address(asset) {
    return new Promise((resolve, reject) => {
      this.gemini.newAddress(asset)
        .then( response => {
          resolve(response.address)
        })
        .catch(err => reject(err.message))
    })
  }

  myTransactions(asset, opts={ limit: 50 }) {
    return new Promise((resolve, reject) => {
      reject('This feature is not supproted by Gemini.')
    })
  }

  myTrades(pair, opts={}) {
    return new Promise((resolve, reject) => {
      if(!pair)
        return reject('No pair provided.')

      pair = Gemini.fixPair(pair)

      _.defaults(opts, {
        limit: 50
      })
      opts.limit_trades = opts.limit

      this.gemini.getMyPastTrades(pair, opts)
        .then( trades => {
          resolve(_.map(trades, t => ({
            id: t.tid,
            pair,
            amount: parseFloat(t.amount),
            price: parseFloat(t.price),
            fee_asset: t.fee_currency,
            fee: parseFloat(t.fee_amount),
            type: t.type.toLowerCase(),
            ts: t.timestampms
          })))
        })
    })
  }

}

module.exports = Gemini

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = Gemini.fixPair(pair)
    return new Promise((resolve, reject) => {
      let params = {
        side: type,
        symbol: pair,
        amount,
        price: rate
      }
      this.gemini.newOrder(params)
        .then( response => {
          resolve(response)
        })
        .catch(err => reject(err.message))
    })
  }

}
