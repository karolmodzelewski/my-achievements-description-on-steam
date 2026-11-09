import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { GameGroupDto } from './game-group.dto';
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

    @IsArray()
    @ArrayUnique((group: GameGroupDto) => group.name)
    @ValidateNested({ each: true })
    @Type(() => GameGroupDto)
    public groups: GameGroupDto[];
}
