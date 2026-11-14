import { Controller, Get } from '@nestjs/common';

import { Description } from './interfaces/description.interface';
import { DescriptionService } from './services/description.service';

@Controller('description')
export class DescriptionController {
    constructor(private readonly descriptionService: DescriptionService) {}

    @Get()
    public getDescription(): Promise<Description> {
        return this.descriptionService.getDescription();
    }
}
