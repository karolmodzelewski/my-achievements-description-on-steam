import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';

import { Observable } from 'rxjs';

import { InsertResult } from 'typeorm';

import { AddGameService } from './services/add-game/add-game.service';
import { AddGameDto } from './dtos/add-game.dto';

@Controller('add-game')
export class AddGameController {
    private readonly logger: Logger = new Logger(AddGameController.name, { timestamp: true });

    constructor(private addGameService: AddGameService) {}

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    public upsertGame(@Body() addGameDto: AddGameDto): Observable<InsertResult> {
        this.logger.log(`POST Request: Upsert '${JSON.stringify(addGameDto)}' game`);

        return this.addGameService.upsertGame(addGameDto);
    }
}
