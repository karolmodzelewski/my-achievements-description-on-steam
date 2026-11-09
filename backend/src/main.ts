import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const logger = new Logger();
    const app = await NestFactory.create(AppModule);
    const port = 3001;

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    await app.listen(port);

    logger.log(`Starts listening on port: ${port}`);
}

void bootstrap();
