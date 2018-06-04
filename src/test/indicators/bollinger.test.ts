import { assert, expect } from 'chai';
import 'mocha';
import { Series } from 'data-forge';
import "../../index";

describe('bollinger', () => {

    it('bollinger', () => {

        const series = new Series({ index: [10, 20, 30, 40, 50, 60, 70], values: [5, 8, 15, 12, 22, 16, 9] });
        const bollinger = series.bollinger(3, 2);

        expect(bollinger.toArray()).to.eql([{
            value: 15,
            middle: 9.333333333333334,
            upper: 17.71320339331769,
            lower: 0.9534632733489765,
            stddev: 4.189935029992179
        },
        {
            value: 12,
            middle: 11.666666666666666,
            upper: 17.401550178028415,
            lower: 5.931783155304915,
            stddev: 2.8674417556808756
        },
        {
            value: 22,
            middle: 16.333333333333332,
            upper: 24.713203393317688,
            lower: 7.9534632733489765,
            stddev: 4.189935029992178
        },
        {
            value: 16,
            middle: 16.666666666666668,
            upper: 24.88588533729197,
            lower: 8.447447996041365,
            stddev: 4.109609335312651
        },
        {
            value: 9,
            middle: 15.666666666666666,
            upper: 26.291584967006152,
            lower: 5.04174836632718,
            stddev: 5.312459150169743
        }
        ]);

        expect(bollinger.getIndex().toArray()).to.eql([
            30,
            40,
            50,
            60,
            70
        ]);
    });
});
