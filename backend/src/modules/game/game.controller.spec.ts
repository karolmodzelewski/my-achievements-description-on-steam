import { Test } from '@nestjs/testing';

import { GameController } from './game.controller';
import { GameService } from './services/game.service';

describe('GameController', () => {
    let controller: GameController;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [GameController],
            providers: [{ provide: GameService, useValue: {} }],
        }).compile();

        controller = module.get(GameController);
    });

    it('should be defined', () => {
        // Assert
        expect(controller).toBeDefined();
    });
});
