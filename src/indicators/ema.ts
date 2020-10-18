import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        ema(period: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        ema(period: number): ISeries<IndexT, number>;
    }
}

//
// Compute exponent weighted average for a bunch of numbers.
//
function computeEma(values: number[], multiplier: number): number {
    
    if (values.length === 0) {
        return 0;
    }

    if (values.length === 1) {
        return values[0];
    }

    let latest = values[0];
    for (let i = 1; i < values.length; ++i) {
        latest = (multiplier * values[i]) + ((1 - multiplier) * latest);
    }

    return latest;
}

function ema<IndexT = any>(this: ISeries<IndexT, number>, period: number): ISeries<IndexT, number> {

    assert.isNumber(period, "Expected 'period' parameter to 'Series.ema' to be a number that specifies the time period of the moving average.");

    const multiplier = (2 / (period + 1));
    return this.rollingWindow(period)
        .select(window => computeEma(window.toArray(), multiplier));
}

Series.prototype.ema = ema;