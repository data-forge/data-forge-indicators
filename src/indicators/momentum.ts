import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        momentum (period: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        momentum(period: number): ISeries<IndexT, number>;
    }
}

/**
 * Compute the momentum.
 * https://en.wikipedia.org/wiki/Momentum_(technical_analysis)
 */

function momentum<IndexT = any>(this: ISeries<IndexT, number>, period: number): ISeries<IndexT, number> {
	assert.isNumber(period, "Expected 'period' parameter to 'Series.momentum' to be a number that specifies the time period for computing momentum.");

    return this.rollingWindow(period)
        .select<[IndexT, number]>(window => [window.getIndex().last(), window.last() - window.first()])
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.momentum = momentum;