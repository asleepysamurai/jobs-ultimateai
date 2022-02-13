/**
 * UltimateAPI Util
 *
 * Manages talking to Ultimate AI API
 */

import fetch from 'node-fetch-cjs';
import { env } from './environment';

type Intent = {
  confidence: number;
  name: string;
};

class UltimateAPI {
  constructor(private readonly baseURL: string, private readonly authKey: string) {}

  // Constructs the endpoint using baseURL.
  // Using a method for this to make future refactoring easier
  // suffix has to have leading slash
  private getEndpoint(suffix: string) {
    return `${this.baseURL}${suffix}`;
  }

  private request(endpoint: string, method: 'post', data: Object = {}) {
    return fetch(this.getEndpoint(endpoint), {
      method,
      headers: {
        'Content-Type': 'application/json',
        authorization: this.authKey,
      },
      body: JSON.stringify(data),
    });
  }

  async getIntentForMessage(botId: string, message: string): Promise<string | null> {
    const res = await this.request('/intents', 'post', { botId, message });
    const {
      intents = [],
    }: {
      intents: Intent[];
    } = (await res.json()) as { intents: Intent[] };

    // I'm not sure if intents is returned sorted by confidence,
    // So iterating and getting the highest confidence

    let highestConfidenceSoFar = -1;
    let mostConfidentIntent: string | null = null;

    for (let { confidence, name } of intents) {
      if (confidence > highestConfidenceSoFar) {
        highestConfidenceSoFar = confidence;
        mostConfidentIntent = name;
      } else if (confidence === highestConfidenceSoFar) {
        // Not sure if multiple intents can have same level of confidence
        // But in case we do have such a situation, we are unable to determine
        // intended intent and return default
        mostConfidentIntent = null;
        break;
      }
    }

    return mostConfidentIntent;
  }
}

export const ultimateAPI = new UltimateAPI(
  env.get('ULTIMATE_API_BASEURL'),
  env.get('ULTIMATE_API_AUTHKEY'),
);
