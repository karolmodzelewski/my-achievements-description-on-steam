import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, Observable } from 'rxjs';

import { DeleteResult, InsertResult, Repository } from 'typeorm';

import { GameDto } from '../dtos/game.dto';
import { Game } from '../../../entities/game.entity';
import { DeleteGameDto } from '../dtos/delete-game.dto';

@Injectable()
export class GameService {
    private readonly logger: Logger = new Logger(GameService.name, { timestamp: true });

    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>
    ) {}

    public upsertGame(gameDto: GameDto): Observable<InsertResult> {
        this.logger.log(`Upserting game ${JSON.stringify(gameDto)} to database`);

        return from(this.gameRepository.upsert(gameDto, ['name']));
    }

    public deleteGame(deleteGameDto: DeleteGameDto): Observable<DeleteResult> {
        this.logger.log(`Deleting game ${JSON.stringify(deleteGameDto)}`);

        return from(this.gameRepository.delete({ name: deleteGameDto.name }));
    }
}
