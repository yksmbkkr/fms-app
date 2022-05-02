import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validator, Validators} from "@angular/forms";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'
import {AuthService} from "../../services/auth.service";
import {WindowService} from "../../services/window.service";
import {Router} from "@angular/router";
import {PageRoutes} from "../../constants/page-routes.constant";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OtpInputDialogComponent} from "../shared/otp-input-dialog/otp-input-dialog.component";
import {OtpDialogData} from "../shared/models/otp-dialog-data.model";
import {CustomToastService} from "../../services/custom-toast.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit {

  phoneNumberForm! :FormGroup;
  recaptchaVerifier = 'recaptchaVerifier';
  isRecaptchaInvalid = false;
  isOTPSent = false;
  recaptchaWidgetId!: any;
  recaptchaToken!: any;
  authConfirmationResult!: firebase.auth.ConfirmationResult;
  windowRef!: any;
  dialogRef!: MatDialogRef<OtpInputDialogComponent>;
  apiFlags = {
    sendingOtp: false,
    verigyingOtp: false
  }

  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private windowService: WindowService,
    private router: Router,
    private dialogService: MatDialog,
    private toastService: CustomToastService
  ) { }

  ngAfterViewInit(): void {
        this.setUpPhoneAuth();
    }

  ngOnInit(): void {
    this.windowRef = this.windowService.windowRef;
    this.phoneNumberForm = this.fb.group({
      phoneNumberField: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]]
    })
  }

  get phoneNumber() {
    return this.phoneNumberForm.get('phoneNumberField')?.value;
  }

  get phoneNumberField() {
    return this.phoneNumberForm.get('phoneNumberField')
  }

  setUpPhoneAuth() {
    this.recaptchaToken = '';
    // this.isRecaptchaInvalid = true;
    if(this.windowRef?.recaptchaVerifier) {
      return;
    }
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(this.recaptchaContainer.nativeElement, {
      size: 'invisible',
      callback: (response: any) => {
        this.recaptchaToken = response;
        // this.isRecaptchaInvalid = false;
      },
      'expired-callback': (response: any) => {
        this.recaptchaToken = '';
        // this.isRecaptchaInvalid = true;
      }
    });
    this.windowRef.recaptchaVerifier.render().then((resp: any) => {
      this.recaptchaWidgetId = resp;
    });
  }

  onSendOtp() {
    this.apiFlags.sendingOtp = true;
    this.windowRef.recaptchaVerifier.verify().then((response: any) => {
      this.recaptchaToken = response;
      this.afAuth.signInWithPhoneNumber(`+91${this.phoneNumber}`, this.windowRef.recaptchaVerifier).then(r => {
        if (r.verificationId) {
          this.windowRef.confirmationResult = r;
          this.authConfirmationResult = r;
          this.isOTPSent = true;
          if (!this.dialogRef) {
            this.openOtpDialog();
          }
        }
        console.log(r);
        this.apiFlags.sendingOtp = false;
      })
    })
  }

  processAuthResult(authResult: firebase.auth.UserCredential) {
    console.log(authResult);
    this.authService.getProfileData().subscribe({
      next: (resp: any) => {
        let profileData = resp?.data;
        this.authService.profileData = resp.data;
        if (authResult.additionalUserInfo?.isNewUser || profileData?.isNewUser) {
          this.router.navigate([PageRoutes.profile]);
          return;
        }
        this.router.navigate(['/'])
      }
    })
  }

  openOtpDialog() {
    let dialogData: OtpDialogData = {
      otpLength: 6,
      timerSeconds: 120,
      enableResendOtp: true,
      description: 'Sent OTP to +91'+this.phoneNumber,
      onResendOtp: this.onSendOtp.bind(this),
      editButton: true
    }
    const otpDialogRef = this.dialogService.open(OtpInputDialogComponent, {
      data: dialogData,
      width: '400px',
      maxHeight: '600px',
      disableClose: true,
      hasBackdrop: true,
      backdropClass: 'dark-backdrop'
    })

    otpDialogRef.afterClosed().subscribe((result: any) => {
      if (result?.event === 'submit') {
        console.log(result?.otp);
        this.submitOtp(result?.otp);
      }
    })
  }

  submitOtp(otp: string) {
    this.authConfirmationResult.confirm(otp).then(authResult => {
      this.processAuthResult(authResult)
    }).catch((err) => {
      console.log(err);
      this.toastService.simpleToastMessage('Invalid OTP !')
    })
  }

}
