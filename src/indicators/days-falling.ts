import { assert } from 'chai';
import { ISeries, Series } from 'data-forge';

declare module "data-forge/build/lib/series" {
    interface ISeries<IndexT, ValueT> {
        daysFalling (): ISeries<IndexT, number>;
    }

    interface Series<IndexT, ValueT> {
        daysFalling (): ISeries<IndexT, number>;
    }
}

function daysFalling<IndexT = any>(this: ISeries<IndexT, number>): ISeries<IndexT, number> {
    return this.direction(2).counter(value => value < 0);
}

Series.prototype.daysFalling = daysFalling;