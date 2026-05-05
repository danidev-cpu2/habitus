import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexRecepComponent } from './index-recep.component';

describe('IndexRecepComponent', () => {
  let component: IndexRecepComponent;
  let fixture: ComponentFixture<IndexRecepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexRecepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexRecepComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
