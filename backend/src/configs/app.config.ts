import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { AllExceptionsFilter } from '../filters/all-exceptions.filter';
import { httpLoggerMiddleware } from '../middlewares/http-logger.middleware';

// Shared by main.ts and the e2e tests, so the tested application is set up exactly like the started one
export const configureApp = (app: INestApplication): void => {
    app.setGlobalPrefix('api');
    app.use(httpLoggerMiddleware);
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost).httpAdapter));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );
};
