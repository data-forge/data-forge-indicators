import { assert } from 'chai';
import { IDataFrame, DataFrame, ISeries, Series } from 'data-forge';
import '../indicators/rsi';
import '../indicators/streaks';
import '../indicators/rate-of-change';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        crsi(rsiPeriod: number, streakRsiPeriod: number, rocPeriod: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        crsi(rsiPeriod: number, streakRsiPeriod: number, rocPeriod: number): ISeries<IndexT, number>;
    }
}

function crsi<IndexT = any>(this: ISeries<IndexT, number>, rsiPeriod: number, streakRsiPeriod: number, rocPeriod: number): ISeries<IndexT, number> {
    
    assert.isNumber(rsiPeriod, "Expected 'rsiPeriod' parameter to 'DataFrame.crsi' to be a number that specifies the time period for the rsi component of crsi.");
    assert.isNumber(streakRsiPeriod, "Expected 'streakRsiPeriod' parameter to 'DataFrame.crsi' to be a number that specifies the time period for the streak/updown component of crsi.");
    assert.isNumber(rocPeriod, "Expected 'rocPeriod' parameter to 'DataFrame.crsi' to be a number that specifies the time period for the roc component of crsi.");

    const totalValues = this.count();
    const alignedValues = Math.min(totalValues - (rsiPeriod-1), totalValues - 1 - (streakRsiPeriod-1), totalValues - (rocPeriod-1));
    const rsi = this.rsi(rsiPeriod);
    const streaks = this.streaks(2).rsi(streakRsiPeriod);
    const roc = this.roc(rocPeriod);

    return Series.zip( //TODO: Be good if DF had a function to align/merge values.
        [
            rsi.tail(alignedValues), 
            streaks.tail(alignedValues),
            roc.tail(alignedValues) 
        ],
        values => values.average()
    );
}

Series.prototype.crsi = crsi;