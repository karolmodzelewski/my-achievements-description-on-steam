import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, ParseArrayPipe, ParseEnumPipe, Put } from '@nestjs/common';

import { Observable } from 'rxjs';

import { CategoryDto } from './dtos/category.dto';
import { Category } from '../../entities/category.entity';
import { CategoryKind } from '../../enums/category-kind.enum';
import { CategoriesService } from './services/categories.service';

@Controller('categories')
export class CategoriesController {
    private readonly logger = new Logger(CategoriesController.name, { timestamp: true });

    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    public getCategories(): Observable<Category[]> {
        this.logger.log(`GET Request: Categories`);

        return this.categoriesService.getCategories();
    }

    @Put(':kind')
    @HttpCode(HttpStatus.NO_CONTENT)
    public saveCategories(
        @Param('kind', new ParseEnumPipe(CategoryKind)) kind: CategoryKind,
        @Body(new ParseArrayPipe({ items: CategoryDto, whitelist: true, forbidNonWhitelisted: true })) categoriesDto: CategoryDto[]
    ): Observable<void> {
        this.logger.log(`PUT Request: Save '${JSON.stringify(categoriesDto)}' ${kind} categories`);

        return this.categoriesService.saveCategories(kind, categoriesDto);
    }
}
