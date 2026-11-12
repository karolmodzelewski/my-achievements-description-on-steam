import { CategoryKind } from '../enums/category-kind.enum';
import type { Category } from '../interfaces/category.interface';
import type { DescriptionCategory } from '../interfaces/description-category.interface';
import type { DescriptionResponseBody } from '../interfaces/description-response-body.interface';
import type { GameCategory } from '../interfaces/game-category.interface';
import type { Game } from '../interfaces/game.interface';
import type { GameGroup } from '../interfaces/game-group.interface';

const oneHundredPercent: Category = { id: 12, kind: CategoryKind.ONE_HUNDRED_PERCENT, name: '100%', description: null, iconName: 'ː100ftː', shouldHideGames: false, position: 0 };
const lovedGame: Category = {
    id: 7,
    kind: CategoryKind.MAIN,
    name: 'Loved game',
    description: 'The game I fell in love with',
    iconName: 'ːHeartPixː',
    shouldHideGames: false,
    position: 0,
};
const badGame: Category = {
    id: 8,
    kind: CategoryKind.MAIN,
    name: 'Bad game',
    description: 'This game sucks for various reasons',
    iconName: 'ːcleandinoː',
    shouldHideGames: false,
    position: 1,
};
const doesntCount: Category = {
    id: 9,
    kind: CategoryKind.MAIN,
    name: `It doesn't count`,
    description: `Somehow it doesn't count`,
    iconName: 'ːQuestion_mː',
    shouldHideGames: false,
    position: 2,
};
const buggedGame: Category = {
    id: 10,
    kind: CategoryKind.MAIN,
    name: 'Bugged game',
    description: 'Bugged game with broken achievements',
    iconName: 'ːpukeː',
    shouldHideGames: false,
    position: 3,
};
const adultGame: Category = { id: 11, kind: CategoryKind.MAIN, name: 'Adult game', description: '( ͡° ͜ʖ ͡°)', iconName: 'ːbadNkː', shouldHideGames: true, position: 4 };
const longGame: Category = {
    id: 1,
    kind: CategoryKind.LENGTH,
    name: 'Long game',
    description: 'Long game (+25h)',
    iconName: 'ːcleanhourglassː',
    shouldHideGames: false,
    position: 0,
};
const veryLongGame: Category = {
    id: 2,
    kind: CategoryKind.LENGTH,
    name: 'Very long game',
    description: 'Very long game (+50h)',
    iconName: 'ːcleanhourglassːːcleanhourglassː',
    shouldHideGames: false,
    position: 1,
};
const ultraLongGame: Category = {
    id: 3,
    kind: CategoryKind.LENGTH,
    name: 'Ultra long game',
    description: 'Ultra long game (+100h)',
    iconName: 'ːcleanhourglassːːcleanhourglassːːcleanhourglassː',
    shouldHideGames: false,
    position: 2,
};
const hardGame: Category = {
    id: 4,
    kind: CategoryKind.DIFFICULTY,
    name: 'Hard game',
    description: 'Hard game to master',
    iconName: 'ːcsgo_deadː',
    shouldHideGames: false,
    position: 0,
};
const veryHardGame: Category = {
    id: 5,
    kind: CategoryKind.DIFFICULTY,
    name: 'Very hard game',
    description: 'Very hard game to master',
    iconName: 'ːcsgo_deadːːcsgo_deadː',
    shouldHideGames: false,
    position: 1,
};
const ultraHardGame: Category = {
    id: 6,
    kind: CategoryKind.DIFFICULTY,
    name: 'Ultra hard game',
    description: 'Ultra hard game to master',
    iconName: 'ːcsgo_deadːːcsgo_deadːːcsgo_deadː',
    shouldHideGames: false,
    position: 2,
};

const toGameCategory = ({ id, kind, iconName, shouldHideGames }: Category): GameCategory => ({ id, kind, iconName, shouldHideGames });
const toDescriptionCategory = ({ id, kind, name, description, iconName, shouldHideGames }: Category, amount: number): DescriptionCategory => ({
    id,
    kind,
    name,
    description,
    iconName,
    shouldHideGames,
    amount,
});

