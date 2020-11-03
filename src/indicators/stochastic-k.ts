import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';
import { OHLC } from './ohlc';


/**
 * Compute the stochastic
 * https://en.wikipedia.org/wiki/Stochastic_oscillator
 */

declare module "data-forge/build/lib/dataframe" {

    interface IDataFrame<IndexT, ValueT> {
        stochasticK(period: number): ISeries<IndexT, number>;
    }

    interface DataFrame<IndexT, ValueT> {
        stochasticK(period: number): ISeries<IndexT, number>;
    }
}

function computeK(values: OHLC[]): number {
    return 100 * (values[values.length - 1].close - Math.min.apply(null, values.map(value => value.low))) / (Math.max.apply(null, values.map(value => value.high)) - Math.min.apply(null, values.map(value => value.low)))
}

function stochasticK<IndexT = any>(this: IDataFrame<IndexT, OHLC>, period: number): ISeries<IndexT, number> {

    assert.isNumber(period, "Expected 'period' parameter to 'Series.stochastic' to be a number.");
    return this.rollingWindow(period)
        .select<[IndexT, number]>(window => {
            return [
                window.getIndex().last(),
                computeK(window.toArray())
            ]
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

DataFrame.prototype.stochasticK = stochasticK;
