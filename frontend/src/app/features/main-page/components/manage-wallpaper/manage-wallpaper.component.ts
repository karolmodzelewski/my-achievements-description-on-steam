import { Component, input } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { WallpaperFormComponent } from './components/wallpaper-form/wallpaper-form.component';
import type { Category } from '../../../../interfaces/category.interface';
import { ExpandableSectionComponent } from '../expandable-section/expandable-section.component';

@Component({
    selector: 'mados-manage-wallpaper',
    templateUrl: './manage-wallpaper.component.html',
    imports: [ExpandableSectionComponent, WallpaperFormComponent, TranslocoPipe],
})
export class ManageWallpaperComponent {
    public readonly mainCategories = input.required<Category[]>();
    public readonly lengthCategories = input.required<Category[]>();
    public readonly difficultyCategories = input.required<Category[]>();

    public readonly headingId = 'manageWallpaperHeading';
    public readonly wallpaperFormId = 'manageWallpaperForm';
}
