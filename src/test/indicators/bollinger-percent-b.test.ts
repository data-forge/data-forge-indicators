import { assert, expect } from "chai";
import "mocha";
import * as dataForge from "data-forge";
import "data-forge-fs";
import "../../index";
import * as path from "path";
import { readJSON, writeJSON } from "./test-utils";

describe("bollinger percent b", () => {

    it("percent b", async function () {

        const df = await dataForge.readFile("./src/test/data/STW.csv")
            .parseCSV({ dynamicTyping: true });

        const values = df.deflate(row => row.close)
            .bollinger(20, 2, 2)
            .percentB()
            .toPairs();

        const outputFilePath = path.join(__dirname, "output", this.test.fullTitle() + ".json");
        
        // To write new output:
        //await writeJSON(outputFilePath, values);

        const expectedOutput = await readJSON(outputFilePath);
        expect(values).to.eql(expectedOutput);
    });

});
