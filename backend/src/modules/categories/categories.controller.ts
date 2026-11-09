import { Body, Controller, Get, HttpCode, HttpStatus, Logger, ParseArrayPipe, Post } from '@nestjs/common';

import { Observable } from 'rxjs';

import { CategoryDto } from './dtos/category.dto';
import { Category } from '../../entities/category.entity';
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

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    public upsertCategories(@Body(new ParseArrayPipe({ items: CategoryDto, whitelist: true, forbidNonWhitelisted: true })) categoriesDto: CategoryDto[]): Observable<void> {
        this.logger.log(`POST Request: Upsert '${JSON.stringify(categoriesDto)}' categories`);

        return this.categoriesService.upsertCategories(categoriesDto);
    }
}
