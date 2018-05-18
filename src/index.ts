import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        sma (period: number): ISeries<IndexT, ValueT>;
    }

    interface Series<IndexT, ValueT> {
        sma (period: number): ISeries<IndexT, ValueT>;
    }
}

function sma (this: ISeries<any, any>, period: number): ISeries<any, any> {
	assert.isNumber(period, "Expected 'period' parameter to 'Series.sma' to be a number that specifies the time period of the moving average.");

    return this.rollingWindow(period)
        .select(window => [window.getIndex().last(), window.average()])
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.sma = sma;