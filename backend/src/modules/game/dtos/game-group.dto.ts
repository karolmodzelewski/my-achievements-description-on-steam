import { IsBoolean, IsString, MaxLength } from 'class-validator';

import { NAME_MAX_LENGTH } from '../../../constants/validation.constants';
import { Trim } from '../../../decorators/trim.decorator';

export class GameGroupDto {
    // Emptiness is validated in GameService, together with the game name
    @Trim()
    @IsString()
    @MaxLength(NAME_MAX_LENGTH)
    public name: string;

    @IsBoolean()
    public hasNewAchievements: boolean;
}
