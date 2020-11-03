import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame, Index } from 'data-forge';
import "./sma"
import './stochastic-k'


/**
 * Compute the stochastic
 * https://en.wikipedia.org/wiki/Stochastic_oscillator
 */

export interface IStochasticSlow {
    /** */
    percentK: number;
    /** */
    percentD: number;
}

declare module "data-forge/build/lib/dataframe" {

    interface IDataFrame<IndexT, ValueT> {
        stochasticSlow(k: number, d: number, smooth: number): IDataFrame<any, IStochasticSlow>;
    }

    interface DataFrame<IndexT, ValueT> {
        stochasticSlow(k: number, d: number, smooth: number): IDataFrame<any, IStochasticSlow>;
    }
}


function stochasticSlow<IndexT = any> (
    this: DataFrame<IndexT, number>,
    k: number,
    d: number,
    smooth: number
): IDataFrame<IndexT, IStochasticSlow> {

    assert.isNumber(k, "Expected 'k' parameter to 'Series.stochasticSlow' to be a number.");
    assert.isNumber(d, "Expected 'd' parameter to 'Series.stochasticSlow' to be a number.");
    assert.isNumber(smooth, "Expected 'smooth' parameter to 'Series.stochasticSlow' to be a number.");
    const festKLine = this.stochasticK(k).bake()
    const fastDLine = festKLine.sma(d)
    const slowKLine = festKLine.sma(smooth)
    const slowDLine = fastDLine.sma(smooth)
    return DataFrame.merge([
        slowKLine.inflate(percentK => ({ percentK } as any)),
        slowDLine.inflate(percentD => ({ percentD } as any))
    ])
}

DataFrame.prototype.stochasticSlow = stochasticSlow;