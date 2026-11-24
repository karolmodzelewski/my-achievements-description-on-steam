import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './configs/app.config';
import { getLogLevels } from './utils/stage.util';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
    const stage = process.env.STAGE;
    const app = await NestFactory.create(AppModule, { logger: getLogLevels(stage) });
    const port = app.get(ConfigService).getOrThrow<number>('APP_PORT');

    configureApp(app);

    await app.listen(port);

    logger.log(`Listening on port ${port} (stage: ${stage})`);
}

void bootstrap().catch((error: unknown) => {
    logger.fatal('Failed to start application', error instanceof Error ? error.stack : error);
    process.exit(1);
});
