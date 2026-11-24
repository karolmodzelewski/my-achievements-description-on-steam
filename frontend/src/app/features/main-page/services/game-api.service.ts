import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { Observable } from 'rxjs';

import type { AddGameRequestBody } from '../../../interfaces/add-game-request-body.interface';

@Injectable()
export class GameApiService {
    private readonly httpClient = inject(HttpClient);

    public addGame(game: AddGameRequestBody): Observable<void> {
        return this.httpClient.post<void>('game', game);
    }

    public editGame(gameId: number, game: AddGameRequestBody): Observable<void> {
        return this.httpClient.put<void>(`game/${gameId}`, game);
    }

    public deleteGame(gameId: number): Observable<void> {
        return this.httpClient.delete<void>(`game/${gameId}`);
    }

    public deleteGroup(gameId: number, groupId: number): Observable<void> {
        return this.httpClient.delete<void>(`game/${gameId}/group/${groupId}`);
    }
}
