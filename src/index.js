const Exchanges = require('./exchanges')

module.exports = new Proxy(Exchanges, {

  // get(Es, name) {
  //   // Valid exchange is defined.
  //   if(Es.hasOwnProperty(name)) {
  //     console.log(name)
  //     return new Proxy(Es[name], {
  //     })
  //   }
  // }

})
