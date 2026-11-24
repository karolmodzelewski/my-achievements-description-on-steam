export interface GameGroupFormModel {
    // Null for a group which is not saved yet
    id: number | null;
    name: string;
    hasNewAchievements: boolean;
}
