import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameController } from './game.controller';
import { Category } from '../../entities/category.entity';
import { Game } from '../../entities/game.entity';
import { GameGroup } from '../../entities/game-group.entity';
import { GameService } from './services/game.service';

@Module({
    imports: [TypeOrmModule.forFeature([Game, GameGroup, Category])],
    controllers: [GameController],
    providers: [GameService],
})
export class GameModule {}
