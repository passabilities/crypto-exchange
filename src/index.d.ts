declare namespace CryptoExchange {
    export type Exchanges = {
        binance: StandardExchange & PublicMethods
        bitfinex: StandardExchange & PublicMethods
        bittrex: StandardExchange & PublicMethods
        gdax: GdaxExchange & PublicMethods
        gemini: StandardExchange & PublicMethods
        kraken: StandardExchange & PublicMethods
        liqui: StandardExchange & PublicMethods
        poloniex: StandardExchange & PublicMethods
    }

    export type ExchangeNames = keyof Exchanges

    export type Pairs = {
        [pair: string]: ReadonlyArray<ExchangeNames>
    }

    export type Assets = {
        [asset: string]: ReadonlyArray<ExchangeNames>
    }

    /** price, volume */
    export type OrderTuple = [number, number]

    export type OrderBook = {
        asks: ReadonlyArray<OrderTuple>
        bids: ReadonlyArray<OrderTuple>
    }

    export type Depth<Pairs extends string> = { [pair in Pairs]: OrderBook }

    export type Ticker<Pairs extends string> = { [pair in Pairs]: TickerData }

    export type TickerData = {
        last: number
        ask: number
        bid: number
        high: number | 'N/A'
        low: number | 'N/A'
        volume: number
        timestamp: number
    }

    export type GlobalMethods = {
        /**
         * Quickly fetch all available assets and which exchanges support them.
         */
        assets(): Promise<Assets>
        /**
         * Quickly fetch all available pairs and which exchanges support them.
         */
        pairs(): Promise<Pairs>
    }

    export type PublicMethods = {
        /**
         * Return current ticker information for a given pair on an exchange.
         *
         * @param pairs Pair or pairs are expected to be in the BASE_QUOTE format
         */
        ticker<Pairs extends string>(pair: Pairs): Promise<Ticker<Pairs>>
        ticker<Pairs extends string>(pairs: Array<Pairs>): Promise<Ticker<Pairs>>
        /**
         * Returns the available assets on an exchange.
         * If the asset is disabled/frozen, it is not included.
         */
        assets(): Promise<ReadonlyArray<string>>
        /**
         * Returns the available pairs on an exchange.
         */
        pairs(): Promise<ReadonlyArray<string>>
        /**
         * Returns the depth of available buy and sell orders.
         *
         * @param pairs Pairs are expected to be in the format BASE_QUOTE
         * @param count (optional)
         */
        depth<Pairs extends string>(
            pair: Pairs,
            count?: number,
        ): Promise<Depth<Pairs>>
        depth<Pairs extends string>(
            pairs: Array<Pairs>,
            count?: number,
        ): Promise<Depth<Pairs>>
    }

    export type Balance = {
        balance: number
        available: number
        pending: number
    }

    export type Balances = {
        [pair: string]: Balance
    }

    export type PrivateMethods = {
        /**
         * Place a buy or sell order on an exchange.
         *
         * @param pair A pair value to trade against.
         * @param amount Number representing the amount of ***BASE*** to buy/sell.
         * @param rate (optional) Pass a specific rate of the pair to execute.
         */
        buy(pair: string, amount: number, rate?: number): Promise<void>

        /**
         * Return current total, available, and pending balances for an exchange.
         */
        balances(): Promise<Balances>
    }

    export type StandardAddressInterface = {
        /**
         * Return or create a new address to which funds can be deposited.
         */
        address(sym: string): Promise<string>
    }

    export type GdaxAddressInterface = {
        /**
         * Return or create a new address to which funds can be deposited.
         */
        address(sym: string, opts: { auth: object }): Promise<string>
    }

    export type StandardExchangeInstance = PublicMethods &
        PrivateMethods &
        StandardAddressInterface

    export type GdaxExchangeInstance = PublicMethods &
        PrivateMethods &
        GdaxAddressInterface

    export type StandardCredentials = {
        key: string
        secret: string
    }

    export type GdaxCredentials = StandardCredentials & {
        passphrase: string
    }

    export type StandardExchange = {
        new(credentials: StandardCredentials): StandardExchangeInstance
    }

    export type GdaxExchange = {
        new(credentials: GdaxCredentials): GdaxExchangeInstance
    }

    export type Module = GlobalMethods & Exchanges
}

declare const module: CryptoExchange.Module
export = module
