import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, map, Observable, take } from 'rxjs';

import { InsertResult, Repository } from 'typeorm';

import { CategoriesDto } from '../dtos/categories.dto';
import { Category } from '../entities/category.entity';
import { CategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
    private readonly logger: Logger = new Logger(CategoriesService.name, { timestamp: true });

    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    public getCategories(): Observable<CategoriesDto> {
        this.logger.log(`Getting categories from database`);

        return from(this.categoriesRepository.find()).pipe(
            take(1),
            map((categories: CategoryDto[]) => ({ categories }))
        );
    }

    public upsertCategories(categoriesDto: CategoryDto[]): Observable<InsertResult> {
        this.logger.log(`Upserting categories to database`);

        return from(this.categoriesRepository.upsert(categoriesDto, ['type']));
    }
}
