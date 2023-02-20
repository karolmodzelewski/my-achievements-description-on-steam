import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddGameController } from './add-game.controller';
import { Game } from '../../entities/game.entity';
import { AddGameService } from './services/add-game/add-game.service';

@Module({
    imports: [TypeOrmModule.forFeature([Game])],
    controllers: [AddGameController],
    providers: [AddGameService],
})
export class AddGameModule {}
