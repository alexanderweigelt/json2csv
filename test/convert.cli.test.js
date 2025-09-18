const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const fixtureCsvPath = path.resolve(__dirname, 'data.csv');
const fixtureJsonPath = path.resolve(__dirname, 'data.json');

function runNode(script, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [script, ...args], opts, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

describe('CLI E2E against fixtures', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'json2csv-'));
  });

  afterEach(() => {
    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('JSON -> CSV matches fixture CSV', async () => {
    const outCsv = path.join(tmpDir, 'out.csv');

    await runNode(path.resolve(__dirname, '../convert.js'), [fixtureJsonPath, outCsv]);

    const actualCsv = fs.readFileSync(outCsv, 'utf8');
    const expectedCsv = fs.readFileSync(fixtureCsvPath, 'utf8');
    expect(actualCsv).toBe(expectedCsv);
  });

  test('CSV -> JSON matches fixture JSON', async () => {
    const outJson = path.join(tmpDir, 'out.json');

    await runNode(path.resolve(__dirname, '../convert.js'), [fixtureCsvPath, outJson]);

    const actualObj = JSON.parse(fs.readFileSync(outJson, 'utf8'));
    const expectedObj = JSON.parse(fs.readFileSync(fixtureJsonPath, 'utf8'));
    expect(actualObj).toEqual(expectedObj);
  });
});
