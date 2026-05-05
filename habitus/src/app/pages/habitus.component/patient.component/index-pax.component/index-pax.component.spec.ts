import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexPaxComponent } from './index-pax.component';

describe('IndexPaxComponent', () => {
  let component: IndexPaxComponent;
  let fixture: ComponentFixture<IndexPaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexPaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexPaxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
