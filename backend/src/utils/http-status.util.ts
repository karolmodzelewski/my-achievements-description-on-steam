import { HttpStatus } from '@nestjs/common';

const MIN_REJECTED_REQUEST_STATUS: number = HttpStatus.BAD_REQUEST;
const MIN_SERVER_ERROR_STATUS: number = HttpStatus.INTERNAL_SERVER_ERROR;

// The backend rejected the request (4xx)
export const isRejectedRequestStatus = (status: number): boolean => status >= MIN_REJECTED_REQUEST_STATUS && status < MIN_SERVER_ERROR_STATUS;

// The backend failed to handle the request (5xx)
export const isServerErrorStatus = (status: number): boolean => status >= MIN_SERVER_ERROR_STATUS;
