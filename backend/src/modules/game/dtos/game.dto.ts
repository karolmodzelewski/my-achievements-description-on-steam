import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';

import { GameGroupDto } from './game-group.dto';
import { CATEGORIES_MAX_AMOUNT, GROUPS_MAX_AMOUNT, NAME_MAX_LENGTH } from '../../../constants/validation.constants';
import { Trim } from '../../../decorators/trim.decorator';

export class GameDto {
    // Emptiness of game and group names is validated in GameService, so it's reported once with an error code
    @Trim()
    @IsString()
    @MaxLength(NAME_MAX_LENGTH)
    public name: string;

    // Ids of the categories, validated in GameService: only saved categories, never the 100% one, at most one length and one difficulty category
    @IsArray()
    @ArrayMaxSize(CATEGORIES_MAX_AMOUNT)
    @ArrayUnique()
    @IsInt({ each: true })
    public categories: number[];

    @IsBoolean()
    public hasNewAchievements: boolean;

    @IsArray()
    @ArrayMaxSize(GROUPS_MAX_AMOUNT)
    @ArrayUnique((group: GameGroupDto) => group.name)
    @ValidateNested({ each: true })
    @Type(() => GameGroupDto)
    public groups: GameGroupDto[];
}
