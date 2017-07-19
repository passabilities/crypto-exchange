module.exports = (exchange) => {
  let keys
  // Try to find the API keys file. Default to an empty object if not exist.
  try {
    keys = require(`${process.cwd()}/api_keys.json`)[exchnage] || {}
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
