import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, map, Observable } from 'rxjs';

import { Repository } from 'typeorm';

import { Category } from '../../../entities/category.entity';
import { CategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name, { timestamp: true });

    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    public getCategories(): Observable<Category[]> {
        this.logger.log(`Getting categories from database`);

        return from(this.categoriesRepository.find());
    }

    public upsertCategories(categoriesDto: CategoryDto[]): Observable<void> {
        this.logger.log(`Upserting categories to database`);

        return from(this.categoriesRepository.upsert(categoriesDto, ['type'])).pipe(map(() => undefined));
    }
}
