import { HttpErrorResponse } from '@angular/common/http';

import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';

import type { ErrorResponseBody } from '../../app/interfaces/error-response-body.interface';

export const mockErrorResponse = (errorResponseBody: ErrorResponseBody | null = null): Observable<never> =>
    throwError(() => new HttpErrorResponse({ status: errorResponseBody ? 400 : 500, error: errorResponseBody }));
