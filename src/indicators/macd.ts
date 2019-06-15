import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';
import "./ema";

/**
 * A record in the output macd bands dataframe.
 */
export interface IMacdEntry {
    /**
     * Short period exponential moving average.
     */
    shortEMA?: number;

    /**
     * Long period exponential moving average.
     */
    longEMA?: number;

    /**
     * Difference between short and long emas (this is the macd or 'moving average convergence divergence');
     */
    macd?: number;

    /**
     * The 'signal line', an exponential moving average of the macd.
     */
    signal?: number;

    /**
     * Difference between the macd and the signal line.
     */
    histogram?: number;
}

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        macd (shortPeriod: number, longPeriod: number, signalPeriod: number): IDataFrame<any, IMacdEntry>;
    }

    interface Series<IndexT, ValueT> {
        macd (shortPeriod: number, longPeriod: number, signalPeriod: number): IDataFrame<any, IMacdEntry>;
    }
}

/**
 * Compute macd for a series.
 *
 * @param shortPeriod - The time period of the short moving average.
 * @param longPeriod - The time period of the long moving average.
 * @param signalPeriod - The time period for the macd signal line.
 * 
 * @returns Returns a dataframe for the computed macd indicator.
 */
function macd<IndexT = any> (
    this: ISeries<IndexT, number>, 
    shortPeriod: number,
    longPeriod: number,
    signalPeriod: number
    ): IDataFrame<IndexT, IMacdEntry> {

    assert.isNumber(shortPeriod, "Expected 'shortPeriod' parameter to 'Series.macd' to be a number that specifies the time period of the short moving average.");
    assert.isNumber(longPeriod, "Expected 'longPeriod' parameter to 'Series.macd' to be a number that specifies the time period of the long moving average.");
    assert.isNumber(signalPeriod, "Expected 'signalPeriod' parameter to 'Series.macd' to be a number that specifies the time period for the macd signal line.");

    const shortEMA = this.ema(shortPeriod)
    const longEMA = this.ema(longPeriod);
    const macd = shortEMA.skip(longPeriod-shortPeriod)
        .zip(longEMA, (short, long) => short - long);
    const signal = macd.ema(signalPeriod);
    const histogram = macd.skip(signalPeriod-1)
        .zip(signal, (macd, signal) => macd - signal);

    return DataFrame.merge([
        shortEMA.inflate(shortEMA => ({ shortEMA } as any)),
        longEMA.inflate(longEMA => ({ longEMA } as any)),
        macd.inflate(macd => ({ macd } as any)),
        signal.inflate(signal => ({ signal } as any)),
        histogram.inflate(histogram => ({ histogram } as any))
    ]);

    /*TODO: potential short hand syntax.
    return DataFrame.merge({
        shortEMA,
        longEMA,
        macd,
        signal,
        histogram
    });
    */

    /*TODO: this almost works but doesn't line up the index!
    return new DataFrame({ //todo: need to merge on index!
        index: this.getIndex(),
        columns: {
            shortEMA,
            longEMA,
            macd,
            signal,
            histogram,
        },
    });
    */
};

Series.prototype.macd = macd;