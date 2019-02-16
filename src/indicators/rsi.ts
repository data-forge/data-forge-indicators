import { assert } from 'chai';
import { IDataFrame, DataFrame, ISeries, Series } from 'data-forge';
import "../indicators/sma";

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
            // https://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi
            const changes = window.amountChange(2).bake();
            const averageLoss = Math.abs(changes.where(change => change < 0).average());
            if (averageLoss < Number.EPSILON) {
                return [
                    window.getIndex().last(),
                    100
                ];    
            }
            const averageGain = changes.where(change => change > 0).average();
           const relativeStrength = averageGain / averageLoss;
            return [
                window.getIndex().last(),
                100 - (100 / (1 + relativeStrength))
            ];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1]);
}

Series.prototype.rsi = rsi;