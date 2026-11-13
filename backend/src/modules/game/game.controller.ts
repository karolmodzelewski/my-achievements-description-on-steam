import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { Observable } from 'rxjs';

import { GameService } from './services/game.service';
import { GameDto } from './dtos/game.dto';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    public createGame(@Body() gameDto: GameDto): Observable<void> {
        return this.gameService.createGame(gameDto);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public updateGame(@Param('id', ParseIntPipe) id: number, @Body() gameDto: GameDto): Observable<void> {
        return this.gameService.updateGame(id, gameDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteGame(@Param('id', ParseIntPipe) id: number): Observable<void> {
        return this.gameService.deleteGame(id);
    }

    @Delete(':id/group/:groupId')
    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteGroup(@Param('id', ParseIntPipe) id: number, @Param('groupId', ParseIntPipe) groupId: number): Observable<void> {
        return this.gameService.deleteGroup(id, groupId);
    }
}
