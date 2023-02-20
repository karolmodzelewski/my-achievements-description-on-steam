import { Body, Controller, Get, Logger, Post } from '@nestjs/common';

import { Observable } from 'rxjs';

import { InsertResult } from 'typeorm';

import { CategoryDto } from './dtos/category.dto';
import { CategoriesService } from './services/categories.service';

@Controller('categories')
export class CategoriesController {
    private readonly logger: Logger = new Logger(CategoriesController.name, { timestamp: true });

    constructor(private categoriesService: CategoriesService) {}

    @Get()
    public getCategories(): Observable<CategoryDto[]> {
        this.logger.log(`GET Request: Categories`);

        return this.categoriesService.getCategories();
    }

    @Post()
    public upsertCategories(@Body() categoriesDto: CategoryDto[]): Observable<InsertResult> {
        this.logger.log(`POST Request: Upsert '${JSON.stringify(categoriesDto)}' categories`);

        return this.categoriesService.upsertCategories(categoriesDto);
    }
}
