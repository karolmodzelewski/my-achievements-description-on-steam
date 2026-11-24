import { BadRequestException, ConflictException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

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

    public async createGame(gameDto: GameDto): Promise<void> {
        this.throwIfNameIsEmpty(gameDto);

        const { groups, categories: categoriesIds, ...game } = gameDto;
        const id = await this.saveGameInTransaction(gameDto.name, async (manager) => {
            const categories = await this.findAssignableCategories(manager, categoriesIds);
            const { id: createdId } = await manager.save(manager.create(Game, { ...game, categories }));

            await this.insertGroups(manager, createdId, groups);

            return createdId;
        });

        this.logger.log(`Created game ${this.getGameSummary(id, gameDto)}`);
    }

    public async updateGame(id: number, gameDto: GameDto): Promise<void> {
        this.throwIfNameIsEmpty(gameDto);

        const { groups, categories: categoriesIds, ...game } = gameDto;

        await this.saveGameInTransaction(gameDto.name, async (manager) => {
            const categories = await this.findAssignableCategories(manager, categoriesIds);
            const { affected } = await manager.update(Game, id, game);

            this.throwIfNotFound(getGameNotFoundMessage(id), affected);

            await manager.save(Game, { id, categories });

            await manager.delete(GameGroup, { game: { id } });
            await this.insertGroups(manager, id, groups);
        });

        this.logger.log(`Updated game ${this.getGameSummary(id, gameDto)}`);
    }

    public async deleteGame(id: number): Promise<void> {
        const { affected } = await this.gameRepository.delete(id);

        this.throwIfNotFound(getGameNotFoundMessage(id), affected);
        this.logger.log(`Deleted game with id '${id}'`);
    }

    public async deleteGroup(gameId: number, groupId: number): Promise<void> {
        const { affected } = await this.gameGroupRepository.delete({ id: groupId, game: { id: gameId } });

        this.throwIfNotFound(`Group with id '${groupId}' of game with id '${gameId}' doesn't exist`, affected);
        this.logger.log(`Deleted group with id '${groupId}' of game with id '${gameId}'`);
    }

    private async saveGameInTransaction<T>(name: string, saveGame: (manager: EntityManager) => Promise<T>): Promise<T> {
        try {
            return await this.gameRepository.manager.transaction(saveGame);
        } catch (error) {
            throw this.mapUniqueNameViolation(error, name);
        }
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
        const reason = this.getUnassignableCategoriesReason(categoriesIds, categories);

        if (reason === null) {
            return categories;
        }

        throw new BadRequestException(`Game can belong only to saved categories, with at most one length and one difficulty category (${reason})`);
    }

    private getUnassignableCategoriesReason(categoriesIds: number[], categories: Category[]): string | null {
        const missingCategoriesIds = categoriesIds.filter((id) => !categories.some((category) => category.id === id));
        const countCategoriesOfKind = (kind: CategoryKind): number => categories.filter((category) => category.kind === kind).length;

        if (missingCategoriesIds.length) {
            return `unknown category ids: ${missingCategoriesIds.join(', ')}`;
        }

        if (countCategoriesOfKind(CategoryKind.ONE_HUNDRED_PERCENT)) {
            return `the 100% category can't be assigned`;
        }

        if (countCategoriesOfKind(CategoryKind.LENGTH) > 1) {
            return `${countCategoriesOfKind(CategoryKind.LENGTH)} length categories`;
        }

        if (countCategoriesOfKind(CategoryKind.DIFFICULTY) > 1) {
            return `${countCategoriesOfKind(CategoryKind.DIFFICULTY)} difficulty categories`;
        }

        return null;
    }

    private getGameSummary(id: number, { name, groups, categories }: GameDto): string {
        return `'${name}' (id ${id}) with ${groups.length} groups and ${categories.length} categories`;
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
