import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompletedGames } from '../add-game/entities/completed-games.entity';
import { GamesWithNewAchievements } from '../add-game/entities/games-with-new-achievements.entity';
import { Category } from '../categories/entities/category.entity';
import { DescriptionController } from './description.controller';
import { DescriptionService } from './services/description.service';

@Module({
    imports: [TypeOrmModule.forFeature([CompletedGames, GamesWithNewAchievements, Category])],
    controllers: [DescriptionController],
    providers: [DescriptionService],
})
export class DescriptionModule {}
