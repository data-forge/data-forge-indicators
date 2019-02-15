import { assert } from 'chai';
import { IDataFrame, DataFrame, ISeries, Series } from 'data-forge';
import "../indicators/direction";

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        rsi(period: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        rsi(period: number): ISeries<IndexT, number>;
    }
}

function rsi<IndexT = any>(this: ISeries<IndexT, number>, period: number): ISeries<IndexT, number> {
    
    assert.isNumber(period, "Expected 'period' parameter to 'DataFrame.rsi' to be a number that specifies the time period for computation of the relative strength index.");

    return this.rollingWindow(period)
        .select<[IndexT, number]>(window => {
            const upDays = window.direction(2)
                .where(direction => direction > 0)
                .count();
            return [
                window.getIndex().last(), 
                (upDays / window.count()) * 100.0
            ];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.rsi = rsi;