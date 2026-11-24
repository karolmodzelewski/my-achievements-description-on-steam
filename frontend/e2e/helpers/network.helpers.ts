import type { Page, Response } from '@playwright/test';

import type { HttpRequestMethod } from '../../src/app/enums/http-request-method.enum';

export const waitForApiResponse = async (page: Page, method: HttpRequestMethod, path: string | RegExp): Promise<Response> =>
    page.waitForResponse((response) => {
        const expectedMethod: string = method;
        const apiPath = new URL(response.url()).pathname.replace(/^\/api\//, '');

        return response.request().method() === expectedMethod && (typeof path === 'string' ? apiPath === path : path.test(apiPath));
    });
