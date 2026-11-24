import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.e2e-spec.ts'],
        environment: 'node',
        setupFiles: ['src/testing/setup.ts'],
        // All spec files share one database, so they run one by one
        fileParallelism: false,
        // Starting the application connects to the database, which takes longer than the default timeout
        hookTimeout: 30_000,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            // Only the e2e specs are excluded automatically, so unit specs are excluded explicitly
            // main.ts only starts the listening application, which the e2e tests replace with createE2eApplication
            exclude: ['src/testing/**', 'src/**/*.spec.ts', 'src/main.ts'],
            reportsDirectory: './coverage-e2e',
        },
    },
});
