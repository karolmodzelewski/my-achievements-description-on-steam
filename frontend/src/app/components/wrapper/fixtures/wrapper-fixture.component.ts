import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WrapperComponent } from '../wrapper.component';

@Component({
    template: '<mados-wrapper>Test</mados-wrapper>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [WrapperComponent],
})
export class WrapperFixtureComponent {}
