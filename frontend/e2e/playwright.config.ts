import { defineConfig, devices } from '@playwright/test';

import path from 'node:path';

import { BACKEND_URL, FRONTEND_URL, SERVER_START_TIMEOUT } from './constants/e2e.constants';

export default defineConfig({
    testDir: './specs',
    outputDir: './test-results',
    // All tests share one backend and one database, so they run one by one
    fullyParallel: false,
    workers: 1,
    reporter: [['list'], ['html', { outputFolder: './playwright-report', open: 'never' }]],
    use: {
        // Requests of the request fixture go through the e2e proxy too, so api/... reaches the backend
        baseURL: FRONTEND_URL,
        testIdAttribute: 'data-testId',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: [
        {
            command: 'npm run start:e2e',
            cwd: path.resolve(__dirname, '../../backend'),
            url: `${BACKEND_URL}/api/categories`,
            reuseExistingServer: true,
            timeout: SERVER_START_TIMEOUT,
        },
        {
            command: 'npm run start:e2e',
            cwd: path.resolve(__dirname, '..'),
            url: FRONTEND_URL,
            reuseExistingServer: true,
            timeout: SERVER_START_TIMEOUT,
        },
    ],
});
