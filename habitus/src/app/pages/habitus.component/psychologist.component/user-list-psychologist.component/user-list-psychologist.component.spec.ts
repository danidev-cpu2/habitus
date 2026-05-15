import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListPsychologistComponent } from './user-list-psychologist.component';

describe('UserListPsychologistComponent', () => {
  let component: UserListPsychologistComponent;
  let fixture: ComponentFixture<UserListPsychologistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListPsychologistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserListPsychologistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
