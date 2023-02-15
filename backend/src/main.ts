import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const logger: Logger = new Logger();
    const app: INestApplication = await NestFactory.create(AppModule);
    const port: number = 3000;

    app.useGlobalPipes(
        new ValidationPipe({
            forbidUnknownValues: false,
        })
    );

    await app.listen(port);

    logger.log(`Starts listening on port: ${port}`);
}

bootstrap();
