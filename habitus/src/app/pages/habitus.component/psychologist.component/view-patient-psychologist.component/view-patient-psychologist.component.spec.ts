import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPatientPsychologistComponent } from './view-patient-psychologist.component';

describe('ViewPatientPsychologistComponent', () => {
  let component: ViewPatientPsychologistComponent;
  let fixture: ComponentFixture<ViewPatientPsychologistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPatientPsychologistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPatientPsychologistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
