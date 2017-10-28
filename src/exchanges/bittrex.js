const Api = require('node-bittrex-api')
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

  static replaceAlt(asset) {
    return _.reduce(Bittrex.alts, (value, sym, alt) => value.replace(sym, alt), asset)
  }
  static fixPair(pair) {
    return Pair.flip(Bittrex.replaceAlt(pair)).replace('_','-')
  }

  // Public Methods

  ticker(pair) {
    return new Promise((resolve, reject) => {
      pair = Bittrex.fixPair(pair)

      this.bittrex.getmarketsummary({ market: pair },
        ({ success, result, message }) => {
          if(!success)
            return reject(message)

          let { Last, Ask, Bid, High, Low, Volume, TimeStamp } = result[0]
          resolve({
            last: Last,
            ask: Ask,
            bid: Bid,
            high: High,
            low: Low,
            volume: Volume,
            timestamp: new Date(TimeStamp).getTime()
          })
        })
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      this.bittrex.getcurrencies(
        ({ success, result, message }) => {
          if(!success)
            return reject(message)

          let assets = _.reduce(result, (result, data) => {
            let asset = data.Currency, alt
            asset = (alt = Bittrex.alts[asset]) ? alt : asset
            return data.IsActive ? result.concat([ asset ]) : result
          }, [])
          resolve(assets)
        })
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      this.bittrex.getmarkets(
        ({ success, result, message }) => {
          if(!success)
            return reject(message)

          let pairs = _.map(result, market => {
            let pair = Pair.flip(market.MarketName.replace('-','_'))
            pair = _.reduce(Bittrex.alts, (value, sym, alt) => value.replace(alt, sym), pair)
            return pair
          })
          resolve(pairs)
        })
    })
  }

  depth(pair, count=50) {
    return new Promise((resolve, reject) => {
      pair = Bittrex.fixPair(pair)

      this.bittrex.getorderbook({ market: pair, type: 'both', depth: count },
        ({ success, result, message }) => {
          if(!success)
            return reject(message)

          let depth = {
            asks: result.sell.splice(0, count),
            bids: result.buy.splice(0, count)
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
        })
    })
  }

  trades(pair, options={}) {
    console.warn('NOTE: Bittrex API v1.1 does not support any filters for market history')
    return new Promise((resolve, reject) => {
      let market = Bittrex.fixPair(pair)

      _.defaults(options, {
        limit: 50
      })

      this.bittrex.getmarkethistory({ market },
        ({ success, result, message }) => {
          if(!success)
            return reject(message)

          result = _.take(result, options.limit)

          resolve(_.map(result, t => ({
            id: t.Id,
            price: parseFloat(t.Price),
            amount: parseFloat(t.Quantity),
            type: t.OrderType.toLowerCase(),
            ts: new Date(t.TimeStamp).getTime()
          })))
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
      this.bittrex.getbalances(
        ({ success, result, message }) => {
          if(!success)
            return reject(message)

          let currencies = _.reduce(result, (result, currency) => {
            let asset = currency.Currency, alt
            asset = (alt = Bittrex.alts[asset]) ? alt : asset

            result[asset] = {
              balance: parseFloat(currency.Balance),
              available: parseFloat(currency.Available),
              pending: parseFloat(currency.Pending)
            }

            return result
          }, {})
          resolve(currencies)
        })
    })
  }

  address(currency) {
    return new Promise((resolve, reject) => {
      currency = Bittrex.replaceAlt(currency)

      this.bittrex.getdepositaddress({ currency },
        ({ success, result, message }) => {
          if(message === 'ADDRESS_GENERATING') {
            setTimeout(() => {
              this.address(currency)
                .then(resolve)
                .catch(reject)
            }, 1000)
          } else {
            if(success) {
              resolve(result.Address)
            } else {
              reject(message)
            }
          }
        })
    })
  }

  myTransactions(asset, options={ limit: 50 }) {
    return new Promise((resolve, reject) => {
      let data = { currency: Bittrex.replaceAlt(asset) }

      let withdraw = new Promise((resolve, reject) => {
        this.bittrex.getwithdrawhistory(data,
          ({ success, result, message }) => {
            if(!success)
              return reject(message)

            resolve(_.map(result, tx => ({
              ...tx,
              type: 'withdraw',
              ts: new Date(tx.Opened).getTime()
            })))
          })
      })
      let deposit = new Promise((resolve, reject) => {
        this.bittrex.getdeposithistory(data,
          ({ success, result, message }) => {
            if(!success)
              return reject(message)

            resolve(_.map(result, tx => ({
              ...tx,
              type: 'deposit',
              ts: new Date(tx.Opened).getTime()
            })))
          })
      })

      Promise.all(withdraw, deposit)
        .then(([ withdraws, deposits ]) => {
          let getStatus = tx => {
            if(tx.PendingPayment)
              return 'pending'
            if(tx.Canceled)
              return 'canceled'

            return 'completed'
          }

          let txs = _.concat(withdraws, deposits)
          txs = _.orderBy(txs, ['ts'], ['desc'])
          if(options.from)
            txs = _.some(txs, ({ ts }) =>  ts >= options.from)
          if(options.to)
            txs = _.some(txs, ({ ts }) =>  ts <= options.to)
          if(options.limit)
            txs = _.take(txs, options.limit)

          resolve(_.map(txs, tx => ({
            txid: tx.TxId,
            asset: tx.Currency,
            amount: parseFloat(tx.Amount),
            fee: parseFloat(tx.TxCost),
            address: tx.Address,
            type: tx.type,
            status: getStatus(tx),
            ts: tx.ts
          })))
        })
        .catch(err => reject(err))
    })
  }

  myTrades(pair, options={}) {
    console.warn('Bittrex does not provide individual trades. Can only query orders.')
    return new Promise((resolve, reject) => {
      if(!pair)
        return reject('No market pair provided.')

      pair = Bittrex.fixPair(pair)

      _.defaults(options, {
        limit: 50
      })

      this.bittrex.getorderhistory({ market: pair },
        ({ success, orders, message }) => {
          if(!success)
            return reject(message)

          orders = _.map(orders, order => ({
            id: order.OrderUuid,
            pair: pair,
            amount: parseFloat(order.Quantity),
            amount_filled: parseFloat(order.QuantityRemaining - order.QuantityRemaining),
            price: parseFloat(order.Limit),
            fee_asset: Pair.quote(pair), // NOTE: not sure if this is correct
            fee: parseFloat(order.Commission),
            type: order.OrderType.split('_')[1].toLowerCase(),
            ts: new Date(order.TimeStamp).getTime()
          }))

          if(options.from)
            orders = _.some(orders, ({ ts }) =>  ts >= options.from)
          if(options.to)
            orders = _.some(orders, ({ ts }) =>  ts <= options.to)
          if(options.limit)
            orders = _.take(orders, options.limit)

          resolve(orders)
        })
    })
  }

}

module.exports = Bittrex

Bittrex.alts = {
  'BCC': 'BCH'
}

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = Bittrex.fixPair(pair)

    return new Promise((resolve, reject) => {
      this.bittrex[`${type}limit`]({
          market: pair,
          quantity: amount,
          rate
        }, ({ success, result, message }) => {
          if(!success)
            return reject(message)

          let txid = result.uuid
          resolve({
            txid
          })
        })
    })
  }

}
