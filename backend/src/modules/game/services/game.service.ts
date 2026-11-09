import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { catchError, from, map, Observable, throwError } from 'rxjs';

import { QueryFailedError, Repository } from 'typeorm';

import { GameDto } from '../dtos/game.dto';
import { Game } from '../../../entities/game.entity';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name, { timestamp: true });

    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>
    ) {}

    public createGame(gameDto: GameDto): Observable<void> {
        this.logger.log(`Creating game ${JSON.stringify(gameDto)} in database`);

        return from(this.gameRepository.insert(gameDto)).pipe(
            map(() => undefined),
            catchError((error: unknown) => throwError(() => this.mapUniqueNameViolation(error, gameDto.name)))
        );
    }

    public updateGame(id: number, gameDto: GameDto): Observable<void> {
        this.logger.log(`Updating game with id '${id}' to ${JSON.stringify(gameDto)}`);

        return from(this.gameRepository.update(id, gameDto)).pipe(
            catchError((error: unknown) => throwError(() => this.mapUniqueNameViolation(error, gameDto.name))),
            map(({ affected }) => this.throwIfGameNotFound(id, affected))
        );
    }

    public deleteGame(id: number): Observable<void> {
        this.logger.log(`Deleting game with id '${id}'`);

        return from(this.gameRepository.delete(id)).pipe(map(({ affected }) => this.throwIfGameNotFound(id, affected)));
    }

    private throwIfGameNotFound(id: number, affected: number | null | undefined): void {
        if (affected === 0) {
            throw new NotFoundException(`Game with id '${id}' doesn't exist`);
        }
    }

    private mapUniqueNameViolation(error: unknown, name: string): unknown {
        if (!(error instanceof QueryFailedError)) {
            return error;
        }

        const { code } = error.driverError as { code?: string };

        return code === POSTGRES_UNIQUE_VIOLATION_CODE ? new ConflictException(`Game with name '${name}' already exists`) : error;
    }
}
