import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { Observable } from 'rxjs';

import type { CategoryKind } from '../../../enums/category-kind.enum';
import type { CategoryRequestBody } from '../../../interfaces/category-request-body.interface';
import type { Category } from '../../../interfaces/category.interface';

@Injectable()
export class CategoriesApiService {
    private readonly httpClient = inject(HttpClient);

    public getCategories(): Observable<Category[]> {
        return this.httpClient.get<Category[]>('categories');
    }

    public saveCategories(kind: CategoryKind, categories: CategoryRequestBody[]): Observable<void> {
        return this.httpClient.put<void>(`categories/${kind}`, categories);
    }
}
