import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        sma(period: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        sma(period: number): ISeries<IndexT, number>;
    }
}

function sma<IndexT = any>(this: ISeries<IndexT, number>, period: number): ISeries<IndexT, number> {

	assert.isNumber(period, "Expected 'period' parameter to 'Series.sma' to be a number that specifies the time period of the moving average.");

    return this.rollingWindow(period)
        .select<[IndexT, number]>(window => [window.getIndex().last(), window.average()])
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.sma = sma;