import { Catch, HttpException, Logger } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import type { Request } from 'express';

import { isRejectedRequestStatus } from '../utils/http-status.util';
import type { HttpExceptionResponse } from './interfaces/http-exception-response.interface';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    private readonly logger = new Logger('ExceptionsHandler', { timestamp: true });

    public override catch(exception: unknown, host: ArgumentsHost): void {
        if (exception instanceof HttpException && isRejectedRequestStatus(exception.getStatus())) {
            const { method, originalUrl } = host.switchToHttp().getRequest<Request>();

            this.logger.warn(`${method} ${originalUrl} rejected with ${exception.getStatus()}: ${this.getReason(exception)}`);
        }

        super.catch(exception, host);
    }

    private getReason(exception: HttpException): string {
        const response = exception.getResponse();

        if (typeof response === 'string') {
            return response;
        }

        const { message, errorCode } = response as HttpExceptionResponse;
        const reason = Array.isArray(message) ? message.join(', ') : (message ?? exception.message);

        return errorCode === undefined ? reason : `${reason} (${errorCode})`;
    }
}
