import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {CustomApiService} from "../../services/custom-api.service";
import {CustomToastService} from "../../services/custom-toast.service";
import {Router} from "@angular/router";
import {ApiEndpoints} from "../../constants/api-endpoints.constant";
import {OtpDialogData} from "../shared/models/otp-dialog-data.model";
import {OtpInputDialogComponent} from "../shared/otp-input-dialog/otp-input-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {

  profileDataForm!: FormGroup;
  showValidateEmailModal!: boolean;
  profileData!: any;
  apiCallFlag = {
    savingProfile: false,
    sendingOtp: false,
    verifyingOtp: false
  }
  otpSent = false;
  isOtpVerified = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: CustomApiService,
    private toastService: CustomToastService,
    private router: Router,
    private dialogService: MatDialog
  ) { }

  ngOnInit(): void {
    this.profileData = this.authService.profileData;
    this.authService.userChangeEvent$.subscribe((resp) => {
      this.profileData = this.authService.profileData;
    })
    this.profileDataForm = this.fb.group({
      firstName: new FormControl(this.profileData?.firstName || '', Validators.required),
      lastName: new FormControl(this.profileData?.lastName || '', Validators.required),
      email: new FormControl(this.profileData?.email || '', [Validators.required, Validators.email])
    });
    this.showValidateEmailModal = false;
  }

  ngAfterViewInit() {
    if (!this.profileData?.isEmailVerified && !this.emailControl?.invalid) {
      this.initEmailVerification();
    }
  }

  getFormField(fieldName: string): AbstractControl | null {
    return this.profileDataForm.get(fieldName);
  }

  get firstNameControl() {
    return this.getFormField('firstName');
  }

  get lastNameControl() {
    return this.getFormField('lastName');
  }

  get emailControl() {
    return this.getFormField('email');
  }

  submitProfileData(e: Event) {
    console.log(e);
    if (this.profileDataForm?.invalid) {
      return;
    }

    this.apiCallFlag.savingProfile = true;
    this.submitProfileDataCall().subscribe((resp: any) => {
      this.apiCallFlag.savingProfile = false;
      if (!resp.success) {
        this.toastService.simpleToastMessage(
          "Unable to save profile, something went wrong !",
          2000
        )
        return;
      }
      this.toastService.simpleToastMessage(
        "Profile updated !",
        1500
      )
      resp.data['isEmailVerified'] = this.emailControl?.value === this.profileData.email && this.profileData.isEmailVerified;
      resp.data['isNewUser'] = false;
      this.authService.profileData = resp;
      this.profileData = resp.data;
      if (!resp.data['isEmailVerified']) {
        this.initEmailVerification();
      }
    })
  }

  submitProfileDataCall() {
    return this.apiService.postRequest(
      ApiEndpoints.saveProfileData,
      {firstName: this.firstNameControl?.value,
        lastName: this.lastNameControl?.value,
        email: this.emailControl?.value}
    )
  }

  initEmailVerification() {
    this.onSendOtp();
    let dialogData: OtpDialogData = {
      otpLength: 6,
      timerSeconds: 180,
      enableResendOtp: true,
      description: 'Sent OTP to '+this.emailControl?.value + ' for email verification !',
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
        this.verifyOtp(result?.otp);
      }
    })
  }

  onSendOtp() {
    this.apiService.getRequest(
      ApiEndpoints.triggerEmailVerificationOtp
    ).subscribe((resp: any) => {
      this.apiCallFlag.sendingOtp = false;
      this.otpSent = !!resp.success;
      this.toastService.simpleToastMessage(
        "OTP Sent !",
        1500
      )
    })
  }

  verifyOtpCall(otp: string) {
    return this.apiService.postRequest(
      ApiEndpoints.triggerEmailVerificationOtp,
      {otp: otp}
    )
  }

  verifyOtp(otp:string) {
    this.apiCallFlag.verifyingOtp = true;
    this.verifyOtpCall(otp).subscribe((resp: any) => {
      this.apiCallFlag.verifyingOtp = false;
      this.isOtpVerified = resp.success;
      if(this.isOtpVerified) {
        this.toastService.simpleToastMessage(
          'Email verification successful !',
          1500
        );
        let pData = this.authService.profileData;
        pData['isEmailVerified'] = true;
        this.authService.profileData = pData;
      } else {
        // TODO: Handle Invalid Otp
        this.toastService.simpleToastMessage(
          resp.error?.msg ?? 'Invalid OTP !',
          2000
        )
        console.log(resp)
      }
    })
  }

}
