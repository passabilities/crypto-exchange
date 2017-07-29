const _ = require('lodash')

module.exports = _.reduce([
  'bitfinex',
  'bittrex',
  'btce',
  'gdax',
  'gemini',
  'kraken',
  'liqui',
  'poloniex',
  // 'yunbi'
], (exchanges, name) => {
  exchanges[name] = new Proxy(require(`./${name}`), {

    construct(T, auth) {
      let exchange = new T(authProxy(auth))
      return new Proxy(exchange, {
        get(e, prop) {
          return Exchange.hasOwnProperty(prop) ?
            Exchange[prop].bind(exchange) :
            exchange[prop]
        }
      })
    },

    get(T, prop) {
      if(Exchange.hasOwnProperty(prop)) {
        let exchange = new T(authProxy())
        return Exchange[prop].bind(exchange)
      }
    }

  })

  return exchanges
}, [])

// Anything in this object is considered a static exchange method.
const Exchange = {

  ticker(pairs) {
    return multiProxy(pairs, this.ticker)
  },

  assets() {
    return this.assets()
  },

  pairs() {
    return this.pairs()
  },

  depth(pairs, count=50) {
    return multiProxy(pairs, p => this.depth(p, count))
  }

}

function authProxy(auth={}) {
  return new Proxy(auth, {
    get(target, prop) {
      return target[prop] || ''
    }
  })
}

function multiProxy(pairs, map) {
  let promises

  if(typeof pairs === 'string')
    pairs = [pairs]

  pairs = _.map(pairs, p => p.toUpperCase())
  promises = _.map(pairs, map)

  return Promise.all(promises)
    .then( depths => (
      _.reduce(depths, (result, depth, i) => {
        result[pairs[i]] = depth
        return result
      }, {})
    ))
}
