import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitusComponent } from './habitus.component';

describe('HabitusComponent', () => {
  let component: HabitusComponent;
  let fixture: ComponentFixture<HabitusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitusComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
