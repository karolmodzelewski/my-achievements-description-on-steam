import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { Trim } from '../../../decorators/trim.decorator';

export class CategoryDto {
    // Missing for a new main, length or difficulty category, which is not saved yet
    @IsInt()
    @IsOptional()
    public id?: number;

    @Trim()
    @IsString()
    @IsNotEmpty()
    public name: string;

    @Trim()
    @ValidateIf((_categoryDto: CategoryDto, description: unknown) => description !== undefined)
    @IsString()
    @IsNotEmpty()
    public description?: string;

    @Trim()
    @IsString()
    @IsNotEmpty()
    public iconName: string;

    @IsBoolean()
    public shouldHideGames: boolean;
}
