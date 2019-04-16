import { ISeries, Series, DataFrame, IDataFrame } from 'data-forge';
import { IBollingerBand } from './bollinger';

declare module "data-forge/build/lib/dataframe" {
    interface IDataFrame<IndexT, ValueT> {
        percentB(): ISeries<IndexT, number>;
    }

    interface DataFrame<IndexT, ValueT> {
        percentB(): ISeries<IndexT, number>;
    }
}

/**
 * Compute the percent bandwidth indicator from Bollinger Bands.
 * 
 * %b (pronounced "percent b") is derived from the formula for stochastics and shows where price is in relation to the bands. 
 * %b equals 1 at the upper band and 0 at the lower band. 
 * 
 * https://en.wikipedia.org/wiki/Bollinger_Bands#Indicators_derived_from_Bollinger_Bands
 *
 */
function percentB<IndexT = any>(this: IDataFrame<IndexT, IBollingerBand>): ISeries<IndexT, number> {
    return this.deflate(band => (band.value - band.lower) / (band.upper - band.lower));
};

DataFrame.prototype.percentB = percentB;