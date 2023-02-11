import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class EditGameService {
    public editingGameName$: BehaviorSubject<string> = new BehaviorSubject<string>('');
}
