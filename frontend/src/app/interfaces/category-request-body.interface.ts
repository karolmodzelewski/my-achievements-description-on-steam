export interface CategoryRequestBody {
    // Missing for a category which is not saved yet
    id?: number;
    name: string;
    description?: string;
    iconName: string;
    shouldHideGames: boolean;
}
