export interface CategoryFormModel {
    // Null for a category which is not saved yet
    id: number | null;
    name: string;
    description: string;
    iconName: string;
    shouldHideGames: boolean;
}
