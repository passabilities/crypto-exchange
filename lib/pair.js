const _ = require('lodash')

class Pair {

  static flip(pair) {
    return pair.replace(/(.+)_(.+)/, '$2_$1')
  }

  static quote(pair) {
    return _.first(pair.split('_'))
  }
  static base(pair) {
    return _.last(pair.split('_'))
  }

}

module.exports = Pair
