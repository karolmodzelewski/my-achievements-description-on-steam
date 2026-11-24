import { ConflictException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WallpaperAutoUpdateMiddleware } from './wallpaper-auto-update.middleware';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { Wallpaper } from '../../../entities/wallpaper.entity';
import { ErrorCode } from '../../../enums/error-code.enum';
import { stubEnvironment } from '../../../testing/helpers/environment.helpers';
import { createEntityManager, provideRepository } from '../../../testing/helpers/repository.helpers';
import { DescriptionService } from '../../description/services/description.service';
import { WallpaperService } from '../services/wallpaper.service';

import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

describe('WallpaperAutoUpdateMiddleware', () => {
    let middleware: WallpaperAutoUpdateMiddleware;
    let wallpaperService: WallpaperService;
    let request: Request;
    let response: Response;
    let next: Mock<() => void>;

    beforeEach(async () => {
        stubEnvironment();

        const manager = createEntityManager();
        const module = await Test.createTestingModule({
            providers: [
                WallpaperAutoUpdateMiddleware,
                WallpaperService,
                DescriptionService,
                ConfigService,
                provideRepository(Wallpaper, manager),
                provideRepository(Category, manager),
                provideRepository(Game, manager),
            ],
        }).compile();

        wallpaperService = module.get(WallpaperService);

        vi.spyOn(wallpaperService, 'isGenerating').mockReturnValue(false);
        vi.spyOn(wallpaperService, 'scheduleAutoUpdate').mockImplementation(() => undefined);

        middleware = module.get(WallpaperAutoUpdateMiddleware);
        request = Object.assign(new IncomingMessage(new Socket()), { method: 'POST', originalUrl: '/api/game' }) as Request;
        response = new ServerResponse(request) as Response;
        next = vi.fn();
    });

    it('should pass a reading request on without scheduling the update', () => {
        // Arrange
        request.method = 'GET';

        // Act
        middleware.use(request, response, next);
        response.emit('finish');

        // Assert
        expect(next).toHaveBeenCalledOnce();
        expect(wallpaperService.scheduleAutoUpdate).not.toHaveBeenCalled();
    });

    it('should pass a reading request on while the wallpaper is generated', () => {
        // Arrange
        request.method = 'GET';
        vi.mocked(wallpaperService.isGenerating).mockReturnValue(true);

        // Act
        middleware.use(request, response, next);

        // Assert
        expect(next).toHaveBeenCalledOnce();
    });

    it('should reject a change while the wallpaper is generated', () => {
        // Arrange
        vi.mocked(wallpaperService.isGenerating).mockReturnValue(true);

        // Act
        const use = (): void => middleware.use(request, response, next);

        // Assert
        expect(use).toThrow(ConflictException);
        expect(use).toThrow(
            expect.objectContaining({
                response: { message: 'The wallpaper is being generated, try again once it is done', errorCode: ErrorCode.WALLPAPER_GENERATING, statusCode: HttpStatus.CONFLICT },
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('should pass a change on without scheduling the update until it is finished', () => {
        // Act
        middleware.use(request, response, next);

        // Assert
        expect(next).toHaveBeenCalledOnce();
        expect(wallpaperService.scheduleAutoUpdate).not.toHaveBeenCalled();
    });

    it('should schedule the update once the change succeeds', () => {
        // Arrange
        response.statusCode = HttpStatus.CREATED;

        // Act
        middleware.use(request, response, next);
        response.emit('finish');

        // Assert
        expect(wallpaperService.scheduleAutoUpdate).toHaveBeenCalledOnce();
    });

    it.each([
        { reason: 'rejected', statusCode: HttpStatus.BAD_REQUEST },
        { reason: 'failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR },
    ])('should not schedule the update after a $reason change', ({ statusCode }) => {
        // Arrange
        response.statusCode = statusCode;

        // Act
        middleware.use(request, response, next);
        response.emit('finish');

        // Assert
        expect(wallpaperService.scheduleAutoUpdate).not.toHaveBeenCalled();
    });
});
