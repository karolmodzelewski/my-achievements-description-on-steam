import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';

import { GameGroupDto } from './game-group.dto';
import { Trim } from '../../../decorators/trim.decorator';

export class GameDto {
    // Emptiness of game and group names is validated in GameService, so it's reported once with an error code
    @Trim()
    @IsString()
    public name: string;

    // Ids of the categories, validated in GameService: only saved categories, never the 100% one, at most one length and one difficulty category
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    public categories: number[];

    @IsBoolean()
    public hasNewAchievements: boolean;

    @IsArray()
    @ArrayUnique((group: GameGroupDto) => group.name)
    @ValidateNested({ each: true })
    @Type(() => GameGroupDto)
    public groups: GameGroupDto[];
}
