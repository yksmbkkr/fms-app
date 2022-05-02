import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OtpDialogData} from "../models/otp-dialog-data.model";
import {FormControl, Validators} from "@angular/forms";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-otp-input-dialog',
  templateUrl: './otp-input-dialog.component.html',
  styleUrls: ['./otp-input-dialog.component.scss']
})
export class OtpInputDialogComponent implements OnInit, AfterViewInit {

  otpField!: FormControl;
  @ViewChild('otpInput') otpInput!: MatInput;
  countDownTimer!: any;
  secondsRemaining!: number;

  constructor(
    public dialogRef: MatDialogRef<OtpInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: OtpDialogData
  ) { }

  ngOnInit(): void {
    this.otpField = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
    this.secondsRemaining = this.dialogData.timerSeconds;
  }

  get otp() {
    return this.otpField.value;
  }

  ngAfterViewInit(): void {
    this.initCountDown();
  }

  closeDialog(isSubmit: boolean) {
    if (!isSubmit) {
      this.dialogRef.close({
        event: 'edit'
      })
    } else {
      this.dialogRef.close({
        event: 'submit',
        otp: this.otp
      })
    }
  }

  initCountDown() {
    this.secondsRemaining = this.dialogData.timerSeconds;
    this.otpField.reset();
    this.countDownTimer = setInterval(() => {
      if (this.secondsRemaining > 0) {
        this.secondsRemaining--;
      } else {
        this.clearCountdown();
      }
    }, 1000)
  }

  clearCountdown() {
    clearInterval(this.countDownTimer);
  }

  resendOtp() {
    if (this.dialogData.enableResendOtp) {
      this.initCountDown();
      this.dialogData.onResendOtp();
    }
  }
}
