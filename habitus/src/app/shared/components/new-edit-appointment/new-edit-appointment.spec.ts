import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEditAppointment } from './new-edit-appointment';

describe('NewEditAppointment', () => {
  let component: NewEditAppointment;
  let fixture: ComponentFixture<NewEditAppointment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEditAppointment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewEditAppointment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
