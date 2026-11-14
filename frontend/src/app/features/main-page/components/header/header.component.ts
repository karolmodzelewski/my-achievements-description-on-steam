import { Component } from '@angular/core';

import { LanguageSwitcherComponent } from '../../../../components/language-switcher/language-switcher.component';

@Component({
    selector: 'mados-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [LanguageSwitcherComponent],
})
export class HeaderComponent {}
