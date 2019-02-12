import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from 'data-forge';
import 'data-forge-fs';
import "../../index";
import * as path from 'path';
import * as moment from 'moment';
import { readJSON, writeJSON } from './test-utils';

describe('slope', () => {

    it('slope with number index', async function () {

        const df = await dataForge.readFile("./src/test/data/STW.csv")
            .parseCSV({ dynamicTyping: true });

        const values = df.deflate(row => row.close).slope(30).toPairs();

        const outputFilePath = path.join(__dirname, "output", this.test.fullTitle() + ".json");
        
        // To write new output:
        //await writeJSON(outputFilePath, values);

        const expectedOutput = await readJSON(outputFilePath);
        expect(values).to.eql(expectedOutput);
    });

    it('slope with date index', async function () {

        let df = await dataForge.readFile("./src/test/data/STW.csv")
            .parseCSV({ dynamicTyping: true });

        df = df.parseDates("date", "D/MM/YYYY").setIndex('date');

        const values = df.deflate(row => row.close)
            .slope(30)
            .toPairs()
            .map(pair => [
                moment(pair[0]).format("YYYY/MM/DD"),
                pair[1],
            ]);

        const outputFilePath = path.join(__dirname, "output", this.test.fullTitle() + ".json");
        
        // To write new output:
        //await writeJSON(outputFilePath, values);

        const expectedOutput = await readJSON(outputFilePath);
        expect(values).to.eql(expectedOutput);
    });

    it('slope with date index and time format', async function () {

        let df = await dataForge.readFile("./src/test/data/STW.csv")
            .parseCSV({ dynamicTyping: true });

        df = df.parseDates("date", "D/MM/YYYY").setIndex('date');

        const values = df.deflate(row => row.close)
            .slope(30, "hours")
            .toPairs()
            .map(pair => [
                moment(pair[0]).format("YYYY/MM/DD"),
                pair[1],
            ]);

        const outputFilePath = path.join(__dirname, "output", this.test.fullTitle() + ".json");
        
        // To write new output:
        //await writeJSON(outputFilePath, values);

        const expectedOutput = await readJSON(outputFilePath);
        expect(values).to.eql(expectedOutput);
    });
});
