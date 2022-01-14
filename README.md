## Forked from [ts-scaffold-f-api](https://github.com/asleepysamurai/ts-scaffold-f-api/) for Fashion Digital Coding Challenge

Gutted all of the db, authentication and user management code since this challenge requires none of it.

## Running instructions

    yarn install

    # to start API
    yarn start

    # for tests
    yarn test

Evaluate endpoint will be available at `http://localhost:3030/evaluation`

### Assumptions

- The CSV files loaded from the URLs are not corrupt and parse correctly when parsed into dates and numbers

- Timezone of speech dates mentioned in the CSV files do not matter - local TZ is used everywhere

### Things I should probably have done but didn't because of lack of time

- Better handlign in case the CSV records are corrupt and don't parse correctly. Currently if any one record is erroneous, error is thrown and 500 response returned. Would have preferred making it ignore that record alone.

- Some more tests with different CSV data sets

- url based caching of csv downloads

- Rather than using in memory maps, use a redis hashmap for better performance (less memory usage in-app)

### How it works - general algorithm

`src/routes/politics/CSVEvaluator.ts` does the major chunk of the work. Algorithm it uses is:

- Parallelly stream the csv files from each of the urls provided
- Process the download streams in chunks to prevent system memory getting exhausted
- For each individual record, evaluate the record using this.evaluateRecord and update the speakers stats on this.speakerData
- Finally once all urls have completely been processed, iterate through this.speakerData
- and build the final result set using this.buildResult
