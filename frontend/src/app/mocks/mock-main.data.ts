import { DescriptionResponseBody } from '../interfaces/description-response-body.interface';
import { CategoriesResponseBody } from '../interfaces/categories-response-body.interface';
import { CategoryType } from '../enums/category-type.enum';

export class MockMainData {
    public categoriesResponseBody: CategoriesResponseBody = {
        categories: [
            {
                type: CategoryType.ONE_HUNDRED_PERCENT,
                iconName: 'ː100ftː',
                description: null,
            },
            {
                type: CategoryType.LOVED_GAME,
                iconName: 'ːHeartPixː',
                description: 'Game which I fall in love',
            },
            {
                type: CategoryType.BAD_GAME,
                iconName: 'ːcleandinoː',
                description: 'This game sucks for various reasons',
            },
            {
                type: CategoryType.DOESNT_COUNT,
                iconName: 'ːQuestion_mː',
                description: `Somehow it doesn't count`,
            },
            {
                type: CategoryType.BUGGED_GAME,
                iconName: 'ːpukeː',
                description: 'Bugged game with broken achievements',
            },
            {
                type: CategoryType.LONG_GAME,
                iconName: 'ːcleanhourglassː',
                description: 'Long game (+25h)',
            },
            {
                type: CategoryType.VERY_LONG_GAME,
                iconName: 'ːcleanhourglassːːcleanhourglassː',
                description: 'Very long game (+50h)',
            },
            {
                type: CategoryType.ULTRA_LONG_GAME,
                iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                description: 'Ultra long game (+100h)',
            },
            {
                type: CategoryType.HARD_GAME,
                iconName: 'ːcsgo_deadː',
                description: 'Hard game to master',
            },
            {
                type: CategoryType.VERY_HARD_GAME,
                iconName: 'ːcsgo_deadːːcsgo_deadː',
                description: 'Very hard game to master',
            },
            {
                type: CategoryType.ULTRA_HARD_GAME,
                iconName: 'ːcsgo_deadːːcsgo_deadːːcsgo_deadː',
                description: 'Ultra hard game to master',
            },
        ]
    };

    public descriptionResponseBody: DescriptionResponseBody = {
        categories: [
            {
                type: CategoryType.LOVED_GAME,
                iconName: 'ːHeartPixː',
                description: 'Game which I fall in love',
                amount: 31,
            },
            {
                type: CategoryType.BAD_GAME,
                iconName: 'ːcleandinoː',
                description: 'This game sucks for various reasons',
                amount: 13,
            },
            {
                type: CategoryType.DOESNT_COUNT,
                iconName: 'ːQuestion_mː',
                description: `Somehow it doesn't count`,
                amount: 5,
            },
            {
                type: CategoryType.BUGGED_GAME,
                iconName: 'ːpukeː',
                description: 'Bugged game with broken achievements',
                amount: 2,
            },
            {
                type: CategoryType.LONG_GAME,
                iconName: 'ːcleanhourglassː',
                description: 'Long game (+25h)',
                amount: 41,
            },
            {
                type: CategoryType.VERY_LONG_GAME,
                iconName: 'ːcleanhourglassːːcleanhourglassː',
                description: 'Very long game (+50h)',
                amount: 22,
            },
            {
                type: CategoryType.ULTRA_LONG_GAME,
                iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                description: 'Ultra long game (+100h)',
                amount: 1,
            },
            {
                type: CategoryType.HARD_GAME,
                iconName: 'ːcsgo_deadː',
                description: 'Hard game to master',
                amount: 12,
            },
            {
                type: CategoryType.VERY_HARD_GAME,
                iconName: 'ːcsgo_deadːːcsgo_deadː',
                description: 'Very hard game to master',
                amount: 21,
            },
            {
                type: CategoryType.ULTRA_HARD_GAME,
                iconName: 'ːcsgo_deadːːcsgo_deadːːcsgo_deadː',
                description: 'Ultra hard game to master',
                amount: 5,
            },
        ],
        completedGames: [
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'DeathComing',
                iconNames: null,
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'FINAL FANTASY X / X-2 HD Remaster',
                iconNames: [
                    'ːHeartPixː',
                    'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                    'ːcsgo_deadːːcsgo_deadː',
                ],
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Pixel Puzzles Traditional Jigsaws',
                iconNames: [
                    'ːcleandinoː',
                    'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                ],
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Sniper Elite 4',
                iconNames: [
                    'ːcleanhourglassːːcleanhourglassː',
                ],
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Stardew Valley',
                iconNames: [
                    'ːHeartPixː',
                    'ːcleanhourglassːːcleanhourglassː',
                    'ːcsgo_deadː',
                ],
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Warframe',
                iconNames: [
                    'ːHeartPixː',
                    'ːcleanhourglassːːcleanhourglassː',
                ],
            },
        ],
        gamesWithNewAchievements: [
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Cuphead',
                iconNames: [
                    'ːcleanhourglassː',
                    'ːcsgo_deadːːcsgo_deadː'
                ],
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Graveyard Keeper',
                iconNames: [
                    'ːHeartPixː',
                    'ːcleanhourglassː',
                ],
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'House Flipper',
                iconNames: null,
            },
            {
                oneHundredPercentIconName: 'ː100ftː',
                name: 'The Binding of Isaac: Rebirth',
                iconNames: [
                    'ːHeartPixː',
                    'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                    'ːcsgo_deadː',
                ],
            },
        ],
    };
}
