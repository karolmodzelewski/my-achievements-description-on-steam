import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GameController } from './game.controller';
import { Game } from '../../entities/game.entity';
import { GameService } from './services/game.service';

@Module({
    imports: [TypeOrmModule.forFeature([Game])],
    controllers: [GameController],
    providers: [GameService],
})
export class GameModule {}
