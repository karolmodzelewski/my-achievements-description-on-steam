import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { EMPTY } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoriesApiService } from './categories-api.service';
import { CategoryKind } from '../../../enums/category-kind.enum';
import type { CategoryRequestBody } from '../../../interfaces/category-request-body.interface';

describe('CategoriesApiService', () => {
    let service: CategoriesApiService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), CategoriesApiService],
        });

        service = TestBed.inject(CategoriesApiService);
        httpClient = TestBed.inject(HttpClient);

        vi.spyOn(httpClient, 'get').mockReturnValue(EMPTY);
        vi.spyOn(httpClient, 'put').mockReturnValue(EMPTY);
    });

    it('should request the categories', () => {
        // Act
        service.getCategories().subscribe();

        // Assert
        expect(httpClient.get).toHaveBeenCalledWith('categories');
    });

    it('should request saving the categories of the given kind', () => {
        // Arrange
        const categories: CategoryRequestBody[] = [{ name: 'Long', iconName: ':long:', shouldHideGames: false }];

        // Act
        service.saveCategories(CategoryKind.LENGTH, categories).subscribe();

        // Assert
        expect(httpClient.put).toHaveBeenCalledWith(`categories/${CategoryKind.LENGTH}`, categories);
    });
});
