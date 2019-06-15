import { assert, expect } from 'chai';
import 'mocha';
import * as dataForge from 'data-forge';
import 'data-forge-fs';
import "../../index";
import * as path from 'path';
import { readJSON, writeJSON } from './test-utils';

describe('macd', () => {

    it('macd', async function () {

        let df = await dataForge.readFile("./src/test/data/STW.csv")
            .parseCSV({ dynamicTyping: true })
        df = df
            // For testing.
            ///.parseDates("date", "D/MM/YYYY")
            .setIndex("date")
            

        const macd = df.deflate(row => row.close).macd(12, 26, 9);
        const values = macd.toPairs();

        const outputFilePath = path.join(__dirname, "output", this.test.fullTitle() + ".json");
        
        // To write new output:
        //await writeJSON(outputFilePath, values);

        const expectedOutput = await readJSON(outputFilePath);
        expect(values).to.eql(expectedOutput);

        // For testing.
        // const m = df.merge(macd);
        // await m
        //     .toStrings("date", "YYYY-MM-DD")
        //     .asCSV()
        //     .writeFile(path.join(__dirname, "output", this.test.fullTitle() + ".csv"));
    });
});
