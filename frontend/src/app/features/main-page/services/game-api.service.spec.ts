import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { EMPTY } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameApiService } from './game-api.service';
import type { AddGameRequestBody } from '../../../interfaces/add-game-request-body.interface';

describe('GameApiService', () => {
    let service: GameApiService;
    let httpClient: HttpClient;

    const game: AddGameRequestBody = { name: 'Game', categories: [1], hasNewAchievements: false, groups: [] };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), GameApiService],
        });

        service = TestBed.inject(GameApiService);
        httpClient = TestBed.inject(HttpClient);

        vi.spyOn(httpClient, 'post').mockReturnValue(EMPTY);
        vi.spyOn(httpClient, 'put').mockReturnValue(EMPTY);
        vi.spyOn(httpClient, 'delete').mockReturnValue(EMPTY);
    });

    it('should request adding the game', () => {
        // Act
        service.addGame(game).subscribe();

        // Assert
        expect(httpClient.post).toHaveBeenCalledWith('game', game);
    });

    it('should request editing the game with the given id', () => {
        // Act
        service.editGame(5, game).subscribe();

        // Assert
        expect(httpClient.put).toHaveBeenCalledWith('game/5', game);
    });

    it('should request deleting the game with the given id', () => {
        // Act
        service.deleteGame(5).subscribe();

        // Assert
        expect(httpClient.delete).toHaveBeenCalledWith('game/5');
    });

    it('should request deleting the group with the given id of the game', () => {
        // Act
        service.deleteGroup(5, 9).subscribe();

        // Assert
        expect(httpClient.delete).toHaveBeenCalledWith('game/5/group/9');
    });
});
