import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class GameGroupDto {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsBoolean()
    public hasNewAchievements: boolean;
}
