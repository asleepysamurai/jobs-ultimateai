/**
 * POST /user endpoint
 */

import fastify from 'fastify';
import type { ServerResponse } from 'http';
import { CSVEvaluator } from 'routes/politics/CSVEvaluator';

export const schema = {
  querystring: {
    type: 'object',
    required: ['url'],
    properties: {
      url: { type: 'array' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        mostSpeeches: {
          type: ['string', 'null'],
        },
        mostSecurity: {
          type: ['string', 'null'],
        },
        leastWordy: {
          type: ['string', 'null'],
        },
      },
    },
  },
};

export const handle = async (
  req: fastify.FastifyRequest,
  res: fastify.FastifyReply<ServerResponse>,
) => {
  try {
    const { url: urls } = req.query;

    const csvEvaluator = new CSVEvaluator(urls);
    const result = await csvEvaluator.evaluate();

    return result;
  } catch (err) {
    res.status(500);
    return {
      success: false,
      error: {
        message: 'Internal server error',
      },
    };
  }
};
