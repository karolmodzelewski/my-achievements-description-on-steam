import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CategoryType } from './../../../enums/category-type.enum';

export class CategoryDto {
    @IsEnum(CategoryType)
    @IsNotEmpty()
    public type: CategoryType;

    @IsString()
    @IsNotEmpty()
    public iconName: string;

    @IsString()
    @IsOptional()
    public description: string;
}
