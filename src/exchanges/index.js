const _ = require('lodash')

module.exports = _.reduce([
  'bitfinex',
  'bittrex',
  'gdax',
  'gemini',
  'kraken',
  'liqui',
  'poloniex',
  // 'yunbi'
], (exchanges, name) => {
  exchanges[name] = new Proxy(require(`./${name}`), {

    construct(T, [ auth ]) {
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
      } else {
        return Exchange[prop]
      }
    }

  })

  return exchanges
}, [])

// Anything in this object is treated as a static and instance exchange method.
const Exchange = {

  ticker(pairs) {
    return multiPairProxy(pairs, this.ticker.bind(this))
  },

  // NOTE: Check if assets and pairs are cached before fetching. This is safe because
  //       this information generally does not change.
  assets() {
    return this.constructor._assets ?
      Promise.resolve(this.constructor._assets) :
      this.assets()
        .then( assets => this.constructor._assets = assets)
  },

  pairs() {
    return this.constructor._pairs ?
      Promise.resolve(this.constructor._pairs) :
      this.pairs()
        .then( pairs => this.constructor._pairs = pairs)
  },

  depth(pairs, count=50) {
    return multiPairProxy(pairs, p => this.depth(p, count))
  }

}

function authProxy(auth={}) {
  return new Proxy(auth, {
    get(target, prop) {
      return target[prop] || ''
    }
  })
}

function multiPairProxy(pairs, map) {
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
