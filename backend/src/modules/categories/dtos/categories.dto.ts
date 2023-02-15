import { ValidateNested, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

import { CategoryDto } from './category.dto';

export class CategoriesDto {
    @ValidateNested({ each: true })
    @Type(() => CategoryDto)
    @IsArray()
    @ArrayMinSize(11)
    @ArrayMaxSize(11)
    public categories: CategoryDto[];
}
