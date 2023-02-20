import { Body, Controller, Delete, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';

import { Observable } from 'rxjs';

import { DeleteResult, InsertResult } from 'typeorm';

import { GameService } from './services/game.service';
import { GameDto } from './dtos/game.dto';
import { DeleteGameDto } from './dtos/delete-game.dto';

@Controller('game')
export class GameController {
    private readonly logger: Logger = new Logger(GameController.name, { timestamp: true });

    constructor(private gameService: GameService) {}

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    public upsertGame(@Body() gameDto: GameDto): Observable<InsertResult> {
        this.logger.log(`POST Request: Upsert '${JSON.stringify(gameDto)}' game`);

        return this.gameService.upsertGame(gameDto);
    }

    @Delete()
    public deleteGame(@Body() deleteGameDto: DeleteGameDto): Observable<DeleteResult> {
        this.logger.log(`DELETE Request: Delete '${JSON.stringify(deleteGameDto)}' game`);

        return this.gameService.deleteGame(deleteGameDto);
    }
}
