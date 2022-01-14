/**
 * Application Entry Point
 */

import fastify from 'fastify';

import { env } from 'utils/environment';
import * as routes from 'routes';

const initRoutes = async (app: fastify.FastifyInstance) => {
  return Object.values(routes).map((init) => {
    app.register(async (app, _, done) => {
      await init(app);
      done();
    });
  });
};

const init = async () => {
  const app = fastify({
    ignoreTrailingSlash: true,
    logger: true,
    trustProxy: true,
    ajv: {
      customOptions: {
        coerceTypes: 'array',
      },
    },
  });

  try {
    await initRoutes(app);

    await app.listen(env.getAsInt('APP_SERVER_PORT'), env.get('APP_SERVER_HOST'));
  } catch (err) {
    app.log.error(err as string);
    process.exit(1);
  }

  return app;
};

init();
