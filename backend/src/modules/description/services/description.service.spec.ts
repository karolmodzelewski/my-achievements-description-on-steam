import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DescriptionService } from './description.service';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';

describe('DescriptionService', () => {
    let service: DescriptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DescriptionService, { provide: getRepositoryToken(Category), useValue: {} }, { provide: getRepositoryToken(Game), useValue: {} }],
        }).compile();

        service = module.get<DescriptionService>(DescriptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
