import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { httpLoggerMiddleware } from './middlewares/http-logger.middleware';
import { getLogLevels } from './utils/stage.util';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
    const stage = process.env.STAGE;
    const app = await NestFactory.create(AppModule, { logger: getLogLevels(stage) });
    const port = app.get(ConfigService).getOrThrow<number>('APP_PORT');

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
