import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';
import { Index } from 'data-forge';

//
// Determine the extreme values (the peaks and troughs) of a data series.
//

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        extrema(): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        extrema(): ISeries<IndexT, number>;
    }
}

function extrema<IndexT = any>(this: ISeries<IndexT, number>, period: number = 2): ISeries<IndexT, number> {

    assert.isNumber(period, "Expected 'period' parameter to 'Series.extrema' to be a number that specifies the time period for the extrema test.");
    
    return this.direction(2)
        .where(direction => direction < 0 || direction > 0)
        .groupSequentialBy(value => value)
        .select<[IndexT, number]>(group => [
            group.getIndex().last(),
            group.first(),
        ])
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.extrema = extrema;