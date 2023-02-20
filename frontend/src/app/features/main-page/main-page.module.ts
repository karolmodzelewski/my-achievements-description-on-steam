import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MainPageComponent } from './main-page.component';
import { MainPageRoutingModule } from './main-page-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { AddCategoriesFormComponent } from './components/add-categories-form/add-categories-form.component';
import { AddGameFormComponent } from './components/add-game-form/add-game-form.component';
import { DescriptionSectionComponent } from './components/description-section/description-section.component';
import { CategoryComponent } from './components/description-section/components/category/category.component';
import { GameComponent } from './components/description-section/components/game/game.component';
import { SectionHeadingComponent } from './components/section-heading/section-heading.component';
import { CategoryTypeTranslationComponent } from './components/category-type-translation/category-type-translation.component';
import { ErrorStateComponent } from '../../components/error-state/error-state.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { CategoryTypeTranslationHeadingComponent } from './components/category-type-translation/components/category-type-translation-heading/category-type-translation-heading.component';
import { ExpansionButtonTextComponent } from './components/add-categories-form/components/expansion-button-text/expansion-button-text.component';
import { EditGameService } from './services/edit-game.service';
import { SnackbarComponent } from '../../components/snackbar/snackbar.component';
import { SnackbarService } from './../../components/snackbar/snackbar.service';
import { InfobarComponent } from '../../components/infobar/infobar.component';

@NgModule({
    declarations: [
        MainPageComponent,
        HeaderComponent,
        AddCategoriesFormComponent,
        AddGameFormComponent,
        DescriptionSectionComponent,
        CategoryComponent,
        GameComponent,
        SectionHeadingComponent,
        CategoryTypeTranslationComponent,
        CategoryTypeTranslationHeadingComponent,
        ExpansionButtonTextComponent,
    ],
    imports: [
        CommonModule,
        MainPageRoutingModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        ClipboardModule,
        HttpClientModule,
        MatIconModule,
        MatTooltipModule,
        ErrorStateComponent,
        LoadingStateComponent,
        MatSelectModule,
        MatCheckboxModule,
        MatSnackBarModule,
        SnackbarComponent,
        InfobarComponent,
    ],
    providers: [EditGameService, SnackbarService],
})
export class MainPageModule {}
