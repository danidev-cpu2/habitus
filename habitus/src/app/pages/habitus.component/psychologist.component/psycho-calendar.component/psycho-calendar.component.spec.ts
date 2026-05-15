import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsychoCalendarComponent } from './psycho-calendar.component';

describe('PsychoCalendarComponent', () => {
  let component: PsychoCalendarComponent;
  let fixture: ComponentFixture<PsychoCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsychoCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PsychoCalendarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
