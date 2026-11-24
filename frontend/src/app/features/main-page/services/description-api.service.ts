import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { Observable } from 'rxjs';

import type { DescriptionResponseBody } from '../../../interfaces/description-response-body.interface';

@Injectable()
export class DescriptionApiService {
    private readonly httpClient = inject(HttpClient);

    public getDescription(): Observable<DescriptionResponseBody> {
        return this.httpClient.get<DescriptionResponseBody>('description');
    }
}
