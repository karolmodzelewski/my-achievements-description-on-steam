import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';

import { GameGroupDto } from './game-group.dto';
import { Trim } from '../../../decorators/trim.decorator';
import { CategoryType } from '../../../enums/category-type.enum';

export class GameDto {
    // Emptiness of game and group names is validated in GameService, so it's reported once with an error code
    @Trim()
    @IsString()
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
