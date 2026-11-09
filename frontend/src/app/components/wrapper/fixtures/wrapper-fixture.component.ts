import { Component } from '@angular/core';

import { WrapperComponent } from '../wrapper.component';

@Component({
    template: '<mados-wrapper data-testId="wrapperHost">Test</mados-wrapper>',
    imports: [WrapperComponent],
})
export class WrapperFixtureComponent {}
