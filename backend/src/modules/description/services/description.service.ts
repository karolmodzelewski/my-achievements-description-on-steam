import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { map, Observable, take, tap, zip } from 'rxjs';

import { Repository } from 'typeorm';

import { Description } from './../interfaces/description.interface';
import { Category } from './../../categories/entities/category.entity';
import { GamesWithNewAchievements } from './../../add-game/entities/games-with-new-achievements.entity';
import { CompletedGames } from './../../add-game/entities/completed-games.entity';
import { CategoryType } from '../../../enums/category-type.enum';
import { CategoryWithAmount } from '../interfaces/category-with-amount.interface';

@Injectable()
export class DescriptionService {
    private readonly logger: Logger = new Logger(DescriptionService.name, { timestamp: true });

    constructor(
        @InjectRepository(CompletedGames)
        private readonly completedGamesRepository: Repository<CompletedGames>,
        @InjectRepository(GamesWithNewAchievements)
        private readonly gamesWithNewAchievementsRepository: Repository<GamesWithNewAchievements>,
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    public getDescription(): Observable<Description> {
        return zip(this.categoriesRepository.find(), this.completedGamesRepository.find(), this.gamesWithNewAchievementsRepository.find()).pipe(
            take(1),
            tap(() => this.logger.log(`Get description`)),
            map((data: [Category[], CompletedGames[], GamesWithNewAchievements[]]) => this.getMappedDescription(data))
        );
    }

    private getMappedDescription(data: [Category[], CompletedGames[], GamesWithNewAchievements[]]): Description {
        const [categories, completedGames, gamesWithNewAchievements] = data;

        const mappedCategories: CategoryWithAmount[] = this.getMappedCategories(categories, completedGames, gamesWithNewAchievements);
        const mappedCompletedGames: CompletedGames[] = this.getMappedGames(categories, completedGames);
        const mappedGamesWithNewAchievements: CompletedGames[] = this.getMappedGames(categories, gamesWithNewAchievements);

        const description: Description = {
            categories: mappedCategories,
            completedGames: mappedCompletedGames,
            gamesWithNewAchievements: mappedGamesWithNewAchievements,
        };

        this.logger.log(`Mapped description: ${JSON.stringify(description)}`);

        return description;
    }

    private getMappedGames(categories: Category[], games: CompletedGames[] | GamesWithNewAchievements[]): CompletedGames[] | GamesWithNewAchievements[] {
        const oneHundredPercentIconName: string = categories.find((category: Category) => category.type === CategoryType.ONE_HUNDRED_PERCENT).iconName;

        return games.map((game: CompletedGames | GamesWithNewAchievements) => ({ ...game, oneHundredPercentIconName }));
    }

    private getMappedCategories(categories: Category[], completedGames: CompletedGames[], gamesWithNewAchievements: GamesWithNewAchievements[]): CategoryWithAmount[] {
        const categoriesWithAmount: CategoryWithAmount[] = categories
            .filter((category: Category) => category.type !== CategoryType.ONE_HUNDRED_PERCENT)
            .map((category: Category) => ({ ...category, amount: 0 }));
        const allGames: (CompletedGames | GamesWithNewAchievements)[] = [...completedGames, ...gamesWithNewAchievements];

        return Object.keys(CategoryType)
            .filter((categoryType: string) => categoryType !== CategoryType.ONE_HUNDRED_PERCENT)
            .map((categoryType: string) => {
                let categoryFound: CategoryWithAmount = categoriesWithAmount.find((category: CategoryWithAmount) => category.type === categoryType);

                allGames
                    .flatMap((game: CompletedGames | GamesWithNewAchievements) => game.categories)
                    .forEach((category: Category) => {
                        if (category.type === categoryType) {
                            categoryFound = { ...categoryFound, amount: (categoryFound.amount += 1) };
                        }
                    });

                return categoryFound;
            });
    }
}
