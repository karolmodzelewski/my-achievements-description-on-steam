import { describe, expect, it } from 'vitest';

import { getLogLevels, isProductionStage } from './stage.util';
import { PRODUCTION_STAGE } from '../constants/stage.constants';

describe('stage.util', () => {
    describe('isProductionStage', () => {
        it('should recognize the production stage', () => {
            // Act
            const isProduction = isProductionStage(PRODUCTION_STAGE);

            // Assert
            expect(isProduction).toBe(true);
        });

        it.each(['dev', 'test', undefined])('should not recognize the %s stage as production', (stage) => {
            // Act
            const isProduction = isProductionStage(stage);

            // Assert
            expect(isProduction).toBe(false);
        });
    });

    describe('getLogLevels', () => {
        it('should leave out debug and verbose logs, including request bodies, in production', () => {
            // Act
            const logLevels = getLogLevels(PRODUCTION_STAGE);

            // Assert
            expect(logLevels).toEqual(['fatal', 'error', 'warn', 'log']);
        });

        it.each(['dev', 'test', undefined])('should include all log levels on the %s stage', (stage) => {
            // Act
            const logLevels = getLogLevels(stage);

            // Assert
            expect(logLevels).toEqual(['fatal', 'error', 'warn', 'log', 'debug', 'verbose']);
        });
    });
});
