import { Logger, ValidationPipe } from '@nestjs/common';
import type { LogLevel } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { PRODUCTION_STAGE } from './constants/stage.constants';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { httpLoggerMiddleware } from './middlewares/http-logger.middleware';

const logger = new Logger('Bootstrap');
const getLogLevels = (stage: string | undefined): LogLevel[] => (stage === PRODUCTION_STAGE ? ['fatal', 'error', 'warn', 'log'] : ['fatal', 'error', 'warn', 'log', 'debug', 'verbose']);

async function bootstrap(): Promise<void> {
    const stage = process.env.STAGE;
    const app = await NestFactory.create(AppModule, { logger: getLogLevels(stage) });
    const port = 3001;

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

    await app.listen(port);

    logger.log(`Listening on port ${port} (stage: ${stage})`);
}

void bootstrap().catch((error: unknown) => {
    logger.fatal('Failed to start application', error instanceof Error ? error.stack : error);
    process.exit(1);
});
