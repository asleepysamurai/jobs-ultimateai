/**
 * Replies Endpoint Tests
 */

import type { FastifyInstance } from 'fastify';
import { getManager } from 'typeorm';
import { init } from 'index';
import { Reply } from 'entities/Reply.entity';
import nock from 'nock';
import { env } from 'utils/environment';

const saveReply = async ([intentName, text]: [string, string]) => {
  const manager = getManager();
  const reply = manager.create(Reply, { intentName, text });

  return await reply.save();
};

describe('POST /chat/reply endpoint', () => {
  let app: FastifyInstance;

  nock(`${env.get('ULTIMATE_API_BASEURL')}`)
    .post('/intents', { botId: '5f74865056d7bb000fcd39ff', message: 'Hi' })
    .reply(
      200,
      `{
    "intents": [
        {
            "confidence": 0.4014093041419983,
            "name": "Greeting"
        },
        {
            "confidence": 0.3769925832748413,
            "name": "I want to speak with a human"
        },
        {
            "confidence": 0.2657812535762787,
            "name": "Means or need to contact "
        },
        {
            "confidence": 0.021347086876630783,
            "name": "What can I ask you?"
        },
        {
            "confidence": 0.015370814129710197,
            "name": "Login problems"
        }
    ],
    "entities": []
}`,
    );

  nock(`${env.get('ULTIMATE_API_BASEURL')}`)
    .post('/intents', { botId: 'Dummy Bot Id', message: 'Hi' })
    .reply(
      400,
      `{
    "text": "Missing parameters"
}`,
    );

  nock(`${env.get('ULTIMATE_API_BASEURL')}`)
    .post('/intents', { botId: '5f74865056d7bb000fcd39ff', message: 'Are you a bot?' })
    .reply(
      200,
      `{
    "intents": [
        {
            "confidence": 0.9250213503837585,
            "name": "Are you a bot?"
        },
        {
            "confidence": 0.03363831713795662,
            "name": "Insult"
        },
        {
            "confidence": 0.02281283028423786,
            "name": "Office or store location and opening hours"
        },
        {
            "confidence": 0.00823221541941166,
            "name": "What can I ask you?"
        },
        {
            "confidence": 0.0049621169455349445,
            "name": "Who created you? "
        }
    ],
    "entities": []
}`,
    );

  beforeAll(async () => {
    app = await init();

    // Populate Replies
    const replies = [
      ['Greeting', 'Reply for Greeting'],
      ['Goodbye', 'Reply for Goodbye'],
      ['Affirmative', 'Reply for Affirmative'],
      ['Negative', 'Reply for Negative'],
      ['Thank you', 'Reply for Thank you'],
      ['I want to speak with a human', 'Reply for I want to speak with a human'],
      ['Login Problems', 'Reply for Login Problems'],
      ['Open or close account', 'Reply for Open or close account'],
    ] as Array<[string, string]>;

    for (const reply of replies) {
      await saveReply(reply);
    }
  });

  afterAll(async () => {
    app.close();
  });

  test('Without botId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/reply',
      payload: { message: 'Hi' },
    });

    expect(response.statusCode).toEqual(400);
  });

  test('Without message', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/reply',
      payload: { botId: 'Dummy Bot Id' },
    });

    expect(response.statusCode).toEqual(400);
  });

  test('With invalid botId', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/reply',
      payload: { botId: 'Dummy Bot Id', message: 'Hi' },
    });

    const parsedResponse = JSON.parse(response.body);
    expect(parsedResponse.success).toEqual(true);
    expect(parsedResponse.intentFound).toEqual(false);
  });

  test('With empty message', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/reply',
      payload: { botId: 'Dummy Bot Id', message: '' },
    });

    expect(response.statusCode).toEqual(400);
  });

  test('With valid botId and nonEmpty message', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/reply',
      payload: { botId: '5f74865056d7bb000fcd39ff', message: 'Hi' },
    });

    const parsedResponse = JSON.parse(response.body);
    expect(parsedResponse.success).toEqual(true);
    expect(parsedResponse.intentFound).toEqual(true);
    expect(parsedResponse.reply).toEqual('Reply for Greeting');
  });

  test('With valid botId, nonEmpty message but not configured reply text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/reply',
      payload: { botId: '5f74865056d7bb000fcd39ff', message: 'Are you a bot?' },
    });

    const parsedResponse = JSON.parse(response.body);
    expect(parsedResponse.success).toEqual(true);
    expect(parsedResponse.intentFound).toEqual(true);
    expect(parsedResponse.reply).toEqual(`Sorry, I didn't understand that. Could you rephrase it?`);
  });
});
