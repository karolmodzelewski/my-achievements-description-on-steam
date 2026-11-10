import { IsBoolean, IsString } from 'class-validator';

import { Trim } from '../../../decorators/trim.decorator';

export class GameGroupDto {
    // Emptiness is validated in GameService, together with the game name
    @Trim()
    @IsString()
    public name: string;

    @IsBoolean()
    public hasNewAchievements: boolean;
}
