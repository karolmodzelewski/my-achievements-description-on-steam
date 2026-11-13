import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, map, Observable, tap } from 'rxjs';

import { EntityManager, In, Repository } from 'typeorm';

import { Category } from '../../../entities/category.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
import { ErrorCode } from '../../../enums/error-code.enum';
import { compareCategories } from '../../../utils/category-order.util';
import { CategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name, { timestamp: true });

    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    public getCategories(): Observable<Category[]> {
        return from(this.categoriesRepository.find()).pipe(
            tap((categories) => this.logger.debug(`Found ${categories.length} categories`)),
            map((categories) => categories.sort(compareCategories))
        );
    }

    // Replaces all categories of the kind, so categories missing in the request are deleted and their order is the order of the request
    public saveCategories(kind: CategoryKind, categoriesDto: CategoryDto[]): Observable<void> {
        return from(
            this.categoriesRepository.manager.transaction(async (manager) => {
                const savedCategories = await manager.findBy(Category, { kind });

                if (kind === CategoryKind.ONE_HUNDRED_PERCENT) {
                    return this.saveOneHundredPercentCategory(manager, savedCategories, categoriesDto);
                }

                this.throwIfCategoriesAreInvalid(kind, savedCategories, categoriesDto);

                const removedCategoriesIds = savedCategories.filter(({ id }) => !categoriesDto.some((categoryDto) => categoryDto.id === id)).map(({ id }) => id);

                await this.deleteCategories(manager, removedCategoriesIds);
                await manager.save(
                    Category,
                    categoriesDto.map(({ id, name, description, iconName, shouldHideGames }, position) => ({ id, kind, name, description: description ?? null, iconName, shouldHideGames, position }))
                );

                return this.getSavedCategoriesSummary(kind, categoriesDto, removedCategoriesIds);
            })
        ).pipe(
            tap((summary) => this.logger.log(summary)),
            map(() => undefined)
        );
    }

    // The 100% category always exists and has a fixed name, so only its icon can be changed
    private async saveOneHundredPercentCategory(manager: EntityManager, savedCategories: Category[], categoriesDto: CategoryDto[]): Promise<string> {
        if (savedCategories.length !== 1 || categoriesDto.length !== 1 || categoriesDto[0].id !== savedCategories[0].id) {
            throw new BadRequestException(`The 100% category can't be created or deleted (saved ids: ${this.getIdsList(savedCategories)}, requested ids: ${this.getIdsList(categoriesDto)})`);
        }

        const [savedCategory] = savedCategories;
        const [categoryDto] = categoriesDto;

        await manager.update(Category, savedCategory.id, { iconName: categoryDto.iconName });

        return `Updated 100% category icon to '${categoryDto.iconName}'`;
    }

    private throwIfCategoriesAreInvalid(kind: CategoryKind, savedCategories: Category[], categoriesDto: CategoryDto[]): void {
        const unknownCategories = categoriesDto.filter(({ id }) => id !== undefined && !savedCategories.some((category) => category.id === id));

        if (unknownCategories.length) {
            throw new BadRequestException(`Only saved categories of the same kind can be updated (unknown ${kind} category ids: ${this.getIdsList(unknownCategories)})`);
        }

        // Blank names, descriptions and icon names are rejected by CategoryDto, but only the 100% category can go without a description
        if (categoriesDto.some(({ description }) => description === undefined)) {
            throw new BadRequestException(`Category description has to be provided`);
        }

        // Length and difficulty categories are always listed with the game, so only main categories can hide games
        if (kind !== CategoryKind.MAIN && categoriesDto.some(({ shouldHideGames }) => shouldHideGames)) {
            throw new BadRequestException(`Only main categories can hide games`);
        }

        const names = categoriesDto.map(({ name }) => name);

        if (new Set(names).size === names.length) {
            return;
        }

        throw new BadRequestException({ message: 'Category names have to be unique', errorCode: ErrorCode.DUPLICATED_CATEGORY_NAME, statusCode: HttpStatus.BAD_REQUEST });
    }

    // Deleted categories are unassigned from games by the database, as their relation with games cascades on delete
    private async deleteCategories(manager: EntityManager, categoriesIds: number[]): Promise<void> {
        if (!categoriesIds.length) {
            return;
        }

        await manager.delete(Category, { id: In(categoriesIds) });
    }

    private getSavedCategoriesSummary(kind: CategoryKind, categoriesDto: CategoryDto[], removedCategoriesIds: number[]): string {
        const createdAmount = categoriesDto.filter(({ id }) => id === undefined).length;
        const updatedAmount = categoriesDto.length - createdAmount;
        const deletedSummary = removedCategoriesIds.length ? `${removedCategoriesIds.length} deleted and unassigned from games (ids: ${removedCategoriesIds.join(', ')})` : '0 deleted';

        return `Saved ${kind} categories: ${createdAmount} created, ${updatedAmount} updated, ${deletedSummary}`;
    }

    private getIdsList(categories: { id?: number }[]): string {
        return categories.map(({ id }) => id ?? 'new').join(', ') || 'none';
    }
}
