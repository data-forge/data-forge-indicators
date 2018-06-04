import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';

/**
 * A record in the output bollinger bands dataframe.
 */
export interface IBollingerBand {
    /**
     * Middle value in the bollinger band, the average value for the particular period.
     */
    middle: number;

    /***
     * The upper value. middle + (standard deviations x X).
     */
    upper: number;

    /***
     * The upper value. middle - (standard deviations x X).
     */
    lower: number;
}

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        bollinger (period: number, stdDevMult: number): IDataFrame<any, IBollingerBand>;
    }

    interface Series<IndexT, ValueT> {
        bollinger (period: number, stdDevMult: number): IDataFrame<any, IBollingerBand>;
    }
}

/**
 * Compute bollinger bands for a input series for a specified period of time.
 *
 * @param period - The time period for which to compute bollinger bands.
 * @param stdDevMult - The multiple of std dev used to compute upper and lower bands.
 * 
 * @returns Returns a dataframe with columns value, upper, middle, lower, and stddev.
 */
function bollinger<IndexT = any> (this: ISeries<IndexT, number>, period: number, stdDevMult: number): IDataFrame<IndexT, IBollingerBand> {

    assert.isNumber(period, "Expected 'period' parameter to 'Series.bollinger' to be a number that specifies the time period of the moving average.");
    assert.isNumber(stdDevMult, "Expected 'stdDevMult' parameter to 'Series.bollinger' to be a number that specifies the time period of the moving average.");

    const pairs: [IndexT, IBollingerBand][] = this.rollingWindow(period)
        .select<[IndexT, IBollingerBand]>(window => {
            // http://stackoverflow.com/a/2253903/25868
            const count = window.count(); //todo: want a helper for std dev.

            const avg = window.average();
            const sum = window.select(value => (value - avg) * (value - avg)).sum();
            const stddev = Math.sqrt(sum / count);
            
            var bollingerRecord: IBollingerBand = {
                middle: avg,
                upper: avg + (stddev * stdDevMult),
                lower: avg - (stddev * stdDevMult),
            }

            return [
                window.getIndex().last(), 
                bollingerRecord
            ];
        })
        .toArray(); //TODO: Shouldn't need this. Something is wrong downstream that causes the selector to be evaluated way too many times.

    return new DataFrame<IndexT, IBollingerBand>({ pairs: pairs });
};

Series.prototype.bollinger = bollinger;