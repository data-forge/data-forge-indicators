import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        rateOfChange (period: number): ISeries<IndexT, ValueT>;
    }

    interface Series<IndexT, ValueT> {
        rateOfChange (period: number): ISeries<IndexT, ValueT>;
    }
}

/**
 * Compute the rate of change.
 * https://en.wikipedia.org/wiki/Momentum_(technical_analysis)
 */

function rateOfChange<IndexT = any> (this: ISeries<IndexT, number>, period: number): ISeries<IndexT, number> {
	assert.isNumber(period, "Expected 'period' parameter to 'Series.rateOfChange' to be a number that specifies the time period for computing rate of change.");

    return this.rollingWindow(period)
        .select<[IndexT, number]>(window => {
            const first = window.first();
            return [window.getIndex().last(), (window.last() - first) / first];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.rateOfChange = rateOfChange;