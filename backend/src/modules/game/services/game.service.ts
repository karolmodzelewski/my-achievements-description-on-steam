import { BadRequestException, ConflictException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { catchError, from, map, Observable, throwError } from 'rxjs';

import { EntityManager, In, QueryFailedError, Repository } from 'typeorm';

import { GameDto } from '../dtos/game.dto';
import { GameGroupDto } from '../dtos/game-group.dto';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { GameGroup } from '../../../entities/game-group.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
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

        const { groups, categories: categoriesIds, ...game } = gameDto;

        return from(
            this.gameRepository.manager.transaction(async (manager) => {
                const categories = await this.findAssignableCategories(manager, categoriesIds);
                const { id } = await manager.save(manager.create(Game, { ...game, categories }));

                await this.insertGroups(manager, id, groups);
            })
        ).pipe(catchError((error: unknown) => throwError(() => this.mapUniqueNameViolation(error, gameDto.name))));
    }

    public updateGame(id: number, gameDto: GameDto): Observable<void> {
        this.logger.log(`Updating game with id '${id}' to ${JSON.stringify(gameDto)}`);
        this.throwIfNameIsEmpty(gameDto);

        const { groups, categories: categoriesIds, ...game } = gameDto;

        return from(
            this.gameRepository.manager.transaction(async (manager) => {
                const categories = await this.findAssignableCategories(manager, categoriesIds);
                const { affected } = await manager.update(Game, id, game);

                this.throwIfNotFound(getGameNotFoundMessage(id), affected);

                await manager.save(Game, { id, categories });

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

    // A game belongs only to saved categories, to at most one length and one difficulty category
    // Every game is completed 100%, so the 100% category only gives its icon to every game and is never assigned
    private async findAssignableCategories(manager: EntityManager, categoriesIds: number[]): Promise<Category[]> {
        if (!categoriesIds.length) {
            return [];
        }

        const categories = await manager.findBy(Category, { id: In(categoriesIds) });
        const countCategoriesOfKind = (kind: CategoryKind): number => categories.filter((category) => category.kind === kind).length;
        const areCategoriesAssignable = categories.length === categoriesIds.length && categories.every((category) => category.kind !== CategoryKind.ONE_HUNDRED_PERCENT);

        if (areCategoriesAssignable && countCategoriesOfKind(CategoryKind.LENGTH) <= 1 && countCategoriesOfKind(CategoryKind.DIFFICULTY) <= 1) {
            return categories;
        }

        throw new BadRequestException('Game can belong only to saved categories, with at most one length and one difficulty category');
    }

    private throwIfNotFound(message: string, affected: number | null | undefined): void {
        if (affected !== 0) {
            return;
        }

        throw new NotFoundException(message);
    }

    private mapUniqueNameViolation(error: unknown, name: string): unknown {
        if (!(error instanceof QueryFailedError)) {
            return error;
        }

        const { code } = error.driverError as { code?: string };

        return code === POSTGRES_UNIQUE_VIOLATION_CODE ? new ConflictException(`Game with name '${name}' already exists`) : error;
    }
}
