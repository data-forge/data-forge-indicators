import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        direction (period: number): ISeries<IndexT, ValueT>;
    }

    interface Series<IndexT, ValueT> {
        direction (period: number): ISeries<IndexT, ValueT>;
    }
}

function direction (this: ISeries<any, any>, period: number = 2): ISeries<any, any> {
	assert.isNumber(period, "Expected 'period' parameter to 'Series.direction' to be a number that specifies the time period for the direction test.");

    return this.rollingWindow(2)
        .select(window => [
            window.getIndex().last(),
            Math.sign(window.last() - window.first()),
        ])
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.direction = direction;