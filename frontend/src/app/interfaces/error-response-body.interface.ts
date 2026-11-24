import type { ErrorCode } from '../enums/error-code.enum';

export interface ErrorResponseBody {
    message: string | string[];
    errorCode?: ErrorCode;
}
