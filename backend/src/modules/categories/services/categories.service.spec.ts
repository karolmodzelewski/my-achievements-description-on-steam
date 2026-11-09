import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { Category } from '../../../entities/category.entity';

describe('CategoriesService', () => {
    let service: CategoriesService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [CategoriesService, { provide: getRepositoryToken(Category), useValue: {} }],
        }).compile();

        service = module.get(CategoriesService);
    });

    it('should be defined', () => {
        // Assert
        expect(service).toBeDefined();
    });
});
