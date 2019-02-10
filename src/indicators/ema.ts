import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        ema (period: number): ISeries<IndexT, ValueT>;
    }

    interface Series<IndexT, ValueT> {
        ema (period: number): ISeries<IndexT, ValueT>;
    }
}

function ema (this: ISeries<any, any>, period: number): ISeries<any, any> {
	assert.isNumber(period, "Expected 'period' parameter to 'Series.ema' to be a number that specifies the time period of the moving average.");

    // https://www.investopedia.com/ask/answers/122314/what-exponential-moving-average-ema-formula-and-how-ema-calculated.asp
    var mult = (2 / (period + 1));
    let avgValue = this.take(period).average();
    return new Series([ avgValue ])
        .concat(
            this.skip(period)
                .select(value => {
                    avgValue = ((value - avgValue) * mult) + avgValue;
                    return avgValue;
                })
                .bake()
        );
}

Series.prototype.ema = ema;