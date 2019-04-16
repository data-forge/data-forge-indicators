import { ISeries, Series, DataFrame, IDataFrame } from "data-forge";
import { IBollingerBand } from "./bollinger";

declare module "data-forge/build/lib/dataframe" {
    interface IDataFrame<IndexT, ValueT> {
        bandwidth(): ISeries<IndexT, number>;
    }

    interface DataFrame<IndexT, ValueT> {
        bandwidth(): ISeries<IndexT, number>;
    }
}

/**
 * Compute the bandwidth indicator from Bollinger Bands.
 * 
 * Bandwidth tells how wide the Bollinger Bands are on a normalized basis.
 * 
 * https://en.wikipedia.org/wiki/Bollinger_Bands#Indicators_derived_from_Bollinger_Bands
 *
 */
function bandwidth<IndexT = any>(this: IDataFrame<IndexT, IBollingerBand>): ISeries<IndexT, number> {
    return this.deflate(band => (band.upper - band.lower) / (band.middle));
};

DataFrame.prototype.bandwidth = bandwidth;