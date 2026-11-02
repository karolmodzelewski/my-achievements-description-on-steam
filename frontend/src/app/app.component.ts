import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { WrapperComponent } from './components/wrapper/wrapper.component';

@Component({
    selector: 'mados-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WrapperComponent, RouterOutlet],
})
export class AppComponent {}
