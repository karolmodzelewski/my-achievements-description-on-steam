import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

import { DESCRIPTION_MAX_LENGTH, ICON_NAME_MAX_LENGTH, NAME_MAX_LENGTH } from '../../../constants/validation.constants';
import { Trim } from '../../../decorators/trim.decorator';

export class CategoryDto {
    // Missing for a new main, length or difficulty category, which is not saved yet
    @IsInt()
    @IsOptional()
    public id?: number;

    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(NAME_MAX_LENGTH)
    public name: string;

    @Trim()
    @ValidateIf((_categoryDto: CategoryDto, description: unknown) => description !== undefined)
    @IsString()
    @IsNotEmpty()
    @MaxLength(DESCRIPTION_MAX_LENGTH)
    public description?: string;

    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(ICON_NAME_MAX_LENGTH)
    public iconName: string;

    @IsBoolean()
    public shouldHideGames: boolean;
}
