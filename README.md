## Forked from [ts-scaffold-f-api](https://github.com/asleepysamurai/ts-scaffold-f-api/) for Ultimate AI Coding Challenge

Gutted all of the authentication and user management code since this challenge requires none of it.

## Running instructions

    yarn install
    yarn run typeorm migration:run

    # to start API
    yarn start

    # for tests
    yarn test

Chat reply endpoint will be available at `http://localhost:3030/chat/reply`

### Things I should probably have done but didn't because of lack of time

- Handle unhappy path from ultimate API responses better. Right now we just force it all into an intent not found.

- Unit tests for the UltimateAPI class

- message and botId based caching of text responses to reduce API burden

### How it works - general algorithm

`src/routes/chat/reply.ts` handles the endpoint

- Retrieves botId and message from req body
- `src/utils/ultimate` is a singleton API client for UltimateAI. Inited with baseUrl and Auth key from config/dev or config/test.
- `ultimateAPI.getIntentForMessage` talks to ultimate API and returns the highest confidence intent. If multiple intents have same confidence (unlikely but wasn't sure if impossible), returns intent not found.
- returns intent not found for any api errors as well (wrong botId/no message etc) - should have handled this better, but I had an unexpectedly busy weekend and not much time to work on this.
- replyHandler then looks up matching reply text for intent from sqlite db and returns response
- if intent not found or intent found but not reply text found we return the fallback text. Additional params `success` and `intentFound` to indicate if api call was a success and if intent was found.

### Libs used

- Fastify for API server
- Typescript
- Typeorm for db interactions
- sqlite3 for db handling
- node-fetch-cjs for http requests
- types-from-env for forcing compile time type errors if unknown env vars are accessed

### Why SQLite?

Because I need this to be portable and SQLite lives in a single file. I'd have preferred Postgres if this wasn't a concern. I've learnt to avoid mongo, but my opinion on mongo is based on my impressions from working with it quite a few years ago, so might be outdated.
