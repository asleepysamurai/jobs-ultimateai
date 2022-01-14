/**
 * Politics management endpoints
 */

import fastify from 'fastify';
import * as evaluate from 'routes/politics/evaluate';

export const politics = (app: fastify.FastifyInstance) => {
  app.get('/evaluation', { schema: evaluate.schema }, evaluate.handle);
};
