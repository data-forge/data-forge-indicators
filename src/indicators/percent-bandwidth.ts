import { assert } from 'chai';
import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';
import { IBollingerBand } from './bollinger';

declare module "data-forge/build/lib/dataframe" {
    interface IDataFrame<IndexT, ValueT> {
        percentBandwidth(): ISeries<IndexT, number>;
    }

    interface DataFrame<IndexT, ValueT> {
        percentBandwidth(): ISeries<IndexT, number>;
    }
}

/**
 * Computer the percent bandwith indicator from Bollinger Bands.
 * https://en.wikipedia.org/wiki/Bollinger_Bands#Indicators_derived_from_Bollinger_Bands
 *
 */
function percentBandwidth<IndexT = any>(this: IDataFrame<IndexT, IBollingerBand>): ISeries<IndexT, number> {
    return this.deflate(band => (band.value - band.lower) / (band.upper - band.lower));
};

DataFrame.prototype.percentBandwidth = percentBandwidth;