import type { DescriptionResponseBody } from '../interfaces/description-response-body.interface';
import { CategoryType } from '../enums/category-type.enum';
import type { Category } from '../interfaces/category.interface';
import type { Game } from '../interfaces/game.interface';
import type { GameGroup } from '../interfaces/game-group.interface';

export const categoriesResponseBody: Category[] = [
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
        iconName: 'ːbadNkː',
        description: '( ͡° ͜ʖ ͡°)',
    },
    {
        id: 12,
        type: CategoryType.ONE_HUNDRED_PERCENT,
        iconName: 'ː100ftː',
        description: null,
    },
];

const theKillers: Game = {
    id: 1,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'The Killers',
    hasNewAchievements: false,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.ADULT_GAME, iconName: 'ːbadNkː' },
    ],
    groups: [],
};

const deathComing: Game = {
    id: 2,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'DeathComing',
    hasNewAchievements: false,
    groups: [],
};

const finalFantasy: Game = {
    id: 3,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'FINAL FANTASY X / X-2 HD Remaster',
    hasNewAchievements: false,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.ULTRA_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː' },
        { type: CategoryType.VERY_HARD_GAME, iconName: 'ːcsgo_deadːːcsgo_deadː' },
    ],
    groups: [],
};

const fiveNightAtFreddys: Game = {
    id: 4,
    oneHundredPercentIconName: 'ː100ftː',
    name: `Five Nights At Freddy's`,
    hasNewAchievements: false,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.ULTRA_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː' },
        { type: CategoryType.ADULT_GAME, iconName: 'ːbadNkː' },
    ],
    groups: [],
};

const pixelPuzzles: Game = {
    id: 5,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Pixel Puzzles Traditional Jigsaws',
    hasNewAchievements: false,
    categories: [
        { type: CategoryType.BAD_GAME, iconName: 'ːcleandinoː' },
        { type: CategoryType.ULTRA_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː' },
    ],
    groups: [],
};

const sniperElite: Game = {
    id: 6,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Sniper Elite 4',
    hasNewAchievements: false,
    categories: [{ type: CategoryType.VERY_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassː' }],
    groups: [],
};

const stardewValley: Game = {
    id: 7,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Stardew Valley',
    hasNewAchievements: false,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.VERY_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassː' },
        { type: CategoryType.HARD_GAME, iconName: 'ːcsgo_deadː' },
    ],
    groups: [],
};

const warframe: Game = {
    id: 8,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Warframe',
    hasNewAchievements: false,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.ULTRA_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː' },
    ],
    groups: [],
};

const cuphead: Game = {
    id: 9,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Cuphead',
    hasNewAchievements: true,
    categories: [
        { type: CategoryType.LONG_GAME, iconName: 'ːcleanhourglassː' },
        { type: CategoryType.VERY_HARD_GAME, iconName: 'ːcsgo_deadːːcsgo_deadː' },
    ],
    groups: [],
};

const graveyardKeeper: Game = {
    id: 10,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Graveyard Keeper',
    hasNewAchievements: true,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.LONG_GAME, iconName: 'ːcleanhourglassː' },
    ],
    groups: [],
};

const moonlitDiary: Game = {
    id: 11,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Moonlit Diary',
    hasNewAchievements: true,
    categories: [
        { type: CategoryType.BAD_GAME, iconName: 'ːcleandinoː' },
        { type: CategoryType.ADULT_GAME, iconName: 'ːbadNkː' },
    ],
    groups: [],
};

const houseFlipper: Game = {
    id: 12,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'House Flipper',
    hasNewAchievements: true,
    groups: [],
};

const bindingOfIsaac: Game = {
    id: 13,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'The Binding of Isaac: Rebirth',
    hasNewAchievements: true,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.ULTRA_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː' },
        { type: CategoryType.HARD_GAME, iconName: 'ːcsgo_deadː' },
    ],
    groups: [],
};

