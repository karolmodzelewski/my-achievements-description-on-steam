import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Trim } from '../../../decorators/trim.decorator';
import { CategoryType } from '../../../enums/category-type.enum';

export class CategoryDto {
    @IsEnum(CategoryType)
    public type: CategoryType;

    @Trim()
    @IsString()
    @IsNotEmpty()
    public iconName: string;

    @Trim()
    @IsString()
    @IsOptional()
    public description?: string;
}
