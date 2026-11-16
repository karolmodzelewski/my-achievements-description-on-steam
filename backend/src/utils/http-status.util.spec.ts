import { describe, expect, it } from 'vitest';

import { isRejectedRequestStatus, isServerErrorStatus } from './http-status.util';

describe('http-status.util', () => {
    describe('isRejectedRequestStatus', () => {
        it.each([
            { status: 204, isRejected: false },
            { status: 399, isRejected: false },
            { status: 400, isRejected: true },
            { status: 499, isRejected: true },
            { status: 500, isRejected: false },
        ])('should return isRejected for status', ({ status, isRejected }) => {
            // Act
            const result = isRejectedRequestStatus(status);

            // Assert
            expect(result).toBe(isRejected);
        });
    });

    describe('isServerErrorStatus', () => {
        it.each([
            { status: 204, isServerError: false },
            { status: 499, isServerError: false },
            { status: 500, isServerError: true },
            { status: 503, isServerError: true },
        ])('should return isServerError for status', ({ status, isServerError }) => {
            // Act
            const result = isServerErrorStatus(status);

            // Assert
            expect(result).toBe(isServerError);
        });
    });
});
