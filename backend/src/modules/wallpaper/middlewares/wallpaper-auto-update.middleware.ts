import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';

import type { NextFunction, Request, Response } from 'express';

import { ErrorCode } from '../../../enums/error-code.enum';
import { isRejectedRequestStatus, isServerErrorStatus } from '../../../utils/http-status.util';
import { WallpaperService } from '../services/wallpaper.service';

// Every successful change of games, groups or categories may change the numbers on the wallpaper
@Injectable()
export class WallpaperAutoUpdateMiddleware implements NestMiddleware {
    constructor(private readonly wallpaperService: WallpaperService) {}

    public use(request: Request, response: Response, next: NextFunction): void {
        if (request.method === 'GET') {
            next();

            return;
        }

        if (this.wallpaperService.isGenerating()) {
            throw new ConflictException({ message: 'The wallpaper is being generated, try again once it is done', errorCode: ErrorCode.WALLPAPER_GENERATING, statusCode: HttpStatus.CONFLICT });
        }

        response.on('finish', () => {
            if (isRejectedRequestStatus(response.statusCode) || isServerErrorStatus(response.statusCode)) {
                return;
            }

            this.wallpaperService.scheduleAutoUpdate();
        });

        next();
    }
}