const abyssalTerrors: GameGroup = { id: 1, name: 'Abyssal Terrors', hasNewAchievements: false };
const primalDread: GameGroup = { id: 2, name: 'Primal Dread', hasNewAchievements: true };
const emergencyMeeting: GameGroup = { id: 3, name: 'Emergency Meeting', hasNewAchievements: true };
const legacyOfTheMoonspell: GameGroup = { id: 4, name: 'Legacy of the Moonspell', hasNewAchievements: false };
const tidesOfTheFoscari: GameGroup = { id: 5, name: 'Tides of the Foscari', hasNewAchievements: false };

const brotato: Game = {
    id: 14,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Brotato',
    hasNewAchievements: true,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.LONG_GAME, iconName: 'ːcleanhourglassː' },
    ],
    groups: [abyssalTerrors, primalDread],
};

const vampireSurvivors: Game = {
    id: 15,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Vampire Survivors',
    hasNewAchievements: false,
    categories: [
        { type: CategoryType.LOVED_GAME, iconName: 'ːHeartPixː' },
        { type: CategoryType.VERY_LONG_GAME, iconName: 'ːcleanhourglassːːcleanhourglassː' },
    ],
    groups: [emergencyMeeting, legacyOfTheMoonspell, tidesOfTheFoscari],
};

export const descriptionResponseBody: DescriptionResponseBody = {
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
            amount: 0,
        },
        {
            id: 5,
            type: CategoryType.ADULT_GAME,
            iconName: 'ːbadNkː',
            description: '( ͡° ͜ʖ ͡°)',
            amount: 20,
        },
        {
            id: 6,
            type: CategoryType.LONG_GAME,
            iconName: 'ːcleanhourglassː',
            description: 'Long game (+25h)',
            amount: 41,
        },
        {
            id: 7,
            type: CategoryType.VERY_LONG_GAME,
            iconName: 'ːcleanhourglassːːcleanhourglassː',
            description: 'Very long game (+50h)',
            amount: 22,
        },
        {
            id: 8,
            type: CategoryType.ULTRA_LONG_GAME,
            iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
            description: 'Ultra long game (+100h)',
            amount: 1,
        },
        {
            id: 9,
            type: CategoryType.HARD_GAME,
            iconName: 'ːcsgo_deadː',
            description: 'Hard game to master',
            amount: 12,
        },
        {
            id: 10,
            type: CategoryType.VERY_HARD_GAME,
            iconName: 'ːcsgo_deadːːcsgo_deadː',
            description: 'Very hard game to master',
            amount: 21,
        },
        {
            id: 11,
            type: CategoryType.ULTRA_HARD_GAME,
            iconName: 'ːcsgo_deadːːcsgo_deadːːcsgo_deadː',
            description: 'Ultra hard game to master',
            amount: 5,
        },
    ],
    completed: {
        amount: 12,
        gamesAmount: 9,
        groupsAmount: 3,
        entries: [
            { game: brotato, group: abyssalTerrors, listedGroups: [] },
            { game: deathComing, group: null, listedGroups: [] },
            { game: finalFantasy, group: null, listedGroups: [] },
            { game: theKillers, group: null, listedGroups: [] },
            { game: pixelPuzzles, group: null, listedGroups: [] },
            { game: sniperElite, group: null, listedGroups: [] },
            { game: stardewValley, group: null, listedGroups: [] },
            { game: vampireSurvivors, group: null, listedGroups: [legacyOfTheMoonspell, tidesOfTheFoscari] },
            { game: fiveNightAtFreddys, group: null, listedGroups: [] },
            { game: warframe, group: null, listedGroups: [] },
        ],
    },
    newAchievements: {
        amount: 8,
        gamesAmount: 6,
        groupsAmount: 2,
        entries: [
            { game: brotato, group: null, listedGroups: [] },
            { game: brotato, group: primalDread, listedGroups: [] },
            { game: cuphead, group: null, listedGroups: [] },
            { game: graveyardKeeper, group: null, listedGroups: [] },
            { game: houseFlipper, group: null, listedGroups: [] },
            { game: moonlitDiary, group: null, listedGroups: [] },
            { game: bindingOfIsaac, group: null, listedGroups: [] },
            { game: vampireSurvivors, group: emergencyMeeting, listedGroups: [] },
        ],
    },
};
