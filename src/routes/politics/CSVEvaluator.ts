/**
 * CSVEvaluator
 *
 * Initialized with a list of urls
 * Calling evaluate causes the urls to be downloaded and parsed in parallel
 */

import * as request from 'request';
import csv from 'csv-parser';

type CSVRecord = {
  name: string;
  topic: string;
  date: Date;
  wordCount: number;
};

type SpeakerData = {
  speechCountIn2013: number;
  speechesOnSecurity: number;
  totalWordCount: number;
};

type EvaluationResult = {
  mostSpeeches: string | null;
  mostSecurity: string | null;
  leastWordy: string | null;
};

export class CSVEvaluator {
  private speakerData: Map<string, SpeakerData> = new Map<string, SpeakerData>();

  constructor(private readonly urls: string[]) {}

  /**
   * Evaluate an individual CSV record and
   * update existing record for the speaker in this.speakerData map appropriately
   * Creates new record for the speaker if none previously exists
   * @param {CSVRecord} record [description]
   */
  private evaluateRecord(record: CSVRecord) {
    const speakerDataDiff = {
      speechCountIn2013: record.date.getFullYear() === 2013 ? 1 : 0, // Assuming local TZ is fine to uses
      speechesOnSecurity: record.topic === 'Innere Sicherheit' ? 1 : 0, // Assuming topic case and other word normalization not required
      totalWordCount: record.wordCount,
    };

    const speakerData = this.speakerData.get(record.name);
    if (speakerData) {
      this.speakerData.set(record.name, {
        speechCountIn2013: speakerData.speechCountIn2013 + speakerDataDiff.speechCountIn2013,
        speechesOnSecurity: speakerData.speechesOnSecurity + speakerDataDiff.speechesOnSecurity,
        totalWordCount: speakerData.totalWordCount + speakerDataDiff.totalWordCount,
      });
    } else {
      this.speakerData.set(record.name, speakerDataDiff);
    }
  }

  /**
   * Iterate through this.speakerData map and find which speaker matches
   * mostSpeeches, mostSecurity and leastWordy requirements
   * @return {EvaluationResult} [description]
   */
  private buildResult(): EvaluationResult {
    let result: EvaluationResult = {
      mostSpeeches: null,
      mostSecurity: null,
      leastWordy: null,
    };

    let mostSpeechesCount = 0;
    let mostSecurityCount = 0;
    let leastWordyCount = Infinity;

    for (const [name, speakerData] of this.speakerData) {
      if (speakerData.speechCountIn2013 > mostSpeechesCount) {
        result.mostSpeeches = name;
        mostSpeechesCount = speakerData.speechCountIn2013;
      } else if (speakerData.speechCountIn2013 === mostSpeechesCount) {
        result.mostSpeeches = null;
      }

      if (speakerData.speechesOnSecurity > mostSecurityCount) {
        result.mostSecurity = name;
        mostSecurityCount = speakerData.speechesOnSecurity;
      } else if (speakerData.speechesOnSecurity === mostSecurityCount) {
        result.mostSecurity = null;
      }

      if (speakerData.totalWordCount < leastWordyCount) {
        result.leastWordy = name;
        leastWordyCount = speakerData.totalWordCount;
      } else if (speakerData.totalWordCount === leastWordyCount) {
        result.leastWordy = null;
      }
    }

    return result;
  }

  /**
   * Parallelly stream the csv files from each of the urls provided
   * Process the download streams in chunks to prevent system memory getting exhausted
   * For each individual record, evaluate the record using this.evaluateRecord and update the
   * speakers stats on this.speakerData
   * Finally once all urls have completely been processed, iterate through this.speakerData
   * and build the final result set using this.buildResult
   * @return {Promise<EvaluationResult>} [description]
   */
  public async evaluate(): Promise<EvaluationResult> {
    await Promise.all(
      this.urls.map((url) => {
        return new Promise<void>((resolve, reject) => {
          request
            .get(url)
            .pipe(
              csv({
                mapHeaders: ({ header }) => {
                  switch (header.trim()) {
                    case 'Redner':
                      return 'name';
                    case 'Thema':
                      return 'topic';
                    case 'Datum':
                      return 'date';
                    case 'Wörter':
                      return 'wordCount';
                    default:
                      return null;
                  }
                },
                mapValues: ({ header, value }) => {
                  value = value.trim();
                  if (header === 'date') {
                    // Assumption date formats are always 'YYYY-MM-DD' and record is not corrupt
                    return new Date(value);
                  }

                  if (header === 'wordCount') {
                    // Assumption wordCount is always a parse-able integer number
                    return parseInt(value);
                  }

                  return `${value}`; // Coerce to string
                },
                maxRowBytes: 10 * 1024 * 1024, // Max of 10 Mib per record
              }),
            )
            .on('error', (err) => {
              reject(err);
            })
            .on('data', (data: CSVRecord) => {
              this.evaluateRecord(data);
            })
            .on('end', () => {
              resolve();
            });
        });
      }),
    );

    return this.buildResult();
  }
}
