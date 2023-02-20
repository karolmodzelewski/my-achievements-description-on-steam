import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, Observable } from 'rxjs';

import { InsertResult, Repository } from 'typeorm';

import { AddGameDto } from '../../dtos/add-game.dto';
import { Game } from '../../../../entities/game.entity';

@Injectable()
export class AddGameService {
    private readonly logger: Logger = new Logger(AddGameService.name, { timestamp: true });

    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>
    ) {}

    public upsertGame(addGameDto: AddGameDto): Observable<InsertResult> {
        this.logger.log(`Upserting game ${JSON.stringify(addGameDto)} to database`);

        return from(this.gameRepository.upsert(addGameDto, ['name']));
    }
}
