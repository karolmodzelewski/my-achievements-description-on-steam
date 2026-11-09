import { Test } from '@nestjs/testing';

import { DescriptionController } from './description.controller';
import { DescriptionService } from './services/description.service';

describe('DescriptionController', () => {
    let controller: DescriptionController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [DescriptionController],
            providers: [{ provide: DescriptionService, useValue: {} }],
        }).compile();

        controller = module.get(DescriptionController);
    });

    it('should be defined', () => {
        // Assert
        expect(controller).toBeDefined();
    });
});
