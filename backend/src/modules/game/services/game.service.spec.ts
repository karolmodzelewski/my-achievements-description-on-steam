import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { GameService } from './game.service';
import { Game } from '../../../entities/game.entity';

describe('GameService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, { provide: getRepositoryToken(Game), useValue: {} }],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
