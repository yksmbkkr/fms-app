export interface OtpDialogData {
  otpLength: number;
  timerSeconds: number;
  enableResendOtp: boolean;
  description: string;
  onResendOtp: any;
  editButton: boolean;
}
