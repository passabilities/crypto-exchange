const _ = require('lodash')

const Exchanges = require('./exchanges')

module.exports = new Proxy(Exchanges, {

  get(Es, prop) {
    for(let h of [ Handler, Es ])
      if(h.hasOwnProperty(prop))
        return h[prop]
  }

})

const Handler = {

  pairs() {
    return multiExchangeFetch('pairs')
  },

  assets() {
    return multiExchangeFetch('assets')
  }

}

function multiExchangeFetch(fnName) {
  let promises = []
  for(let name in Exchanges) {
    let p = Exchanges[name][fnName]()
      .then(values => (
        _.reduce(values, (result, v) => {
          result[v] = name
          return result
        }, {})
      ))
    promises.push(p)
  }

  return Promise.all(promises)
    .then( exValues => (
      _.reduce(exValues, (result, values) => {
        _.each(values, (exchange, val) => {
          let v = result[val], arr = [exchange]
          result[val] = v ? v.concat(arr) : arr
        })
        return result
      }, {})
    ))
}
