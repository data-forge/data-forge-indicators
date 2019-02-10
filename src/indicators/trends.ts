import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        trends (): ISeries<IndexT, ValueT>;
    }

    interface Series<IndexT, ValueT> {
        trends (): ISeries<IndexT, ValueT>;
    }
}

function trends (this: ISeries<any, any>): ISeries<any, any> {

    const extrema = this.extrema();
    var df = this.inflate(value => ({ 
            Value: value 
        }))
        .withSeries("extrema", extrema);

    var downTrend = df
        .where((row: any) => row.extrema > 0)
        .rollingWindow(2)
        .select(window => {
            if (window.count() < 2) {
                return [window.getIndex().last(), 0];
            }

            var prev = window.first();
            var cur = window.last();
            if (cur.Value < prev.Value) {
                return [window.getIndex().last(), -1];
            }

            return [window.getIndex().last(), 1];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1])
        .bake();

    var upTrend = df
        .where((row: any) => row.extrema < 0)
        .rollingWindow(2)
        .select(window => {
            if (window.count() < 2) {
                return [window.getIndex().last(), 0];
            }

            var prev = window.first();
            var cur = window.last();
            if (cur.Value > prev.Value) {
                return [window.getIndex().last(), 1];
            }

            return [window.getIndex().last(), -1];
        })
        .withIndex(pair => pair[0])
        .select(pair => pair[1])
        .bake();

    let prevTrendValue: number | undefined = undefined;

    return df
        .withSeries("Uptrend", upTrend)
        .withSeries("Downtrend", downTrend)
        .deflate((row: any) => row.Uptrend && row.Uptrend || row.Downtrend)
        .select(function (value) {
               if (typeof(value) === "number" && value < 0 || value > 0) {
                prevTrendValue = value;
                return value;
            }
            else {
                return prevTrendValue;
            }
        })
        .bake();
}

Series.prototype.trends = trends;