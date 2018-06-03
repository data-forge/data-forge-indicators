import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';

/**
 * A record in the output bollinger bands dataframe.
 */
export interface IBollingerRecord {
    /***
     * Last value.
     */
    value: number;

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

    /**
     * The standard deviation of values for the particular period.
     */
    stddev: number;
}

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        bollinger (period: number, stdDevMult: number): IDataFrame<any, IBollingerRecord>;
    }

    interface Series<IndexT, ValueT> {
        bollinger (period: number, stdDevMult: number): IDataFrame<any, IBollingerRecord>;
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
function bollinger (this: ISeries<any, number>, period: number, stdDevMult: number): IDataFrame<any, IBollingerRecord> {

    assert.isNumber(period, "Expected 'period' parameter to 'Series.bollinger' to be a number that specifies the time period of the moving average.");
    assert.isNumber(stdDevMult, "Expected 'stdDevMult' parameter to 'Series.bollinger' to be a number that specifies the time period of the moving average.");

    return this.rollingWindow(period)
        .select(window => {
            // http://stackoverflow.com/a/2253903/25868
            const count = window.count(); //todo: want a helper for std dev.

            const avg = window.average();
            const sum = window.select(value => (value - avg) * (value - avg)).sum();
            const stddev = Math.sqrt(sum / count);

            
            var bollingerRecord: IBollingerRecord = {
                value: window.last(),
                middle: avg,
                upper: avg + (stddev * stdDevMult),
                lower: avg - (stddev * stdDevMult),
                stddev: stddev,
            }

            return [
                window.getIndex().last(), 
                bollingerRecord
            ];
        })
        .withIndex(pair => pair[0])
        .inflate(pair => pair[1]);
};

Series.prototype.bollinger = bollinger;