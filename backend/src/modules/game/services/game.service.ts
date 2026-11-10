import { BadRequestException, ConflictException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { catchError, from, map, Observable, throwError } from 'rxjs';

import { EntityManager, QueryFailedError, Repository } from 'typeorm';

import { GameDto } from '../dtos/game.dto';
import { GameGroupDto } from '../dtos/game-group.dto';
import { Game } from '../../../entities/game.entity';
import { GameGroup } from '../../../entities/game-group.entity';
import { ErrorCode } from '../../../enums/error-code.enum';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

const getGameNotFoundMessage = (id: number): string => `Game with id '${id}' doesn't exist`;

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name, { timestamp: true });

    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(GameGroup)
        private readonly gameGroupRepository: Repository<GameGroup>
    ) {}

    public createGame(gameDto: GameDto): Observable<void> {
        this.logger.log(`Creating game ${JSON.stringify(gameDto)} in database`);
        this.throwIfNameIsEmpty(gameDto);

        const { groups, ...game } = gameDto;

        return from(
            this.gameRepository.manager.transaction(async (manager) => {
                const { id } = await manager.save(manager.create(Game, game));

                await this.insertGroups(manager, id, groups);
            })
        ).pipe(catchError((error: unknown) => throwError(() => this.mapUniqueNameViolation(error, gameDto.name))));
    }

    public updateGame(id: number, gameDto: GameDto): Observable<void> {
        this.logger.log(`Updating game with id '${id}' to ${JSON.stringify(gameDto)}`);
        this.throwIfNameIsEmpty(gameDto);

        const { groups, ...game } = gameDto;

        return from(
            this.gameRepository.manager.transaction(async (manager) => {
                const { affected } = await manager.update(Game, id, game);

                this.throwIfNotFound(getGameNotFoundMessage(id), affected);

                await manager.delete(GameGroup, { game: { id } });
                await this.insertGroups(manager, id, groups);
            })
        ).pipe(catchError((error: unknown) => throwError(() => this.mapUniqueNameViolation(error, gameDto.name))));
    }

    public deleteGame(id: number): Observable<void> {
        this.logger.log(`Deleting game with id '${id}'`);

        return from(this.gameRepository.delete(id)).pipe(map(({ affected }) => this.throwIfNotFound(getGameNotFoundMessage(id), affected)));
    }

    public deleteGroup(gameId: number, groupId: number): Observable<void> {
        this.logger.log(`Deleting group with id '${groupId}' of game with id '${gameId}'`);

        return from(this.gameGroupRepository.delete({ id: groupId, game: { id: gameId } })).pipe(
            map(({ affected }) => this.throwIfNotFound(`Group with id '${groupId}' of game with id '${gameId}' doesn't exist`, affected))
        );
    }

    private async insertGroups(manager: EntityManager, gameId: number, groups: GameGroupDto[]): Promise<void> {
        if (!groups.length) {
            return;
        }

        await manager.insert(
            GameGroup,
            groups.map(({ name, hasNewAchievements }) => ({ name, hasNewAchievements, game: { id: gameId } }))
        );
    }

    private throwIfNameIsEmpty({ name, groups }: GameDto): void {
        if (name !== '' && groups.every((group) => group.name !== '')) {
            return;
        }

        throw new BadRequestException({ message: 'Game or group name has to be provided', errorCode: ErrorCode.EMPTY_NAME, statusCode: HttpStatus.BAD_REQUEST });
    }

    private throwIfNotFound(message: string, affected: number | null | undefined): void {
        if (affected === 0) {
            throw new NotFoundException(message);
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
