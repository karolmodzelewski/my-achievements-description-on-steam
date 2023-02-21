<h1 align="center">My Achievements Description On Steam</h1>

<h5 align="center">
	Made by:
	<a href="https://www.linkedin.com/in/karol-modzelewski/" target="_blank">Karol Modzelewski</a>
</h5>

## Navigation

- [Getting started](#getting-started)
	* [Goal of this application](#goal-of-this-application)
	* [Download application](#download-application)
	* [Run application](#run-application)
	* [Helpful commands](#helpful-commands)
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

- `npm run start:dev` -  runs on `localhost:4200` with `development` configuration
- `npm run start:prod` -  runs on `localhost:4200` with `production` configuration

Backend:

- `npm run start:dev` -  runs on `localhost:3000` with `development` configuration
- `npm run start:prod` -  runs on `localhost:3000` with `production` configuration

### Helpful commands:

Frontend:

- `npm run lint` - lint application
- `npm run lint:fix` - lint application and automatically fixes errors and warnings (if it's supported by specific rules)
- `npm run format` - prettify application

Backend:

- `npm run lint` - lint application
- `npm run lint:fix` - lint application and automatically fixes errors and warnings (if it's supported by specific rules)
- `npm run format` - prettify application

## Tools and technologies:

Frontend:

- Angular 15
- Angular Material 15
- RxJS 7
- TypeScript 4
- Karma 6
- Jasmine 5
- ESLint
- Husky
- Prettier
- Lint-staged

Backend:

- NestJS 9
- RxJS 7
- TypeScript 4
- PostgreSQL
- TypeORM
- Joi
- Cross-env
- Class-validator
- Class-transformer
- ESLint
- Husky
- Prettier
- Lint-staged