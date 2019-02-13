import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';

/**
 * A record in the output bollinger bands dataframe.
 */
export interface IBollingerBand {
    /**
     * The value that the bollinger bands are derived from.
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
}

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        bollinger (period: number, stdDevMultUpper: number, stdDevMultLower: number): IDataFrame<any, IBollingerBand>;
    }

    interface Series<IndexT, ValueT> {
        bollinger (period: number, stdDevMultUpper: number, stdDevMultLower: number): IDataFrame<any, IBollingerBand>;
    }
}

/**
 * Compute bollinger bands for a input series for a specified period of time.
 *
 * @param period - The time period for which to compute bollinger bands.
 * @param stdDevMultUpper - The multiple of std dev used to compute the upper band.
 * @param stdDevMultLower - The multiple of std dev used to compute the lower band.
 * 
 * @returns Returns a dataframe with columns value, upper, middle, lower, and stddev.
 */
function bollinger<IndexT = any> (
    this: ISeries<IndexT, number>, 
    period: number, 
    stdDevMultUpper: number, 
    stdDevMultLower: number
    ): IDataFrame<IndexT, IBollingerBand> {

    assert.isNumber(period, "Expected 'period' parameter to 'Series.bollinger' to be a number that specifies the time period of the moving average.");
    assert.isNumber(stdDevMultUpper, "Expected 'stdDevMultUpper' parameter to 'Series.bollinger' to be a number that specifies multipler to compute the upper band from the standard deviation.");
    assert.isNumber(stdDevMultLower, "Expected 'stdDevMultLower' parameter to 'Series.bollinger' to be a number that specifies multipler to compute the upper band from the standard deviation.");

    return this.rollingWindow(period)
        .select<[IndexT, IBollingerBand]>(window => {
            // http://stackoverflow.com/a/2253903/25868
            const count = window.count(); //todo: want a helper for std dev.
            const avg = window.average();
            const sum = window.select(value => (value - avg) * (value - avg)).sum();
            const stddev = Math.sqrt(sum / count);
            
            var bollingerRecord: IBollingerBand = {
                value: window.last(),
                middle: avg,
                upper: avg + (stddev * stdDevMultUpper),
                lower: avg - (stddev * stdDevMultLower),
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