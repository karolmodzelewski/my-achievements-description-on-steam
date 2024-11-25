import { DescriptionResponseBody } from '../interfaces/description-response-body.interface';
import { CategoryType } from '../enums/category-type.enum';
import { Category } from '../interfaces/category.interface';

export class MockMainData {
    public categoriesResponseBody: Category[] = [
        {
            id: 1,
            type: CategoryType.LONG_GAME,
            iconName: 'ːcleanhourglassː',
            description: 'Long game (+25h)',
        },
        {
            id: 2,
            type: CategoryType.VERY_LONG_GAME,
            iconName: 'ːcleanhourglassːːcleanhourglassː',
            description: 'Very long game (+50h)',
        },
        {
            id: 3,
            type: CategoryType.ULTRA_LONG_GAME,
            iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
            description: 'Ultra long game (+100h)',
        },
        {
            id: 4,
            type: CategoryType.HARD_GAME,
            iconName: 'ːcsgo_deadː',
            description: 'Hard game to master',
        },
        {
            id: 5,
            type: CategoryType.VERY_HARD_GAME,
            iconName: 'ːcsgo_deadːːcsgo_deadː',
            description: 'Very hard game to master',
        },
        {
            id: 6,
            type: CategoryType.ULTRA_HARD_GAME,
            iconName: 'ːcsgo_deadːːcsgo_deadːːcsgo_deadː',
            description: 'Ultra hard game to master',
        },
        {
            id: 7,
            type: CategoryType.LOVED_GAME,
            iconName: 'ːHeartPixː',
            description: 'The game I fell in love with',
        },
        {
            id: 8,
            type: CategoryType.BAD_GAME,
            iconName: 'ːcleandinoː',
            description: 'This game sucks for various reasons',
        },
        {
            id: 9,
            type: CategoryType.DOESNT_COUNT,
            iconName: 'ːQuestion_mː',
            description: `Somehow it doesn't count`,
        },
        {
            id: 10,
            type: CategoryType.BUGGED_GAME,
            iconName: 'ːpukeː',
            description: 'Bugged game with broken achievements',
        },
        {
            id: 11,
            type: CategoryType.ADULT_GAME,
            iconName: ':badNk:',
            description: '( ͡° ͜ʖ ͡°)',
        },
        {
            id: 12,
            type: CategoryType.ONE_HUNDRED_PERCENT,
            iconName: 'ː100ftː',
            description: null,
        },
    ];

