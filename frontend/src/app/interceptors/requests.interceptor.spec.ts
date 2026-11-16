import type { HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';

import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestsInterceptor } from './requests.interceptor';

describe('requestsInterceptor', () => {
    let nextMock: Mock<HttpHandlerFn>;

    beforeEach(() => {
        nextMock = vi.fn((): Observable<HttpEvent<unknown>> => EMPTY);
    });

    it('should send requests to the API', () => {
        // Act
        requestsInterceptor(new HttpRequest('GET', 'categories'), nextMock);

        // Assert
        expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({ url: 'api/categories', method: 'GET' }));
    });
});
