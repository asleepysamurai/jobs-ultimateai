/**
 * Application Entry Point
 */

import fastify from 'fastify';

import { env } from 'utils/environment';
import * as routes from 'routes';
import { createConnection } from 'typeorm';
import { Reply } from 'entities/Reply.entity';
import { resolve } from 'path';

const initDB = async () => {
  await createConnection({
    type: 'sqlite',
    database:
      env.get('DB_PATH') === 'memory'
        ? ':memory:'
        : resolve(__dirname, '../../', env.get('DB_PATH')),
    entities: [Reply],
    synchronize: true,
  });
};

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
    await initDB();
    await initRoutes(app);

    await app.listen(env.getAsInt('APP_SERVER_PORT'), env.get('APP_SERVER_HOST'));
  } catch (err) {
    app.log.error(err as string);
    process.exit(1);
  }

  return app;
};

init();
