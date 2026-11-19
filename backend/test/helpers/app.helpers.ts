import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import type { App } from 'supertest/types';

import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/configs/app.config';

const E2E_STAGE = 'e2e';

export const createE2eApplication = async (): Promise<INestApplication<App>> => {
    // Every test truncates the database, so the application never starts with the database of another stage
    if (process.env.STAGE !== E2E_STAGE) {
        throw new Error(`E2E tests have to run on the '${E2E_STAGE}' stage (current stage: '${process.env.STAGE ?? 'none'}')`);
    }

    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = module.createNestApplication<INestApplication<App>>();

    configureApp(app);

    return app.init();
};
