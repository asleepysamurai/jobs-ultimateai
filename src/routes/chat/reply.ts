/**
 * POST /chat/reply endpoint
 */

import fastify from 'fastify';
import type { ServerResponse } from 'http';
import { ultimateAPI } from 'utils/ultimate';
import { Reply } from 'entities/Reply.entity';

const schema = {
  body: {
    type: 'object',
    required: ['botId', 'message'],
    properties: {
      botId: { type: 'string' },
      message: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
        intentFound: { type: 'boolean' },
        reply: {
          type: ['string'],
        },
      },
    },
  },
};

const fallbackReply = `Sorry, I didn't understand that. Could you rephrase it?`;

const handle = async (
  app: fastify.FastifyInstance,
  req: fastify.FastifyRequest,
  res: fastify.FastifyReply<ServerResponse>,
) => {
  try {
    const { botId, message } = req.body;

    let intent;
    try {
      intent = await ultimateAPI.getIntentForMessage(botId, message);
    } catch (error) {
      app.log.error('Failed to parse intent', { botId, message, error });
      res.status(500);
      return {
        success: false,
        intentFound: false,
        error: 'Failed to parse intent. This could be temporary. Try again later.',
      };
    }

    const reply = intent ? await Reply.findOne({ where: { intentName: intent } }) : undefined;

    if (!reply) {
      // Intent not found or found intent does not have a matching reply
      // return fallback reply

      // log if missing reply for intent so devs can insert it later on
      app.log.warn('Missing reply for found intent', { intent });
      return {
        success: true,
        intentFound: false,
        reply: fallbackReply,
      };
    }

    return {
      success: true,
      intentFound: true,
      reply: reply.text,
    };
  } catch (error) {
    app.log.error('Unexpected error', { error });
    res.status(500);
    return {
      success: false,
      error: 'Internal server error. Try again later',
    };
  }
};

export const setup = function (app: fastify.FastifyInstance) {
  app.post('/chat/reply', { schema: schema }, handle.bind(null, app));
};
