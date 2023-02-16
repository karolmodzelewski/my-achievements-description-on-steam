import { Test, TestingModule } from '@nestjs/testing';

import { AddGameService } from './add-game.service';

describe('AddGameService', () => {
    let service: AddGameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AddGameService],
        }).compile();

        service = module.get<AddGameService>(AddGameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
