<h1 align="center">My Achievements Description On Steam</h1>

<h5 align="center">
	Made by:
	<a href="https://www.linkedin.com/in/karol-modzelewski/" target="_blank">Karol Modzelewski</a>
</h5>

## Navigation

- [Getting started](#getting-started)
  - [Goal of this application](#goal-of-this-application)
  - [Download application](#download-application)
  - [Run application](#run-application)
  - [Helpful commands](#helpful-commands)
  - [E2E tests](#e2e-tests)
  - [Playwright MCP](#playwright-mcp)
- [Tools and technologies](#tools-and-technologies)

## Getting started

### Goal of this application:

The point of this application was to create an application to help myself handle all the games where I got all achievements or if some games has new achievements by creating dedicated description which can be easily copied and pasted on my Steam profile. It helps manage all the categories amount and sorts alphabetically all the games but the most important, it shortens time and eliminate the risk of a mistake.

### Download application:

1. Download repository or clone it using `git clone https://github.com/karolmodzelewski/my-achievements-description-on-steam.git` command in your empty folder
2. Go to frontend directory and install all dependencies `npm i`
3. Go to backend directory and install all dependencies `npm i`

### Run application:

Frontend:

- `npm run start:dev` - runs on `localhost:4200` with `development` configuration
- `npm run start:prod` - runs on `localhost:4200` with `production` configuration

Backend:

- `npm run start:dev` - runs on `localhost:3001` with `development` configuration
- `npm run start:prod` - runs on `localhost:3001` with `production` configuration

### Helpful commands:

Frontend:

- `npm run lint` - lint application
- `npm run lint:fix` - lint application and automatically fixes errors and warnings (if it's supported by specific rules)
- `npm run format` - prettify application

Backend:

- `npm run lint` - lint application
- `npm run lint:fix` - lint application and automatically fixes errors and warnings (if it's supported by specific rules)
- `npm run format` - prettify application

### E2E tests:

Playwright tests live in `frontend/e2e`. They run the real frontend against the real backend on the `e2e` stage, which uses its own `mados_e2e` database, so development and production data are never touched.

Setup (once):

1. Create an empty `mados_e2e` database in PostgreSQL (the backend creates its tables on start)
2. Create `backend/.env.stage.e2e` (ignored by git) with `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE=mados_e2e` and `APP_PORT=3101` (all variables are required, like in `.env.stage.dev` and `.env.stage.prod`)
3. Go to frontend directory and install the browsers `npx playwright install chromium firefox webkit`

Commands (frontend directory):

- `npm run e2e` - run all tests in Chromium, Firefox and WebKit. It starts the backend (`npm run start:e2e` on `localhost:3101`) and the frontend (`npm run start:e2e` on `localhost:4300`) itself, so it works next to the development servers on 4200 and 3001
- `npm run e2e -- --project=chromium` - run tests in one browser only
- `npm run e2e:ui` - run tests in UI mode
- `npm run e2e:report` - open the report of the last run

Each test creates only the data it needs through the API (in `beforeEach` or as part of the tested flow) and removes it in `afterEach`, which runs even when the test fails. Every test also starts with `resetData` (API only), run by the automatic fixture in `e2e/fixtures/test.fixtures.ts`, so data left by a stopped or interrupted test (also in UI mode) doesn't break the next one. Tests share one database, so don't run two e2e runs at once (e.g. UI mode and `npm run e2e`).

### Playwright MCP:

Optional. Lets an AI agent (e.g. Claude Code) open the running application in a browser to check the UI: take screenshots, click elements and read console logs.

1. Add the server once: `claude mcp add playwright -- npx @playwright/mcp@latest` (use `-s user` to make it available in all projects)
2. Restart Claude Code / VS Code so the tools get loaded
3. Run the frontend with `npm run start:dev` and ask the agent to check `localhost:4200`

Screenshots, snapshots and logs are saved to `.playwright-mcp/`, which is ignored by git.

## Tools and technologies:

Frontend:

- Angular 22
- Angular Material 22
- RxJS 7
- TypeScript 6
- Vitest 5
- Playwright
- ESLint
- Husky
- Prettier
- Lint-staged

Backend:

- NestJS 12
- TypeScript 6
- PostgreSQL
- TypeORM
- Joi
- Cross-env
- Class-validator
- Class-transformer
- Vitest 5
- ESLint
- Husky
- Prettier
- Lint-staged
