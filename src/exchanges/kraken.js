const Api = require('kraken-api')
const _ = require('lodash')

/**
 * NOTE: Kraken API returns pairs in "basequote" order and deals with alt names.
 */

class Kraken {

  constructor({ key, secret }) {
    this.kraken = new Api(key, secret)
  }

  // Public Methods

  ticker(pair) {
    pair = _.reduce(Kraken.alts, (value, sym, alt) => value.replace(sym, alt), pair)
    pair = pair.replace('_','')

    return new Promise((resolve, reject) => {
      this.kraken.api('Ticker', { pair },
        (err, data) => {
          if(err)
            return reject(err.message)

          let { c: [last], a: [ask], b: [bid], h: [high], l: [low], v: [volume] } = _.values(data.result)[0]
          resolve({
            last: parseFloat(last),
            ask: parseFloat(ask),
            bid: parseFloat(bid),
            high: parseFloat(high),
            low: parseFloat(low),
            volume: parseFloat(volume),
            timestamp: Date.now()
          })
        })
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      this.kraken.api('Assets', null, (err, data) => {
        if(err)
          return reject(err.message)

        let alt, assets
        assets = _.map(data.result, ({ altname }) => (
          (alt = Kraken.alts[altname]) ? alt : altname
        ))
        resolve(assets)
      })
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      this.kraken.api('AssetPairs', null, (err, pairData) => {
        if(err)
          return reject(err.message)

        this.kraken.api('Assets', null, (err, assetData) => {
          if(err)
            return reject(err.message)

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
        })
      })
    })
  }

  depth(pair, count=50) {
    pair = _.reduce(Kraken.alts, (value, sym, alt) => value.replace(sym, alt), pair)
    pair = pair.replace('_','')

    return new Promise((resolve, reject) => {
      this.kraken.api('Depth', { pair, count },
        (err, response) => {
          if(err)
            return reject(err)

          let [depth] = _.values(response.result)
          _.each(depth, (entries, type) => {
            depth[type] = _.map(entries, entry => _.map(entry.slice(0, 2), parseFloat))
          })
          resolve(depth)
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
      this.kraken.api('Balance', null, (err, balanceResponse) => {
        if(err)
          return reject(err.message)

        let balances = balanceResponse.result
        this.kraken.api('Assets', null, (err, assetData) => {
          if(err)
            return reject(err.message)

          this.kraken.api('OpenOrders', null, (err, ordersResponse) => {
            if(err)
              return reject(err)

            balances = _.reduce(balances, (result, balance, asset) => {
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

              result[asset] = {
                balance,
                available,
                pending: balance - pending
              }

              return result
            }, {})
            resolve(balances)
          })
        })
      })
    })
  }

  address(asset) {
    return new Promise((resolve, reject) => {
      for(let alt in Kraken.alts) {
        if(Kraken.alts[alt] === asset) {
          asset = alt
          break
        }
      }

      this.kraken.api('DepositMethods', { asset },
        (err, response) => {
          if(err)
            return reject(err.message)

          let { method } = response.result[0]

          let data = { asset, method, new: true }
          this.kraken.api('DepositAddresses', data,
            (err, response) => {
              if(err)
                return reject(err.message)

              let { address } = response.result[0]
              resolve(address)
            })
        })
    })
  }

  withdraw(asset, amount, key) {
    return new Promise((resolve, reject) => {
      let params = { asset, amount, key }
      this.kraken.api('WithdrawInfo', params,
        (err, response) => {
          if(err)
            return reject(err.message)

          let { limit, fee } = response.result
          if(amount > limit)
            return reject({
              message: `Withdraw prevented. Your limit is currently ${limit} ${asset}.`,
              limit,
              amount,
              fee
            })

          this.kraken.api('Withdraw', params,
            (err, response) => {
              if(err)
                return reject(err.message)

              resolve(response.result)
            })
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
      this.kraken.api('AddOrder', data,
        (err, response) => {
          if(err)
            return reject(err.message)

          let { txid } = response.result
          resolve({
            txid
          })
        })
    })
  }

}
