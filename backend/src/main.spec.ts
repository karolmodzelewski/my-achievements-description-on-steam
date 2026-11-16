import { BadRequestException, Logger } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameDto } from './modules/game/dtos/game.dto';
import { buildGameDto } from './testing/builders/game.builders';
import { stubEnvironment } from './testing/helpers/environment.helpers';

describe('main', () => {
    let app: INestApplication;

    const gameBody = { name: ' Game ', categories: [], hasNewAchievements: false, groups: [] };

    const startApplication = async (): Promise<void> => {
        await import('./main.js');
        await new Promise<void>((resolve) => {
            setImmediate(resolve);
        });
    };

    beforeEach(async () => {
        vi.resetModules();
        stubEnvironment();

        const module = await Test.createTestingModule({}).compile();

        app = module.createNestApplication({ logger: false });

        vi.spyOn(NestFactory, 'create').mockResolvedValue(app);
        vi.spyOn(app, 'setGlobalPrefix');
        vi.spyOn(app, 'use');
        vi.spyOn(app, 'useGlobalFilters');
        vi.spyOn(app, 'useGlobalPipes');
        vi.spyOn(app, 'listen').mockResolvedValue(undefined);
        vi.spyOn(Logger.prototype, 'log');
        vi.spyOn(Logger.prototype, 'fatal');
        vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    });

    it('should create the application with all log levels outside production', async () => {
        // Act
        await startApplication();

        // Assert
        const { AppModule } = await import('./app.module.js');

        expect(NestFactory.create).toHaveBeenCalledWith(AppModule, { logger: ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'] });
    });

    it('should serve the API under the api prefix on port 3001', async () => {
        // Act
        await startApplication();

        // Assert
        expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
        expect(app.listen).toHaveBeenCalledWith(3001);
        expect(Logger.prototype.log).toHaveBeenCalledWith('Listening on port 3001 (stage: test)');
    });

    it('should log every request', async () => {
        // Act
        await startApplication();

        // Assert
        const { httpLoggerMiddleware } = await import('./middlewares/http-logger.middleware.js');

        expect(app.use).toHaveBeenCalledWith(httpLoggerMiddleware);
    });

    it('should handle all exceptions with the exceptions filter', async () => {
        // Act
        await startApplication();

        // Assert
        const { AllExceptionsFilter } = await import('./filters/all-exceptions.filter.js');

        expect(vi.mocked(app.useGlobalFilters).mock.calls[0][0]).toBeInstanceOf(AllExceptionsFilter);
    });

    describe('validation of requests', () => {
        beforeEach(async () => {
            await startApplication();
        });

        it('should transform the request body into its trimmed DTO', async () => {
            // Arrange
            const [validationPipe] = vi.mocked(app.useGlobalPipes).mock.calls[0];

            // Act
            const gameDto: unknown = await validationPipe.transform(gameBody, { type: 'body', metatype: GameDto });

            // Assert
            expect(gameDto).toBeInstanceOf(GameDto);
            expect(gameDto).toEqual(buildGameDto());
        });

        it('should reject properties of the request body unknown to its DTO', async () => {
            // Arrange
            const [validationPipe] = vi.mocked(app.useGlobalPipes).mock.calls[0];

            // Act
            const validation = Promise.resolve(validationPipe.transform({ ...gameBody, isFavourite: true }, { type: 'body', metatype: GameDto }));

            // Assert
            await expect(validation).rejects.toBeInstanceOf(BadRequestException);
            await expect(validation).rejects.toMatchObject({ response: { message: ['property isFavourite should not exist'] } });
        });
    });

    describe('when the application fails to start', () => {
        it('should log the error with its stack and exit', async () => {
            // Arrange
            const error = new Error('Port 3001 is already in use');

            vi.mocked(NestFactory.create).mockRejectedValue(error);

            // Act
            await startApplication();

            // Assert
            expect(Logger.prototype.fatal).toHaveBeenCalledWith('Failed to start application', error.stack);
            expect(process.exit).toHaveBeenCalledWith(1);
            expect(app.listen).not.toHaveBeenCalled();
        });

        it('should log a failure that is not an error as it is and exit', async () => {
            // Arrange
            vi.mocked(NestFactory.create).mockRejectedValue('Database is unavailable');

            // Act
            await startApplication();

            // Assert
            expect(Logger.prototype.fatal).toHaveBeenCalledWith('Failed to start application', 'Database is unavailable');
            expect(process.exit).toHaveBeenCalledWith(1);
        });
    });
});
