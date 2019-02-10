import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

//
// Determine the extreme values (the peaks and troughs) of a data series.
//

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        extrema (): ISeries<IndexT, ValueT>;
    }

    interface Series<IndexT, ValueT> {
        extrema (): ISeries<IndexT, ValueT>;
    }
}

function extrema (this: ISeries<any, any>, period: number = 2): ISeries<any, any> {
    assert.isNumber(period, "Expected 'period' parameter to 'Series.extrema' to be a number that specifies the time period for the extrema test.");
    
    return this.direction(2)
        .where(direction => direction < 0 || direction > 0)
        .groupSequentialBy(value => value)
        .select(group => [
            group.getIndex().last(),
            group.first(),
        ])
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.extrema = extrema;