import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game } from '../../entities/game.entity';
import { Category } from '../../entities/category.entity';
import { DescriptionController } from './description.controller';
import { DescriptionService } from './services/description.service';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Game])],
    controllers: [DescriptionController],
    providers: [DescriptionService],
})
export class DescriptionModule {}
