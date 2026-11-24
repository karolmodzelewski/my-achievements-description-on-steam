import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { GameService } from './services/game.service';
import { GameDto } from './dtos/game.dto';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    public createGame(@Body() gameDto: GameDto): Promise<void> {
        return this.gameService.createGame(gameDto);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public updateGame(@Param('id', ParseIntPipe) id: number, @Body() gameDto: GameDto): Promise<void> {
        return this.gameService.updateGame(id, gameDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteGame(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.gameService.deleteGame(id);
    }

    @Delete(':id/group/:groupId')
    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteGroup(@Param('id', ParseIntPipe) id: number, @Param('groupId', ParseIntPipe) groupId: number): Promise<void> {
        return this.gameService.deleteGroup(id, groupId);
    }
}
