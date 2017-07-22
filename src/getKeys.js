module.exports = (exchange) => {
  let keys
  // Try to find the API keys file. Default to an empty object if not exist.
  try {
    let f = require(`${process.cwd()}/api_keys.json`)
    keys = f[exchange] || {}
  } catch (e) {
    keys = {}
  }

  // Default to return a blank string if property not exist.
  return new Proxy(keys, {
    get(target, name) {
      return target[name] || ''
    }
  })
}
