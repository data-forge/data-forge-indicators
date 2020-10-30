import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';
import "./sma"
import './stochastic-k'
export interface IStochasticFast {
    /** */
    percentK: number;
    /** */
    percentD: number;
}

declare module "data-forge/build/lib/series" {

    interface ISeries<IndexT, ValueT> {
        stochasticFast(k: number, d: number): IDataFrame<any, IStochasticFast>;
    }

    interface Series<IndexT, ValueT> {
        stochasticFast(k: number, d: number): IDataFrame<any, IStochasticFast>;
    }
}
function stochasticFast<IndexT = any> (
    this: ISeries<IndexT, number>,
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

Series.prototype.stochasticFast = stochasticFast;