import { Logger } from '@nestjs/common';

import type { NextFunction, Request, Response } from 'express';

import { isRejectedRequestStatus, isServerErrorStatus } from '../utils/http-status.util';

const logger = new Logger('HTTP', { timestamp: true });

const hasBody = (body: unknown): boolean => typeof body === 'object' && body !== null && Object.keys(body).length > 0;

// Logs every request once it's finished, including unknown routes and requests rejected before reaching a controller
export const httpLoggerMiddleware = (request: Request, response: Response, next: NextFunction): void => {
    const { method, originalUrl } = request;
    const startTime = Date.now();

    response.on('finish', () => {
        const { statusCode } = response;
        const message = `${method} ${originalUrl} ${statusCode} - ${Date.now() - startTime}ms`;

        // The body is parsed after this middleware runs, so it's read once the request is finished
        // Request bodies are logged only on debug level, so they're visible locally but don't end up in production logs
        if (hasBody(request.body)) {
            logger.debug(`${method} ${originalUrl} body: ${JSON.stringify(request.body)}`);
        }

        if (isServerErrorStatus(statusCode)) {
            logger.error(message);
        } else if (isRejectedRequestStatus(statusCode)) {
            logger.warn(message);
        } else {
            logger.log(message);
        }
    });

    next();
};
