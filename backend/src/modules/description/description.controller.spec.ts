import { Test } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DescriptionController } from './description.controller';
import { DescriptionService } from './services/description.service';
import { Category } from '../../entities/category.entity';
import { Game } from '../../entities/game.entity';
import { buildDescription, buildDescriptionSection } from '../../testing/builders/description.builders';
import { createEntityManager, provideRepository } from '../../testing/helpers/repository.helpers';

describe('DescriptionController', () => {
    let controller: DescriptionController;
    let descriptionService: DescriptionService;

    const description = buildDescription({ completed: buildDescriptionSection({ amount: 1, gamesAmount: 1 }) });

    beforeEach(async () => {
        const manager = createEntityManager();
        const module = await Test.createTestingModule({
            controllers: [DescriptionController],
            providers: [DescriptionService, provideRepository(Game, manager), provideRepository(Category, manager)],
        }).compile();

        descriptionService = module.get(DescriptionService);

        vi.spyOn(descriptionService, 'getDescription').mockResolvedValue(description);

        controller = module.get(DescriptionController);
    });

    it('should create a controller', () => {
        // Assert
        expect(controller).toBeTruthy();
    });

    it('should return the description', async () => {
        // Act
        const result = await controller.getDescription();

        // Assert
        expect(result).toBe(description);
        expect(descriptionService.getDescription).toHaveBeenCalledOnce();
    });
});
