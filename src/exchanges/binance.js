const Api = require('binance-api-node').default
const _ = require('lodash')

class Binance {

  constructor({key, secret}) {
    this.binance = Api({
      apiKey: key,
      apiSecret: secret
    })

  }

  //Public Methods

  ticker(pair) {
    const symbol = pair.replace('_','')
    return new Promise((resolve, reject) => {
      this.binance.dailyStats({ symbol })
        .then(ticker => {
          let { lastPrice, askPrice, bidPrice, highPrice, lowPrice, volume } = ticker
          resolve({
            last: parseFloat(lastPrice),
            ask: parseFloat(askPrice),
            bid: parseFloat(bidPrice),
            high: parseFloat(highPrice),
            low: parseFloat(lowPrice),
            volume: parseFloat(volume),
            timestamp: Date.now()
          })
        })
        .catch(err => reject(err.message))
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      this.binance.exchangeInfo()
        .then(info => {
          let pairs = []
          let symbols = info.symbols
          for (let i = 0; i < symbols.length; i++) {

            let {status, baseAsset} = symbols[i]
            // Exclude non-trading symbols
            if (status !== 'TRADING') continue
            pairs[i] = baseAsset
          }
          resolve(pairs)
        }).catch(err => reject(err.message))
    })
  }

  pairs() {
    return new Promise(((resolve, reject) => {
      this.binance.exchangeInfo().then(info => {
        let pairs = []
        let symbols = info.symbols
        for (let i = 0; i < symbols.length; i++) {

          let {status, baseAsset, quoteAsset} = symbols[i]
          // Exclude non-trading symbols
          if (status !== 'TRADING') continue
          pairs[i] = baseAsset + '_' + quoteAsset
        }

        resolve(pairs)
      }).catch(err => reject(err.message))
    }))

  }

  depth(pair, count = 50) {
    return new Promise(((resolve, reject) => {
      pair = pair.replace('_', '')

      this.binance.book({symbol: pair, limit: count})
        .then(info => {
          let depth = {
            asks: _.map(info.asks, item => [parseFloat(item.price), parseFloat(item.quantity)]),
            bids: _.map(info.bids, item => [parseFloat(item.price), parseFloat(item.quantity)])
          }
          resolve(depth)
        }).catch(err => reject(err.message))
    }))
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
      this.binance.accountInfo()
        .then(accInfo => {
          let balances = {}
          _.map(accInfo.balances, (bal) => balances[bal.asset] = {
            balance: parseFloat(bal.free + bal.locked),
            available: parseFloat(bal.free),
            pending: parseFloat(bal.locked)
          })
          resolve(balances)
        })
        .catch(err => reject(err.message))
    })
  }

  address(asset) {
    return new Promise((resolve, reject) => {
      this.binance.depositAddress({asset: asset})
        .then(response => {
          if (response.success) resolve(response.address)
          else reject(response.success)
        })
        .catch(err => reject(err.message))
    })

  }
}

module.exports = Binance

const privateMethods = {
  addOrder(side, pair, amount, rate, type, extra = {}) {
    pair = pair.replace('_', '')
    let data = {
      symbol: pair,
      side: side.toUpperCase(),
      type: type || 'LIMIT'
      timeInForce: 'GTC'
      quantity: amount,
      price: rate,
      ...extra
    }
    return new Promise((resolve, reject) => {
      this.binance.order(data)
        .then(response => {
          const txid = response.orderId
          resolve({txid})
        })
        .catch(err => reject(err.message))
    })
  }
}
