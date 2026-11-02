import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { DescriptionController } from './description.controller';
import { DescriptionService } from './services/description.service';

describe('DescriptionController', () => {
    let controller: DescriptionController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DescriptionController],
            providers: [{ provide: DescriptionService, useValue: {} }],
        }).compile();

        controller = module.get<DescriptionController>(DescriptionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
