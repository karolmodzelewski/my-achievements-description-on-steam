import { BadRequestException, ConflictException, HttpException, HttpStatus, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';

import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter } from './all-exceptions.filter';
import { ErrorCode } from '../enums/error-code.enum';

describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;
    let host: ExecutionContextHost;

    const request = { method: 'PUT', originalUrl: '/api/categories/MAIN' } as Request;

    beforeEach(() => {
        vi.spyOn(BaseExceptionFilter.prototype, 'catch').mockImplementation(() => undefined);
        vi.spyOn(Logger.prototype, 'warn');
        vi.spyOn(Logger.prototype, 'error');

        filter = new AllExceptionsFilter();
        host = new ExecutionContextHost([request, {} as Response]);
    });

    it.each([
        { reason: 'the message', exception: new BadRequestException('Invalid category'), log: 'rejected with 400: Invalid category' },
        {
            reason: 'all validation messages',
            exception: new BadRequestException(['name should not be empty', 'iconName must be a string']),
            log: 'rejected with 400: name should not be empty, iconName must be a string',
        },
        {
            reason: 'the message and the error code',
            exception: new BadRequestException({ message: 'Category names have to be unique', errorCode: ErrorCode.DUPLICATED_CATEGORY_NAME, statusCode: HttpStatus.BAD_REQUEST }),
            log: 'rejected with 400: Category names have to be unique (DUPLICATED_CATEGORY_NAME)',
        },
        { reason: 'the text response', exception: new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS), log: 'rejected with 429: Too many requests' },
        {
            reason: 'the exception message when the response has no message',
            exception: new ConflictException({ statusCode: HttpStatus.CONFLICT }),
            log: 'rejected with 409: Conflict Exception',
        },
    ])('should log the rejected request with $reason', ({ exception, log }) => {
        // Act
        filter.catch(exception, host);

        // Assert
        expect(Logger.prototype.warn).toHaveBeenCalledWith(`PUT /api/categories/MAIN ${log}`);
    });

    it.each([
        { reason: 'a server error', exception: new InternalServerErrorException() },
        { reason: 'an unexpected error', exception: new Error('Connection lost') },
    ])('should not log $reason as a rejected request', ({ exception }) => {
        // Act
        filter.catch(exception, host);

        // Assert
        expect(Logger.prototype.warn).not.toHaveBeenCalled();
    });

    it.each([
        { reason: 'the message', exception: new InternalServerErrorException('The wallpaper source does not exist'), log: 'failed with 500: The wallpaper source does not exist' },
        {
            reason: 'the message and the error code',
            exception: new ServiceUnavailableException({ message: 'GIMP is busy', errorCode: ErrorCode.WALLPAPER_GENERATING, statusCode: HttpStatus.SERVICE_UNAVAILABLE }),
            log: 'failed with 503: GIMP is busy (WALLPAPER_GENERATING)',
        },
    ])('should log the server error thrown on purpose with $reason', ({ exception, log }) => {
        // Act
        filter.catch(exception, host);

        // Assert
        expect(Logger.prototype.error).toHaveBeenCalledWith(`PUT /api/categories/MAIN ${log}`);
    });

    it.each([
        { reason: 'a rejected request', exception: new BadRequestException() },
        { reason: 'an unexpected error', exception: new Error('Connection lost') },
    ])('should not log $reason as a server error thrown on purpose', ({ exception }) => {
        // Act
        filter.catch(exception, host);

        // Assert
        expect(Logger.prototype.error).not.toHaveBeenCalled();
    });

    it.each([
        { reason: 'a rejected request', exception: new BadRequestException() },
        { reason: 'an unexpected error', exception: new Error('Connection lost') },
    ])('should pass $reason to the base filter', ({ exception }) => {
        // Act
        filter.catch(exception, host);

        // Assert
        expect(BaseExceptionFilter.prototype.catch).toHaveBeenCalledWith(exception, host);
    });
});