    public descriptionResponseBody: DescriptionResponseBody = {
        categories: [
            {
                id: 1,
                type: CategoryType.LOVED_GAME,
                iconName: 'ːHeartPixː',
                description: 'The game I fell in love with',
                amount: 31,
            },
            {
                id: 2,
                type: CategoryType.BAD_GAME,
                iconName: 'ːcleandinoː',
                description: 'This game sucks for various reasons',
                amount: 13,
            },
            {
                id: 3,
                type: CategoryType.DOESNT_COUNT,
                iconName: 'ːQuestion_mː',
                description: `Somehow it doesn't count`,
                amount: 5,
            },
            {
                id: 4,
                type: CategoryType.BUGGED_GAME,
                iconName: 'ːpukeː',
                description: 'Bugged game with broken achievements',
                amount: 2,
            },
            {
                id: 5,
                type: CategoryType.ADULT_GAME,
                iconName: 'ːbadNkː',
                description: '( ͡° ͜ʖ ͡°)',
                amount: 20,
            },
            {
                id: 5,
                type: CategoryType.LONG_GAME,
                iconName: 'ːcleanhourglassː',
                description: 'Long game (+25h)',
                amount: 41,
            },
            {
                id: 6,
                type: CategoryType.VERY_LONG_GAME,
                iconName: 'ːcleanhourglassːːcleanhourglassː',
                description: 'Very long game (+50h)',
                amount: 22,
            },
            {
                id: 7,
                type: CategoryType.ULTRA_LONG_GAME,
                iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                description: 'Ultra long game (+100h)',
                amount: 1,
            },
            {
                id: 8,
                type: CategoryType.HARD_GAME,
                iconName: 'ːcsgo_deadː',
                description: 'Hard game to master',
                amount: 12,
            },
            {
                id: 9,
                type: CategoryType.VERY_HARD_GAME,
                iconName: 'ːcsgo_deadːːcsgo_deadː',
                description: 'Very hard game to master',
                amount: 21,
            },
            {
                id: 10,
                type: CategoryType.ULTRA_HARD_GAME,
                iconName: 'ːcsgo_deadːːcsgo_deadːːcsgo_deadː',
                description: 'Ultra hard game to master',
                amount: 5,
            },
        ],
        completedGames: [
            {
                id: 1,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Anime Boobies',
                hasNewAchievements: false,
                categories: [
                    {
                        type: CategoryType.LOVED_GAME,
                        iconName: 'ːHeartPixː',
                    },
                    {
                        type: CategoryType.ADULT_GAME,
                        iconName: ':badNk:',
                    },
                ],
            },
            {
                id: 2,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'DeathComing',
                hasNewAchievements: false,
            },
            {
                id: 3,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'FINAL FANTASY X / X-2 HD Remaster',
                hasNewAchievements: false,
                categories: [
                    {
                        type: CategoryType.LOVED_GAME,
                        iconName: 'ːHeartPixː',
                    },
                    {
                        type: CategoryType.ULTRA_LONG_GAME,
                        iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                    },
                    {
                        type: CategoryType.VERY_HARD_GAME,
                        iconName: 'ːcsgo_deadːːcsgo_deadː',
                    },
                ],
            },
            {
                id: 4,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Hentai Neko Girls',
                hasNewAchievements: false,
                categories: [
                    {
                        type: CategoryType.LOVED_GAME,
                        iconName: 'ːHeartPixː',
                    },
                    {
                        type: CategoryType.ULTRA_LONG_GAME,
                        iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                    },
                    {
                        type: CategoryType.ADULT_GAME,
                        iconName: 'ːbadNkː',
                    },
                ],
            },
            {
                id: 5,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Pixel Puzzles Traditional Jigsaws',
                hasNewAchievements: false,
                categories: [
                    {
                        type: CategoryType.BAD_GAME,
                        iconName: 'ːcleandinoː',
                    },
                    {
                        type: CategoryType.ULTRA_LONG_GAME,
                        iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                    },
                ],
            },
            {
                id: 6,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Sniper Elite 4',
                hasNewAchievements: false,
                categories: [
                    {
                        type: CategoryType.VERY_LONG_GAME,
                        iconName: 'ːcleanhourglassːːcleanhourglassː',
                    },
                ],
            },
            {
                id: 7,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Stardew Valley',
                hasNewAchievements: false,
                categories: [
                    {
                        type: CategoryType.LOVED_GAME,
                        iconName: 'ːHeartPixː',
                    },
                    {
                        type: CategoryType.VERY_LONG_GAME,
                        iconName: 'ːcleanhourglassːːcleanhourglassː',
                    },
                    {
                        type: CategoryType.HARD_GAME,
                        iconName: 'ːcsgo_deadː',
                    },
                ],
            },
            {
                id: 8,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Warframe',
                hasNewAchievements: false,
                categories: [
                    {
                        type: CategoryType.LOVED_GAME,
                        iconName: 'ːHeartPixː',
                    },
                    {
                        type: CategoryType.ULTRA_LONG_GAME,
                        iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                    },
                ],
            },
        ],
        gamesWithNewAchievements: [
            {
                id: 1,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Cuphead',
                hasNewAchievements: true,
                categories: [
                    {
                        type: CategoryType.LONG_GAME,
                        iconName: 'ːcleanhourglassː',
                    },
                    {
                        type: CategoryType.VERY_HARD_GAME,
                        iconName: 'ːcsgo_deadːːcsgo_deadː',
                    },
                ],
            },
            {
                id: 2,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Graveyard Keeper',
                hasNewAchievements: true,
                categories: [
                    {
                        type: CategoryType.LOVED_GAME,
                        iconName: 'ːHeartPixː',
                    },
                    {
                        type: CategoryType.LONG_GAME,
                        iconName: 'ːcleanhourglassː',
                    },
                ],
            },
            {
                id: 3,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'Hentai Furry',
                hasNewAchievements: true,
                categories: [
                    {
                        type: CategoryType.BAD_GAME,
                        iconName: 'ːcleandinoː',
                    },
                    {
                        type: CategoryType.ADULT_GAME,
                        iconName: ':badNk:',
                    },
                ],
            },
            {
                id: 4,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'House Flipper',
                hasNewAchievements: true,
            },
            {
                id: 5,
                oneHundredPercentIconName: 'ː100ftː',
                name: 'The Binding of Isaac: Rebirth',
                hasNewAchievements: true,
                categories: [
                    {
                        type: CategoryType.LOVED_GAME,
                        iconName: 'ːHeartPixː',
                    },
                    {
                        type: CategoryType.ULTRA_LONG_GAME,
                        iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
                    },
                    {
                        type: CategoryType.HARD_GAME,
                        iconName: 'ːcsgo_deadː',
                    },
                ],
            },
        ],
    };
}
