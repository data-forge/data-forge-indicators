import { assert } from 'chai';
import { IDataFrame, DataFrame, ISeries, Series } from 'data-forge';
import '../indicators/rsi';
import '../indicators/streaks';
import '../indicators/rate-of-change';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        crsi(rsiPeriod: number, streakRsiPeriod: number, percentRankPeriod: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        crsi(rsiPeriod: number, streakRsiPeriod: number, percentRankPeriod: number): ISeries<IndexT, number>;
    }
}

function crsi<IndexT = any>(this: ISeries<IndexT, number>, rsiPeriod: number, streakRsiPeriod: number, percentRankPeriod: number): ISeries<IndexT, number> {
    
    assert.isNumber(rsiPeriod, "Expected 'rsiPeriod' parameter to 'DataFrame.crsi' to be a number that specifies the time period for the rsi component of crsi.");
    assert.isNumber(streakRsiPeriod, "Expected 'streakRsiPeriod' parameter to 'DataFrame.crsi' to be a number that specifies the time period for the streak/updown component of crsi.");
    assert.isNumber(percentRankPeriod, "Expected 'percentRankPeriod' parameter to 'DataFrame.crsi' to be a number that specifies the time period for the roc component of crsi.");

    const rsi = this.rsi(rsiPeriod);
    const streaks = this.streaks(2).rsi(streakRsiPeriod);
    const percentRank = this.amountChange(2).bake().percentRank(percentRankPeriod); //TODO: Don't want to have to do this bake. But %rank is quite slow otherwise.
    return rsi.merge(streaks, percentRank)
        .where(values => values.filter(value => value !== undefined).length === 3)
        .select(([rsi, streak, percentRank]) => (rsi + streak + percentRank)/3);
}

Series.prototype.crsi = crsi;
