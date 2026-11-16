import { Logger } from '@nestjs/common';

import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { httpLoggerMiddleware } from './http-logger.middleware';

import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

describe('httpLoggerMiddleware', () => {
    let request: Request;
    let response: Response;
    let next: Mock<() => void>;

    beforeEach(() => {
        vi.spyOn(Logger.prototype, 'log');
        vi.spyOn(Logger.prototype, 'warn');
        vi.spyOn(Logger.prototype, 'error');
        vi.spyOn(Logger.prototype, 'debug');
        vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1042);

        request = Object.assign(new IncomingMessage(new Socket()), { method: 'POST', originalUrl: '/api/game', body: {} }) as Request;
        response = new ServerResponse(request) as Response;
        next = vi.fn();
    });

    it('should pass the request on and log nothing until it is finished', () => {
        // Act
        httpLoggerMiddleware(request, response, next);

        // Assert
        expect(next).toHaveBeenCalledOnce();
        expect(Logger.prototype.log).not.toHaveBeenCalled();
    });

    it.each([
        { reason: 'a successful request as a log', statusCode: 204, level: 'log' as const },
        { reason: 'a rejected request as a warning', statusCode: 404, level: 'warn' as const },
        { reason: 'a failed request as an error', statusCode: 500, level: 'error' as const },
    ])('should log $reason once it is finished', ({ statusCode, level }) => {
        // Arrange
        response.statusCode = statusCode;

        // Act
        httpLoggerMiddleware(request, response, next);
        response.emit('finish');

        // Assert
        expect(Logger.prototype[level]).toHaveBeenCalledExactlyOnceWith(`POST /api/game ${statusCode} - 42ms`);
    });

    it('should log the body of the request on debug level', () => {
        // Arrange
        request.body = { name: 'Game', hasNewAchievements: false };

        // Act
        httpLoggerMiddleware(request, response, next);
        response.emit('finish');

        // Assert
        expect(Logger.prototype.debug).toHaveBeenCalledWith('POST /api/game body: {"name":"Game","hasNewAchievements":false}');
    });

    it.each([
        { reason: 'an empty body', body: {} },
        { reason: 'a missing body', body: undefined },
    ])('should not log $reason', ({ body }) => {
        // Arrange
        request.body = body;

        // Act
        httpLoggerMiddleware(request, response, next);
        response.emit('finish');

        // Assert
        expect(Logger.prototype.debug).not.toHaveBeenCalled();
    });
});
