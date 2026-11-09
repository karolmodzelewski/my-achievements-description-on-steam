import { Body, Controller, Delete, HttpCode, HttpStatus, Logger, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { Observable } from 'rxjs';

import { GameService } from './services/game.service';
import { GameDto } from './dtos/game.dto';

@Controller('game')
export class GameController {
    private readonly logger = new Logger(GameController.name, { timestamp: true });

    constructor(private readonly gameService: GameService) {}

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    public createGame(@Body() gameDto: GameDto): Observable<void> {
        this.logger.log(`POST Request: Create '${JSON.stringify(gameDto)}' game`);

        return this.gameService.createGame(gameDto);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public updateGame(@Param('id', ParseIntPipe) id: number, @Body() gameDto: GameDto): Observable<void> {
        this.logger.log(`PUT Request: Update game with id '${id}' to '${JSON.stringify(gameDto)}'`);

        return this.gameService.updateGame(id, gameDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteGame(@Param('id', ParseIntPipe) id: number): Observable<void> {
        this.logger.log(`DELETE Request: Delete game with id '${id}'`);

        return this.gameService.deleteGame(id);
    }

    @Delete(':id/group/:groupId')
    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteGroup(@Param('id', ParseIntPipe) id: number, @Param('groupId', ParseIntPipe) groupId: number): Observable<void> {
        this.logger.log(`DELETE Request: Delete group with id '${groupId}' of game with id '${id}'`);

        return this.gameService.deleteGroup(id, groupId);
    }
}
