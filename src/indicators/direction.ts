import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

//
// Determine the rolling direction of the series for the specified period.
//

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        direction(period: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        direction(period: number): ISeries<IndexT, number>;
    }
}

function direction<IndexT = any>(this: ISeries<IndexT, number>, period: number = 2): ISeries<IndexT, number> {
	assert.isNumber(period, "Expected 'period' parameter to 'Series.direction' to be a number that specifies the time period for the direction test.");

    return this.rollingWindow(2)
        .select<[IndexT, number]>(window => [
            window.getIndex().last(),
            Math.sign(window.last() - window.first()),
        ])
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.direction = direction;