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

function ema<IndexT = any>(this: ISeries<IndexT, number>, period: number): ISeries<IndexT, number> {

    assert.isNumber(period, "Expected 'period' parameter to 'Series.ema' to be a number that specifies the time period of the moving average.");

    // https://www.investopedia.com/ask/answers/122314/what-exponential-moving-average-ema-formula-and-how-ema-calculated.asp
    const mult = (2 / (period + 1));
    let avgValue = this.take(period).average(); //TODO: this destroy the index.
    return new Series<IndexT, number>({
            index: [ this.getIndex().skip(period-1).first() ], // TODO: The construction of this 1 elements series is quite awkward.
            values: [ avgValue ],
        }) 
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