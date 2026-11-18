import type { CategoryRequestBody } from '../../src/app/interfaces/category-request-body.interface';

export const ONE_HUNDRED_PERCENT_ICON = 'ː100ftː';
export const LOVED_CATEGORY: CategoryRequestBody = { name: 'Loved game', description: 'Games I loved', iconName: 'ːheartː', shouldHideGames: false };
export const ADULT_CATEGORY: CategoryRequestBody = { name: 'Adult game', description: 'Adult games', iconName: 'ːadultː', shouldHideGames: true };
export const MULTIPLAYER_CATEGORY: CategoryRequestBody = { name: 'Multiplayer game', description: 'Multiplayer games', iconName: 'ːmultiplayerː', shouldHideGames: false };
export const SHORT_CATEGORY: CategoryRequestBody = { name: 'Short', description: 'Short games', iconName: 'ːshortː', shouldHideGames: false };
export const LONG_CATEGORY: CategoryRequestBody = { name: 'Long', description: 'Long games', iconName: 'ːlongː', shouldHideGames: false };
export const EASY_CATEGORY: CategoryRequestBody = { name: 'Easy', description: 'Easy games', iconName: 'ːeasyː', shouldHideGames: false };
export const HARD_CATEGORY: CategoryRequestBody = { name: 'Hard', description: 'Hard games', iconName: 'ːhardː', shouldHideGames: false };
