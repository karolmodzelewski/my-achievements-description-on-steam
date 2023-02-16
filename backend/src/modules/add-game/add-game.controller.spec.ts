import { Test, TestingModule } from '@nestjs/testing';

import { AddGameController } from './add-game.controller';

describe('AddGameController', () => {
    let controller: AddGameController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AddGameController],
        }).compile();

        controller = module.get<AddGameController>(AddGameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
