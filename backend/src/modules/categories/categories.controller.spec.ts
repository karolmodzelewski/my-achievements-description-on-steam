import { Test } from '@nestjs/testing';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './services/categories.service';

describe('CategoriesController', () => {
    let controller: CategoriesController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [{ provide: CategoriesService, useValue: {} }],
        }).compile();

        controller = module.get(CategoriesController);
    });

    it('should be defined', () => {
        // Assert
        expect(controller).toBeDefined();
    });
});
