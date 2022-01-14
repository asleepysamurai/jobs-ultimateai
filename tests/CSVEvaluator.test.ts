/**
 * Test test to test if the test tests
 * Delete this in forks
 */

import { CSVEvaluator } from 'routes/politics/CSVEvaluator';
import nock from 'nock';

test('CSVEvaluator single file', async (done) => {
  nock('https://url1.com').get('/1.csv').reply(
    200,
    `Redner, Thema, Datum, Wörter
Alexander Abel, Bildungspolitik, 2012-10-30, 5310
Bernhard Belling, Kohlesubventionen, 2012-11-05, 1210
Caesare Collins, Kohlesubventionen, 2012-11-06, 1119
Alexander Abel, Innere Sicherheit, 2012-12-11, 911
`,
  );

  const evaluator = new CSVEvaluator(['https://url1.com/1.csv']);
  const result = await evaluator.evaluate();
  expect(result).toMatchObject({
    mostSpeeches: null,
    mostSecurity: 'Alexander Abel',
    leastWordy: 'Caesare Collins',
  });
  done();
});

test('CSVEvaluator multiple files', async (done) => {
  nock('https://url1.com').get('/1.csv').reply(
    200,
    `Redner, Thema, Datum, Wörter
Alexander Abel, Bildungspolitik, 2012-10-30, 5310
Bernhard Belling, Kohlesubventionen, 2012-11-05, 1210
`,
  );

  nock('https://url1.com').get('/2.csv').reply(
    200,
    `Redner, Thema, Datum, Wörter
Caesare Collins, Kohlesubventionen, 2012-11-06, 1119
Alexander Abel, Innere Sicherheit, 2012-12-11, 911
`,
  );

  const evaluator = new CSVEvaluator(['https://url1.com/1.csv', 'https://url1.com/2.csv']);
  const result = await evaluator.evaluate();
  expect(result).toMatchObject({
    mostSpeeches: null,
    mostSecurity: 'Alexander Abel',
    leastWordy: 'Caesare Collins',
  });
  done();
});

test('CSVEvaluator multiple files with mostSpeeches', async (done) => {
  nock('https://url1.com').get('/1.csv').reply(
    200,
    `Redner, Thema, Datum, Wörter
Alexander Abel, Bildungspolitik, 2012-10-30, 5310
Bernhard Belling, Innere Sicherheit, 2013-11-05, 1210
`,
  );

  nock('https://url1.com').get('/2.csv').reply(
    200,
    `Redner, Thema, Datum, Wörter
Caesare Collins, Kohlesubventionen, 2012-11-06, 1119
Alexander Abel, Innere Sicherheit, 2012-12-11, 911
`,
  );

  const evaluator = new CSVEvaluator(['https://url1.com/1.csv', 'https://url1.com/2.csv']);
  const result = await evaluator.evaluate();
  expect(result).toMatchObject({
    mostSpeeches: 'Bernhard Belling',
    mostSecurity: null,
    leastWordy: 'Caesare Collins',
  });
  done();
});
