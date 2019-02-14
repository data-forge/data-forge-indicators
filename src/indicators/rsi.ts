import { assert } from 'chai';
import { IDataFrame, DataFrame, ISeries } from 'data-forge';
import { OHLC } from './ohlc';

declare module "data-forge/build/lib/dataframe" {
    interface IDataFrame<IndexT, ValueT> {
        rsi(period: number): ISeries<IndexT, number>;
    }

    interface DataFrame<IndexT, ValueT> {
        rsi(period: number): ISeries<IndexT, number>;
    }
}

function rsi<IndexT = any>(this: IDataFrame<IndexT, OHLC>, period: number): ISeries<IndexT, number> {
	assert.isNumber(period, "Expected 'period' parameter to 'DataFrame.rsi' to be a number that specifies the time period for computation of the relative strength index.");

    return this.rollingWindow(period)
        .select<[IndexT, number]>(window => {
            const upDays = window.where(row => row.close > row.open).count();
            return [
                window.getIndex().last(), 
                (upDays / window.count()) * 100.0
            ];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

DataFrame.prototype.rsi = rsi;