#!/usr/bin/env node

/**
 * Usage
 * =========================================
 * Convert JSON to CSV:
 * `node convert.js data.json output.csv`
 *
 * Convert CSV to JSON:
 * `node convert.js data.csv output.json`
 *
 * Notes
 * =========================================
 * This works only with flat JSON (no nested objects or arrays).
 * CSV values are quoted and escaped properly (`"` becomes `""`).
 * Minimal dependency – no external packages like `csv-parser`.
 */

const fs = require('fs');
const path = require('path');

function jsonToCsv(input) {
  // Fixed delimiter: semicolon
  const delimiter = ';';
  const esc = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  // Case 1: single object -> key;value lines
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const lines = Object.keys(input).map(k => `${esc(k)}${delimiter}${esc(input[k])}`);
    return lines.join('\n') + '\n';
  }

  // Case 2: array of objects -> classic table (union of keys, header + rows)
  if (Array.isArray(input)) {
    const jsonArray = input;
    const keys = [];
    for (const obj of jsonArray) {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const k of Object.keys(obj)) {
          if (!keys.includes(k)) keys.push(k);
        }
      }
    }
    const header = keys.map(esc).join(delimiter);
    const rows = jsonArray.map(obj =>
      keys.map(key => esc(Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : '')).join(delimiter)
    );
    return [header, ...rows].join('\n') + '\n';
  }

  throw new Error('JSON root must be an object or an array of objects');
}

function csvToJson(csvString) {
  // Fixed delimiter: semicolon
  const parseLine = (line) =>
    (line.match(/("([^"]|"")*"|[^;]+)/g) || [])
      .map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));

  const rawLines = csvString.trim().split('\n');
  const lines = rawLines.filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const parsedLines = lines.map(parseLine);

  // Detect key-value CSV (no header): exactly 2 columns in every line
  const isKeyValue = parsedLines.every(cols => cols.length === 2);
  if (isKeyValue) {
    return Object.fromEntries(parsedLines);
  }

  // Fallback: treat first line as header and return array of objects (table)
  const [headerCols, ...dataRows] = parsedLines;
  return dataRows.map(values => {
    return Object.fromEntries(headerCols.map((h, i) => [h, values[i]]));
  });
}

function main(args = process.argv.slice(2)) {
  const [sourceFile, targetFile] = args;
  if (!sourceFile || !targetFile) {
    console.error('Usage: node convert.js <sourceFile> <targetFile>');
    process.exit(1);
  }

  const ext = path.extname(sourceFile).toLowerCase();

  fs.readFile(sourceFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading source file:', err);
      process.exit(1);
    }

    let result;
    if (ext === '.json') {
      let json;
      try {
        json = JSON.parse(data);
      } catch (e) {
        console.error('Invalid JSON:', e.message);
        process.exit(1);
      }

      try {
        // pass directly to jsonToCsv, which handles object vs array
        result = jsonToCsv(json);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    } else if (ext === '.csv') {
      result = JSON.stringify(csvToJson(data), null, 2);
    } else {
      console.error('Unsupported source file type. Use .json or .csv');
      process.exit(1);
    }

    fs.writeFile(targetFile, result, 'utf8', err => {
      if (err) {
        console.error('Error writing target file:', err);
        process.exit(1);
      }
      console.log(`Conversion complete. Output written to ${targetFile}`);
    });
  });
}

// only run when executed via CLI
if (require.main === module) {
  main();
}

// export for tests
module.exports = { jsonToCsv, csvToJson, main };
