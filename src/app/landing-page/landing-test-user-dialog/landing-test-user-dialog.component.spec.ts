import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingTestUserDialogComponent } from './landing-test-user-dialog.component';

describe('LandingTestUserDialogComponent', () => {
  let component: LandingTestUserDialogComponent;
  let fixture: ComponentFixture<LandingTestUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingTestUserDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingTestUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
