import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MainPageComponent } from './main-page.component';
import { MainPageRoutingModule } from './main-page-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { AddCategoriesFormComponent } from './components/add-categories-form/add-categories-form.component';
import { AddGameFormComponent } from './components/add-game-form/add-game-form.component';
import { DescriptionSectionComponent } from './components/description-section/description-section.component';
import { CategoryComponent } from './components/description-section/components/category/category.component';
import { GameComponent } from './components/description-section/components/game/game.component';
import { SectionHeadingComponent } from './components/section-heading/section-heading.component';

@NgModule({
    declarations: [MainPageComponent, HeaderComponent, AddCategoriesFormComponent, AddGameFormComponent, DescriptionSectionComponent, CategoryComponent, GameComponent, SectionHeadingComponent],
    imports: [CommonModule, MainPageRoutingModule, ReactiveFormsModule, MatButtonModule, MatInputModule, ClipboardModule, HttpClientModule, MatIconModule, MatTooltipModule],
})
export class MainPageModule {}
