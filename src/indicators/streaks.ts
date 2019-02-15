import { assert } from 'chai';
import * as dataForge from 'data-forge';
import { IDataFrame, DataFrame, ISeries, Series } from 'data-forge';
import "./direction";

//
// Count streaks of up days and down days.
// Streaks of up days are counted as positive numbers.
// Streaks of down days are counted as negative numbers.
// This is used by Conner's RSI (crsi).
//

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        streaks(period: number): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        streaks(period: number): ISeries<IndexT, number>;
    }
}

function streaks<IndexT = any>(this: ISeries<IndexT, number>, period: number = 2): ISeries<IndexT, number> {

    return this.direction(period)
        .groupSequentialBy(direction => direction)
        .selectMany(group => {
            const direction = group.first();
            if (direction === 0) {
                return dataForge.replicate(0, group.count())
                    .withIndex(group.getIndex()) //TODO: Select many should respect the index!
                    .toPairs();
            }
            else if (direction < 0) {
                return dataForge.range(1, group.count())
                    .select(value => -value) //TODO: DF should be able to do a negative range.
                    .withIndex(group.getIndex()) //TODO: Select many should respect the index!
                    .toPairs();
            }
            else {
                return dataForge.range(1, group.count())
                .withIndex(group.getIndex()) //TODO: Select many should respect the index!
                .toPairs();
            }
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1])
        .bake(); //TODO: This is really expensive so back the result!
}

Series.prototype.streaks = streaks;