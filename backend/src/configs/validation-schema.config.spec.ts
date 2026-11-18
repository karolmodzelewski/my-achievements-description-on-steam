import { describe, expect, it } from 'vitest';

import { validationSchemaConfig } from './validation-schema.config';

describe('validationSchemaConfig', () => {
    const environment: Record<string, string> = { STAGE: 'test', APP_PORT: '3001', DB_HOST: 'localhost', DB_PORT: '5432', DB_USERNAME: 'user', DB_PASSWORD: 'password', DB_DATABASE: 'mados' };

    it('should accept the environment and convert the ports to numbers', () => {
        // Act
        const result = validationSchemaConfig.validate(environment);

        // Assert
        expect(result.error).toBeUndefined();
        expect(result.value).toEqual({ ...environment, APP_PORT: 3001, DB_PORT: 5432 });
    });

    it('should convert the database port to a number', () => {
        // Act
        const result = validationSchemaConfig.validate({ ...environment, DB_PORT: '5433' });

        // Assert
        expect(result.value).toMatchObject({ DB_PORT: 5433 });
    });

    it('should reject a database port that is not a number', () => {
        // Act
        const { error } = validationSchemaConfig.validate({ ...environment, DB_PORT: 'port' });

        // Assert
        expect(error?.message).toBe('"DB_PORT" must be a number');
    });

    it.each(['STAGE', 'APP_PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'])('should require %s', (variable) => {
        // Act
        const { error } = validationSchemaConfig.validate({ ...environment, [variable]: undefined });

        // Assert
        expect(error?.message).toBe(`"${variable}" is required`);
    });
});
