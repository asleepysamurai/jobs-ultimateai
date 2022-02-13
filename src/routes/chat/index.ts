/**
 * Chat management endpoints
 */

import fastify from 'fastify';
import { setup as reply } from 'routes/chat/reply';

export const setup = (app: fastify.FastifyInstance) => {
  reply(app);
};
