import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

import { CategoryType } from './../../../enums/category-type.enum';

export class AddGameDto {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsArray()
    @ArrayMinSize(0)
    @ArrayMaxSize(6)
    public gameCategories: CategoryType[];

    @IsBoolean()
    @IsNotEmpty()
    public newAchievements: boolean;
}
