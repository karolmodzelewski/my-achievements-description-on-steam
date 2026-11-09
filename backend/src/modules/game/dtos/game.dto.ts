import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { CategoryType } from '../../../enums/category-type.enum';

export class GameDto {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsArray()
    @ArrayUnique()
    @IsEnum(CategoryType, { each: true })
    public categories: CategoryType[];

    @IsBoolean()
    public hasNewAchievements: boolean;
}
