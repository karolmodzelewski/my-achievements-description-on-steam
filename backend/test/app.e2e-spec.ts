import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createE2eApplication } from './helpers/app.helpers';

describe('application', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        app = await createE2eApplication();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should respond with not found to an unknown route', async () => {
        // Act
        const response = await request(app.getHttpServer()).get('/api/achievements');

        // Assert
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'Cannot GET /api/achievements', error: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
    });

    it('should serve the routes only under the api prefix', async () => {
        // Act
        const response = await request(app.getHttpServer()).get('/categories');

        // Assert
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
});
