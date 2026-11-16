import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { EMPTY } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DescriptionApiService } from './description-api.service';

describe('DescriptionApiService', () => {
    let service: DescriptionApiService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), DescriptionApiService],
        });

        service = TestBed.inject(DescriptionApiService);
        httpClient = TestBed.inject(HttpClient);

        vi.spyOn(httpClient, 'get').mockReturnValue(EMPTY);
    });

    it('should request the description', () => {
        // Act
        service.getDescription().subscribe();

        // Assert
        expect(httpClient.get).toHaveBeenCalledWith('description');
    });
});
