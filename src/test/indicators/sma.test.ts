import { assert, expect } from 'chai';
import 'mocha';
import { Series } from 'data-forge';
import "../../index";

describe('sma', () => {

    it('simple moving average', ()  => {

        const series = new Series({ index: [1, 2, 3], values: [10, 20, 30] });
        const sma = series.sma(2);
    
        expect(sma.toArray()).to.eql([15, 25]);
        expect(sma.getIndex().toArray()).to.eql([2, 3]);
    });

});
