import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';

import { Observable } from 'rxjs';

import { InsertResult } from 'typeorm';

import { CategoriesDto } from './dtos/categories.dto';
import { CategoriesService } from './services/categories.service';

@Controller('categories')
export class CategoriesController {
    private readonly logger: Logger = new Logger(CategoriesController.name, { timestamp: true });

    constructor(private categoriesService: CategoriesService) {}

    @Get()
    public getCategories(): Observable<CategoriesDto> {
        this.logger.log(`GET Request: Categories`);

        return this.categoriesService.getCategories();
    }

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    public upsertCategories(@Body() categoriesDto: CategoriesDto): Observable<InsertResult> {
        this.logger.log(`POST Request: Upsert '${JSON.stringify(categoriesDto)}' categories`);

        return this.categoriesService.upsertCategories(categoriesDto);
    }
}
