import type { ErrorCode } from '../../enums/error-code.enum';

export interface HttpExceptionResponse {
    message?: string | string[];
    errorCode?: ErrorCode;
}
