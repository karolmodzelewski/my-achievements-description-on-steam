import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { GameService } from './game.service';
import { Game } from '../../../entities/game.entity';
import { GameGroup } from '../../../entities/game-group.entity';

describe('GameService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [GameService, { provide: getRepositoryToken(Game), useValue: {} }, { provide: getRepositoryToken(GameGroup), useValue: {} }],
        }).compile();

        service = module.get(GameService);
    });

    it('should be defined', () => {
        // Assert
        expect(service).toBeDefined();
    });
});
