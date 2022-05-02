import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpInputDialogComponent } from './otp-input-dialog.component';

describe('OtpInputDialogComponent', () => {
  let component: OtpInputDialogComponent;
  let fixture: ComponentFixture<OtpInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpInputDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
