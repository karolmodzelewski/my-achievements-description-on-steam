import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, Observable } from 'rxjs';

import { InsertResult, Repository } from 'typeorm';

import { CategoriesDto } from '../dtos/categories.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
    private readonly logger: Logger = new Logger(CategoriesService.name, { timestamp: true });

    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    public getCategories(): Observable<Category[]> {
        this.logger.log(`Getting categories from database`);

        return from(this.categoriesRepository.find());
    }

    public upsertCategories(categoriesDto: CategoriesDto): Observable<InsertResult> {
        this.logger.log(`Upserting categories to database`);

        return from(this.categoriesRepository.upsert(categoriesDto.categories, ['type']));
    }
}
