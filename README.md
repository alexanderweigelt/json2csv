# json2csv

A small tool to convert JSON and CSV.
- It is simple.
- It has no extra dependencies.
- It uses semicolon (;) as delimiter.
- It works only with flat data (no nested objects or arrays).

## Install

- Clone or copy the project.
- Install dev dependencies (for tests only):
```shell script
npm install
```


## Run

- Convert JSON to CSV:
```shell script
node convert.js input.json output.csv
```


- Convert CSV to JSON:
```shell script
node convert.js input.csv output.json
```


## What it can do

1) JSON object -> CSV (key;value lines)
- Input: one flat JSON object
- Output: CSV with two columns: "key";"value"
- Each line is one key and its value
- All fields are quoted
- Quotes inside values are escaped as ""

Example:
```json
{
  "a": "1",
  "b": "2"
}
```
```
"a";"1"
"b";"2"
```


2) CSV key;value lines -> JSON object
- Input: CSV with exactly two columns in every row
- No header row
- Output: one JSON object, keys from column 1, values from column 2
- Quotes are handled. "" becomes " in values.

Example:
```
"a";"1"
"b";"2"
```
```json
{ "a": "1", "b": "2" }
```


## Rules and limits

- Delimiter is always semicolon (;)
- All fields are always quoted
- Only flat data is supported
- No nested objects, no arrays inside objects
- Whitespace at start/end of file is trimmed
- Output ends with a newline

## Testing

- Run tests:
```shell script
npm test
```


## License

ISC
