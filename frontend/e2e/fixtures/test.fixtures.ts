import { test as base } from '@playwright/test';

import { resetData } from '../helpers/api.helpers';
import type { AutoFixtures } from '../interfaces/auto-fixtures.interface';

export { expect } from '@playwright/test';

export const test = base.extend<AutoFixtures>({
    resetData: [
        async ({ request }, use): Promise<void> => {
            await resetData(request);
            await use();
        },
        { auto: true },
    ],
});
