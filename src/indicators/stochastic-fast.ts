import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';
import "./sma"
import './stochastic-k'


/**
 * Compute the stochastic
 * https://en.wikipedia.org/wiki/Stochastic_oscillator
 */

export interface IStochasticFast {
    /** */
    percentK: number;
    /** */
    percentD: number;
}

declare module "data-forge/build/lib/dataframe" {

    interface IDataFrame<IndexT, ValueT> {
        stochasticFast(k: number, d: number): IDataFrame<IndexT, IStochasticFast>;
    }

    interface DataFrame<IndexT, ValueT> {
        stochasticFast(k: number, d: number): IDataFrame<IndexT, IStochasticFast>;
    }
}
function stochasticFast<IndexT = any> (
    this: DataFrame<IndexT, number>,
    k: number,
    d: number
): IDataFrame<IndexT, IStochasticFast> {
    assert.isNumber(k, "Expected 'k' parameter to 'Series.stochasticFast' to be a number.");
    assert.isNumber(d, "Expected 'd' parameter to 'Series.stochasticFast' to be a number.");

    const festKLine = this.stochasticK(k).bake()
    const fastDLine = festKLine.sma(d)
    return DataFrame.merge([
        festKLine.inflate(percentK => ({ percentK } as any)),
        fastDLine.inflate(percentD => ({ percentD } as any))
    ])
}

DataFrame.prototype.stochasticFast = stochasticFast;