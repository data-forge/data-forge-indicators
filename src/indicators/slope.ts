import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

//
// Compute between pairs of values separate by a configurable period.
// The value is positive if the slope is facing up.
// The value is negative if the slope is facing down.
// If a line is horizontal the slope is zero.
// If a line is vertical the slope is undefined.
// https://en.wikipedia.org/wiki/Slope
//
// Time unit can be
//  - 'ms' or 'milliseconds' for millisconds.
//  - 's' or 'seconds' for seconds.
//  - 'h' or 'hours' for hours.
//  - 'd' or 'days' for days.
//  - 'w' or 'weeks' for weeks.
//  - 'm' or 'months' for months.
//  - 'y' or 'years' for years.
//

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        slope (period: number, timeUnit?: string): ISeries<IndexT, ValueT>;
    }

    interface Series<IndexT, ValueT> {
        slope (period: number, timeUnit?: string): ISeries<IndexT, ValueT>;
    }
}

function slope (this: ISeries<any, any>, period: number, timeUnit?: string): ISeries<any, any> {
    assert.isNumber(period, "Expected 'period' parameter to 'Series.slope' to be a number that specifies the time period between pairs of values that define lines whose slope is calculated.");
    
    //todo: automatically deal with dates.

    return this.rollingWindow(period)
        .select(window => {
            const deltaX = window.last() - window.first();
            const index = window.getIndex();
            const lastIndex = index.last();
            if (deltaX === 0) { // If a line is horizontal the slope is zero.
                return [
                    lastIndex,
                    0,
                ];
            }
            const deltaY = lastIndex - index.first();
            if (deltaY === 0) { // If a line is vertical the slope is undefined.
                return [
                    lastIndex,
                    undefined,
                ];
            }
            return [
                lastIndex,
                deltaY / deltaX,
            ];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.slope = slope;