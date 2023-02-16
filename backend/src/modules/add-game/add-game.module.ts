import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../categories/entities/category.entity';
import { AddGameController } from './add-game.controller';
import { CompletedGames } from './entities/completed-games.entity';
import { GamesWithNewAchievements } from './entities/games-with-new-achievements.entity';
import { AddGameService } from './services/add-game/add-game.service';

@Module({
    imports: [TypeOrmModule.forFeature([CompletedGames, GamesWithNewAchievements, Category])],
    controllers: [AddGameController],
    providers: [AddGameService],
})
export class AddGameModule {}
