'use strict';

describe('Test Usage: Exchange List', function () {
    it('List of all available exchanges from the package', function (done) {
        const actual_Exchanges = require('..')
        const expected_Exchanges = [
            'length',
            'bitfinex',
            'bittrex',
            'gdax',
            'gemini',
            'kraken',
            'liqui',
            'poloniex',
            'binance',
        ]
        Object.getOwnPropertyNames(actual_Exchanges).should.deepEqual(expected_Exchanges);
        done();
    });
});
