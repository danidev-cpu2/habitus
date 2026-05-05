import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferPaxComponent } from './transfer-pax.component';

describe('TransferPaxComponent', () => {
  let component: TransferPaxComponent;
  let fixture: ComponentFixture<TransferPaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferPaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferPaxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
