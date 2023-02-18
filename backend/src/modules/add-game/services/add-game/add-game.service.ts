import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, map, Observable, switchMap, take, tap } from 'rxjs';

import { InsertResult, Repository } from 'typeorm';

import { Category } from './../../../categories/entities/category.entity';
import { CategoryType } from './../../../../enums/category-type.enum';
import { AddGameDto } from '../../dtos/add-game.dto';
import { CompletedGames } from '../../entities/completed-games.entity';
import { GamesWithNewAchievements } from '../../entities/games-with-new-achievements.entity';
import { Game } from '../../interface/game.interface';

@Injectable()
export class AddGameService {
    private readonly logger: Logger = new Logger(AddGameService.name, { timestamp: true });

    constructor(
        @InjectRepository(CompletedGames)
        private readonly completedGamesRepository: Repository<CompletedGames>,
        @InjectRepository(GamesWithNewAchievements)
        private readonly gamesWithNewAchievementsRepository: Repository<GamesWithNewAchievements>,
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    // TODO: Fix add game. Change array of games to separate game entity
    public upsertGame(addGameDto: AddGameDto): Observable<InsertResult> {
        this.logger.log(`Upserting game ${JSON.stringify(addGameDto)} to database`);

        const gameRepository: Repository<GamesWithNewAchievements | CompletedGames> = addGameDto.newAchievements ? this.gamesWithNewAchievementsRepository : this.completedGamesRepository;

        return this.getMappedGame(addGameDto).pipe(
            take(1),
            switchMap((game: Game) => gameRepository.upsert(game, ['name']))
        );
    }

    private getMappedGame(addGameDto: AddGameDto): Observable<Game> {
        this.logger.log(`Starts to map the game`);

        const { name, gameCategories } = addGameDto;

        return from(this.categoriesRepository.find()).pipe(
            take(1),
            tap(() => this.logger.log(`Get categories`)),
            map((categories: Category[]) => {
                const game: Game = {
                    oneHundredPercentIconName: this.getCategoryIconName(categories, CategoryType.ONE_HUNDRED_PERCENT),
                    name,
                    categories: gameCategories?.length
                        ? gameCategories.map((categoryType: CategoryType) => ({ type: categoryType, iconName: this.getCategoryIconName(categories, categoryType) }))
                        : [],
                };

                return game;
            })
        );
    }

    private getCategoryIconName(categories: Category[], categoryType: CategoryType): string {
        return categories.find((category: Category) => category.type === categoryType).iconName;
    }
}
