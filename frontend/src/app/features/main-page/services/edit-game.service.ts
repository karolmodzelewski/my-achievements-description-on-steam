import { Injectable, signal } from '@angular/core';

import type { Game } from '../../../interfaces/game.interface';

@Injectable()
export class EditGameService {
    private readonly editedGameState = signal<Game | null>(null, { equal: () => false });

    public readonly editedGame = this.editedGameState.asReadonly();

    public startEditing(game: Game): void {
        this.editedGameState.set(game);
    }

    public stopEditing(): void {
        this.editedGameState.set(null);
    }
}
