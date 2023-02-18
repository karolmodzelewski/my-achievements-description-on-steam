import { Controller, Get, Logger } from '@nestjs/common';

import { Observable } from 'rxjs';

import { Description } from './interfaces/description.interface';
import { DescriptionService } from './services/description.service';

@Controller('description')
export class DescriptionController {
    private readonly logger: Logger = new Logger(DescriptionController.name, { timestamp: true });

    constructor(private descriptionService: DescriptionService) {}

    @Get()
    public getDescription(): Observable<Description> {
        this.logger.log(`GET Request: Description`);

        return this.descriptionService.getDescription();
    }
}
