import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionistComponent } from './receptionist.component';

describe('ReceptionistComponent', () => {
  let component: ReceptionistComponent;
  let fixture: ComponentFixture<ReceptionistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
