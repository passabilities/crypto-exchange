const API = require('binance-api-node').default()
const _ = require('lodash')

class Binance {

    constructor({key, secret}) {
        this.binance =
            (key && secret)
                ? API({apiKey: key, apiSecret: secret})
                : API()

    }

    //Public Methods

    ticker(pair) {
        return new Promise((resolve, reject) => {
            this.binance.dailyStats()
                .then(ticker => {
                    let {lastPrice, lastAsk, bidPrice, highPrice, lowPrice, volume,} = ticker;
                    resolve({
                        last: parseFloat(lastPrice),
                        ask: parseFloat(lastAsk),
                        bid: parseFloat(bidPrice),
                        high: parseFloat(highPrice),
                        low: parseFloat(lowPrice),
                        volume: parseFloat(volume),
                        timestamp: Date.now(),
                    });
                })
                .catch(err => reject(err.message))
        })
    }

    assets() {
        return new Promise((resolve, reject) => {
            this.binance.exchangeInfo()
                .then(info => {
                    let pairs = []
                    let symbols = info.symbols;
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
                        bids: _.map(info.bids, item => [parseFloat(item.price), parseFloat(item.quantity)]),
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
                    let balances = {};
                    _.map(accInfo.balances, (bal) => balances[bal.asset] = {
                        balance: parseFloat(bal.free + bal.locked),
                        available: parseFloat(bal.free),
                        pending: parseFloat(bal.locked)
                    });
                    resolve(balances)
                })
                .catch(err => reject(err.message))
        })
    }

    address(asset) {
        return new Promise((resolve, reject) => {
            this.binance.depositAddress({asset: asset})
                .then(response => {
                    if (response.success) resolve(response.address);
                    else reject(response.success)
                })
                .catch(err => reject(err.message))
        })

    }
}

const privateMethods = {
    addOrder(type, pair, amount, rate) {
        pair = pair.replace('_', '')
        let data = {
            symbol: pair,
            side: type.toUpperCase(),
            quantity: amount,
            price: rate,
        };
        return new Promise((resolve, reject) => {
            this.binance.order(data)
                .then(response => {
                    let {orderId} = response;
                    resolve({orderId})
                })
                .catch(err => reject(err.message))
        })
    }
}