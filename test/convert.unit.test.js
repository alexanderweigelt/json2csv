const fs = require('fs');
const path = require('path');
const { jsonToCsv, csvToJson } = require('../convert');

const fixtureCsvPath = path.resolve(__dirname, 'data.csv');
const fixtureJsonPath = path.resolve(__dirname, 'data.json');

describe('jsonToCsv/csvToJson using fixtures as ground truth', () => {
    test('jsonToCsv matches fixture CSV (key;value lines)', () => {
        const json = JSON.parse(fs.readFileSync(fixtureJsonPath, 'utf8'));
        const expectedCsv = fs.readFileSync(fixtureCsvPath, 'utf8');
        const actualCsv = jsonToCsv(json);
        expect(actualCsv).toBe(expectedCsv);
    });

    test('csvToJson matches fixture JSON (key;value CSV -> single object)', () => {
        const csv = fs.readFileSync(fixtureCsvPath, 'utf8');
        const expectedJson = JSON.parse(fs.readFileSync(fixtureJsonPath, 'utf8'));
        const actualJson = csvToJson(csv);
        expect(actualJson).toEqual(expectedJson);
    });
});
