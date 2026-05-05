import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePaxComponent } from './create-pax.component';

describe('CreatePaxComponent', () => {
  let component: CreatePaxComponent;
  let fixture: ComponentFixture<CreatePaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePaxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
