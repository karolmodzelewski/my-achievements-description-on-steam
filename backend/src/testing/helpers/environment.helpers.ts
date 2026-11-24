import { vi } from 'vitest';

// A stage without an .env.stage.* file, so only the stubbed variables are used
export const TEST_ENVIRONMENT: Record<string, string> = {
    STAGE: 'test',
    APP_PORT: '3001',
    DB_HOST: 'localhost',
    DB_PORT: '5433',
    DB_USERNAME: 'user',
    DB_PASSWORD: 'password',
    DB_DATABASE: 'mados_test',
};

export const stubEnvironment = (): void => {
    for (const [name, value] of Object.entries(TEST_ENVIRONMENT)) {
        vi.stubEnv(name, value);
    }
};
