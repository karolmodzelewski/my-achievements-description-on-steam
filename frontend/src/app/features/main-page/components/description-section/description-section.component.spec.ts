import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DescriptionSectionComponent } from './description-section.component';

describe('DescriptionSectionComponent', () => {
  let component: DescriptionSectionComponent;
  let fixture: ComponentFixture<DescriptionSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DescriptionSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescriptionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });
});
