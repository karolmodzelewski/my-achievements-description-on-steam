import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseArrayPipe, ParseEnumPipe, Put } from '@nestjs/common';

import { Observable } from 'rxjs';

import { CategoryDto } from './dtos/category.dto';
import { Category } from '../../entities/category.entity';
import { CategoryKind } from '../../enums/category-kind.enum';
import { CategoriesService } from './services/categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    public getCategories(): Observable<Category[]> {
        return this.categoriesService.getCategories();
    }

    @Put(':kind')
    @HttpCode(HttpStatus.NO_CONTENT)
    public saveCategories(
        @Param('kind', new ParseEnumPipe(CategoryKind)) kind: CategoryKind,
        @Body(new ParseArrayPipe({ items: CategoryDto, whitelist: true, forbidNonWhitelisted: true })) categoriesDto: CategoryDto[]
    ): Observable<void> {
        return this.categoriesService.saveCategories(kind, categoriesDto);
    }
}
