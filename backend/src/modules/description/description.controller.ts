import { Controller, Get } from '@nestjs/common';

import { Observable } from 'rxjs';

import { Description } from './interfaces/description.interface';
import { DescriptionService } from './services/description.service';

@Controller('description')
export class DescriptionController {
    constructor(private readonly descriptionService: DescriptionService) {}

    @Get()
    public getDescription(): Observable<Description> {
        return this.descriptionService.getDescription();
    }
}
