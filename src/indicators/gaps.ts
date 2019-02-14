import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';
import { IDataFrame, DataFrame } from 'data-forge';
import { OHLC } from './ohlc';

declare module "data-forge/build/lib/dataframe" {
    interface IDataFrame<IndexT, ValueT> {
        gaps(): ISeries<IndexT, number>;
    }

    interface DataFrame<IndexT, ValueT> {
        gaps(): ISeries<IndexT, number>;
    }
}

function gaps<IndexT = any>(this: IDataFrame<IndexT, OHLC>): ISeries<IndexT, number> {

    return this.rollingWindow(2)
        .select<[IndexT, number]>(window => {
            const day1 = window.first().close;
            const day2 = window.last().open;
            return [
                window.getIndex().last(),
                ((day2 - day1) / day1) * 100,
            ];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

DataFrame.prototype.gaps = gaps;