export const categoriesResponseBody: Category[] = [
    oneHundredPercent,
    lovedGame,
    badGame,
    doesntCount,
    buggedGame,
    adultGame,
    longGame,
    veryLongGame,
    ultraLongGame,
    hardGame,
    veryHardGame,
    ultraHardGame,
];

const theKillers: Game = {
    id: 1,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'The Killers',
    hasNewAchievements: false,
    categories: [toGameCategory(lovedGame), toGameCategory(adultGame)],
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
    categories: [toGameCategory(lovedGame), toGameCategory(ultraLongGame), toGameCategory(veryHardGame)],
    groups: [],
};

const fiveNightAtFreddys: Game = {
    id: 4,
    oneHundredPercentIconName: 'ː100ftː',
    name: `Five Nights At Freddy's`,
    hasNewAchievements: false,
    categories: [toGameCategory(lovedGame), toGameCategory(adultGame), toGameCategory(ultraLongGame)],
    groups: [],
};

const pixelPuzzles: Game = {
    id: 5,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Pixel Puzzles Traditional Jigsaws',
    hasNewAchievements: false,
    categories: [toGameCategory(badGame), toGameCategory(ultraLongGame)],
    groups: [],
};

const sniperElite: Game = {
    id: 6,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Sniper Elite 4',
    hasNewAchievements: false,
    categories: [toGameCategory(veryLongGame)],
    groups: [],
};

const stardewValley: Game = {
    id: 7,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Stardew Valley',
    hasNewAchievements: false,
    categories: [toGameCategory(lovedGame), toGameCategory(veryLongGame), toGameCategory(hardGame)],
    groups: [],
};

const warframe: Game = {
    id: 8,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Warframe',
    hasNewAchievements: false,
    categories: [toGameCategory(lovedGame), toGameCategory(ultraLongGame)],
    groups: [],
};

const cuphead: Game = {
    id: 9,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Cuphead',
    hasNewAchievements: true,
    categories: [toGameCategory(longGame), toGameCategory(veryHardGame)],
    groups: [],
};

const graveyardKeeper: Game = {
    id: 10,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Graveyard Keeper',
    hasNewAchievements: true,
    categories: [toGameCategory(lovedGame), toGameCategory(longGame)],
    groups: [],
};

const moonlitDiary: Game = {
    id: 11,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Moonlit Diary',
    hasNewAchievements: true,
    categories: [toGameCategory(badGame), toGameCategory(adultGame)],
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
    categories: [toGameCategory(lovedGame), toGameCategory(ultraLongGame), toGameCategory(hardGame)],
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
    categories: [toGameCategory(lovedGame), toGameCategory(longGame)],
    groups: [abyssalTerrors, primalDread],
};

const vampireSurvivors: Game = {
    id: 15,
    oneHundredPercentIconName: 'ː100ftː',
    name: 'Vampire Survivors',
    hasNewAchievements: false,
    categories: [toGameCategory(lovedGame), toGameCategory(veryLongGame)],
    groups: [emergencyMeeting, legacyOfTheMoonspell, tidesOfTheFoscari],
};

export const descriptionResponseBody: DescriptionResponseBody = {
    categories: [
        toDescriptionCategory(lovedGame, 31),
        toDescriptionCategory(badGame, 13),
        toDescriptionCategory(doesntCount, 5),
        toDescriptionCategory(buggedGame, 0),
        toDescriptionCategory(adultGame, 20),
        toDescriptionCategory(longGame, 41),
        toDescriptionCategory(veryLongGame, 22),
        toDescriptionCategory(ultraLongGame, 1),
        toDescriptionCategory(hardGame, 12),
        toDescriptionCategory(veryHardGame, 21),
        toDescriptionCategory(ultraHardGame, 5),
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
