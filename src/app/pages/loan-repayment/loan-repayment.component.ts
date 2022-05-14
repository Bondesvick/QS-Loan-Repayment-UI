import { async } from '@angular/core/testing';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { InterswitchService } from 'src/app/core/services/interswitch.service';
import { AccountSegment } from 'src/app/core/models/payloads/acct-segment';
import { LoanRepaymentService } from 'src/app/core/services/loan-repayment.service';
import { UtilityService } from 'src/app/core/services/utils.service';
import { CustomerDetails } from 'src/app/core/models/payloads/customer-details';
import { CustomerLoanDetails } from 'src/app/core/models/payloads/customer-acct-details';
import { UtilService } from 'src/app/core/services/helpers.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-loan-repayment',
  templateUrl: './loan-repayment.component.html',
  styleUrls: ['./loan-repayment.component.css', '../../app.component.css']
})
export class LoanRepaymentComponent implements OnInit {
  repaymentPlans = ['Full Repayment', 'Partial Repayment'];
  accountFormGroup: FormGroup;
  repaymentPlanForm: FormGroup;
  authenticationFormGroup: FormGroup;
  uploadSignatureForm: FormGroup;
  ticketID: string;
  public termsAndConditionModalRef: MatDialogRef<any>;
  @ViewChild('termsAndConditionModalTemplate', { static: true }) termsAndConditionModalTemplate: TemplateRef<any>;
  public iframeModalRef: MatDialogRef<any>;
  @ViewChild('iFrameModalTemplate', { static: true }) iFrameModalTemplate: TemplateRef<any>;
  isIAgreeChecked: boolean;
  cardOptions: string[] = ['Yes', 'No'];
  showSpinner = false;
  isAuthenticationFormDone = false;
  class = '';
  color = 'primary';
  mode = 'query';
  value = 50;
  bufferValue = 75;
  showUploadSignatureForm: boolean;
  hideIframe: boolean;
  isRadioButtonDisabled: boolean;
  debitCardAuthModalSub: any;
  signatureFile = '';
  signatureFileExt: string;
  signatureFileError: string;
  signatureBase64: string;
  detailFormSpinner: boolean;
  otpReference: any;
  accountSegmentEnum = AccountSegment;
  acctSegment = '';
  confirmBVNDateOfBirthForm: FormGroup;
  otpForm: FormGroup;
  repaymentDetailsForm: FormGroup;
  disableOTPForm: boolean;
  CIF: any;
  isAccountStepperActive: boolean;
  isAuthenticationFormActive: boolean;
  isAccountStepperDone: boolean;
  accountName: any;
  accountSegment: any;
  customerAcctDetails: CustomerLoanDetails[] = [];
  loanAccountsDetails: any[];
  repaymentAccountDetails: CustomerLoanDetails[];
  maskedLoanAccts: string[] = [];
  amountLoaned = '0.00';
  amountToBeRepaid = '0.00';
  loanAcctSelected: any;
  repaymentAcctSelected: any;
  isDetailFormActive: boolean;
  isDetailFormDone: boolean;
  isVerifyFormActive: boolean;
  insufficientFund: any;
  amount = new FormControl('', [Validators.required]);
  totalAmountOnView: number;
  isVerifyFormDone = false;
  isRepayLoanFormActive = false;
  isRepayLoanFormDone = false;
  showNoActiveLoanAccounts: boolean;
  isAwaitingResponse: boolean;

  giveDebitConsent: boolean = false;

  constructor(private formBuilder: FormBuilder, private _snackBar: MatSnackBar,
    private interswitchService: InterswitchService, private dialog: MatDialog, private router: Router, private decimalPipe: DecimalPipe,
    private loanRepaymentService: LoanRepaymentService, private utilsService: UtilityService) { }

  ngOnInit() {
    this.accountFormGroup = this.formBuilder.group({
      phoneNoCtrl: ['',[Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
      accountNoCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]]
    });
    this.repaymentPlanForm = this.formBuilder.group({
      repaymentPlanCtrl: ['', Validators.required]
    });
    this.authenticationFormGroup = this.formBuilder.group({
      debitCardOption: ['', Validators.required]
    });
    this.uploadSignatureForm = this.formBuilder.group({
      signatureCtrl: ['', Validators.required]
    });
    this.confirmBVNDateOfBirthForm = this.formBuilder.group({
      bvnNoCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
      dobCtrl: ['', Validators.required]
    })
    this.otpForm = this.formBuilder.group({
      otpControl: ['', Validators.required]
    });
    this.repaymentDetailsForm = this.formBuilder.group({
      loanAcctControl: ['', Validators.required],
      repaymentAcctControl: ['', Validators.required],
      // otpControl: ['', Validators.required]
    });
    this.showTermsAndCondition();
  }

  get debitCardValue() { return this.authenticationFormGroup.controls.debitCardOption.value; }
  get phoneNo() { return this.accountFormGroup.controls.phoneNoCtrl.value; }
  get acctNo() { return this.accountFormGroup.controls.accountNoCtrl.value; }
  get repaymentPlan() { return this.repaymentPlanForm.controls.repaymentPlanCtrl.value; }

  get bvn(){ return this.confirmBVNDateOfBirthForm.controls.bvnNoCtrl.value}
  get dob(){ return this.confirmBVNDateOfBirthForm.controls.dobCtrl.value}

  showTermsAndCondition() {
    this.termsAndConditionModalRef = this.dialog.open(this.termsAndConditionModalTemplate, {
      width: '800px',
      height: '600px',
      disableClose: true
    });

    this.termsAndConditionModalRef.afterClosed().subscribe(result => {
      this.isIAgreeChecked = false;
    });
  }

  amountInputBlur() {

    let amount = 0;

    if (this.amount) {
      amount = this.amount.value as number;
    }


    this.totalAmountOnView = +amount;

    if (amount > Number(this.amountLoaned) && amount > Number(this.amountToBeRepaid)) {
      this.insufficientFund = true;
    } else {
      this.insufficientFund = false;
    }

    if (amount > 0) {
      this.amount.setValue(this.decimalPipe.transform(amount, '1.2-2'));
    }


  }

  amountInputKeyup() {
    let amount = 0.0;

    // Only allow digits on amount alone.
    if (this.amount) {

      let amountEntered = this.amount.value;

      amountEntered = UtilService.getSanitizedAmount(amountEntered);


      this.amount.setValue(amountEntered);
      amount = parseFloat(amountEntered);
    }

    this.totalAmountOnView = +amount;

    if (amount > Number(this.amountLoaned)) {
      this.insufficientFund = true;
    } else {
      this.insufficientFund = false;
    }

  }
  textInputFocus(formControlName: string) {
    if (formControlName === 'amount') {

      this.insufficientFund = false;

      if (this.amount) {

        let amountEntered = this.amount.value;

        if (amountEntered) {
          // remove .00 if exist
          if ((amountEntered as string).indexOf('.00') !== -1) {
            amountEntered = (amountEntered as string).replace('.00', '');
          }

          amountEntered = amountEntered.replace(/,/g, '');
        }

        this.amount.setValue(amountEntered);
      }
    }

  }
  proceedFromAuthentication(stepper: MatStepper) {
    stepper.next();
  }
  goHome() {
    this.router.navigate(['/home']);
    this.dialog.closeAll();
  }

  closeDialogModal() {
    this.dialog.closeAll();
  }

  onSelectLoanAcct(acct) {
    console.log(acct);
    this.amountLoaned = acct.LoanAmountValue;
    this.loanAcctSelected = acct.AccountNumber;
  }

  onSelectRepaymentAcct(acct) {
    console.log(acct);
    this.amountToBeRepaid = acct.AvailableBalance;
    this.repaymentAcctSelected = acct.AccountNumber;
  }
  maskNumber(number: string) {
    if (number) { /** Condition will only executes if accountId is *not* undefined, null, empty, false or 0*/
      const accountIdlength = number.length;
      const maskedLength = accountIdlength - 4; /** Modify the length as per your wish */
      let newString = number;
      for (let i = 0; i < accountIdlength; i++) {
        if (i < maskedLength) {
          newString = newString.replace(number[i], '*');
        }
      }
      return newString;
    } else { return; } /**Will handle if no string is passed */


  }
  fetchLoanRepaymentDetails(cifId: string, stepper: MatStepper) {
    // cifId = '000579060';
    this.showSpinner = true;
    this.loanRepaymentService.loanRepaymentDetails(cifId).subscribe(
      (response) => {
        if (response.Data && response.Data.length > 0) {
          this.showSpinner = false;
          this.customerAcctDetails = response.Data;
          this.loanAccountsDetails = this.customerAcctDetails.filter(item => item.AccountSchemeType === 'LAA');
          if (this.loanAccountsDetails.length > 0) {
            this.repaymentAccountDetails = this.customerAcctDetails.filter(item => item.AccountSchemeType !== 'LAA');
            this.showNoActiveLoanAccounts = false;
            // this.isVerifyFormActive = false;
            // this.isVerifyFormDone = true;
            this.isRepayLoanFormActive = true;
            stepper.next();

          } else {
            this.showSpinner = false;
            this._snackBar.open(`There is no active loan to repay`, 'Ok', {
              verticalPosition: 'top',
              horizontalPosition: 'center',
              duration: 50000,
              panelClass: ['errorSnackbar'],
            });
            this.showNoActiveLoanAccounts = true;
          }
          // this.maskedLoanAccts = this.loanAccountsDetails.map(item => this.maskNumber(item.AccountNumber));
        } else {
          this.showSpinner = false;

          this._snackBar.open(`Request could not be processed at this time`, 'Failed', {
            verticalPosition: 'top',
            horizontalPosition: 'center',
            duration: 50000,
            panelClass: ['errorSnackbar'],
          });
          this.showNoActiveLoanAccounts = true;

        }
      },
      (error) => {
        console.log(error);
        this.showSpinner = false;
        this._snackBar.open(`Techincal error has occured`, 'Failed', {
          verticalPosition: 'top',
          horizontalPosition: 'center',
          duration: 5000,
          panelClass: ['errorSnackbar'],
        });
      }

    );
  }
  validateAccountDetails(stepper: MatStepper) {
    const payload = {
      accountNo: this.acctNo,
      phoneNo: this.phoneNo,
    };
    this.showSpinner = true;
    this.isAwaitingResponse = true;
    this.loanRepaymentService.validateAccountNoAndPhoneNo(payload).subscribe(
      (response) => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        if (response.ResponseCode === '00') {
          this.CIF = response.Data.CustomerId;
          this.accountName = response.Data.FirstName + ' ' + response.Data.Lastname;
          this.isAccountStepperActive = false;
          this.isAccountStepperDone = true;
          this.isAuthenticationFormActive = true;
          this.accountSegment =
            response.Data.AccountSegment === '-999-'
              ? 'Failed to Load account'
              : response.Data.AccountSegment;
          this._snackBar.open(
            `Account has been validated successfully for ${this.accountName}`,
            'Ok',
            {
              verticalPosition: 'top',
              horizontalPosition: 'center',
              duration: 5000,
              panelClass: ['errorSnackbar'],
            }
          );
          if (this.accountSegment === 'Failed to Load account') {
            this._snackBar.open(
              `Failed to load account segment `,
              'Failed',
              {
                verticalPosition: 'top',
                horizontalPosition: 'center',
                duration: 5000,
                panelClass: ['errorSnackbar'],
              }
            );
          } else {
            this.isDetailFormActive = true;
            stepper.next();
          }
        } else {
          this._snackBar.open(response.ResponseDescription, 'Failed', {
            verticalPosition: 'top',
            horizontalPosition: 'center',
            duration: 5000,
            panelClass: ['errorSnackbar'],
          });
        }
      },
      (error) => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        this._snackBar.open(`Techincal error has occured`, 'Failed', {
          verticalPosition: 'top',
          horizontalPosition: 'center',
          duration: 5000,
          panelClass: ['errorSnackbar'],
        });
      }
    );
  }
  proceedToAuthentication(stepper: MatStepper) {
    // this.isDetailFormActive = true;
    this.fetchLoanRepaymentDetails(this.CIF, stepper);
    //stepper.next();
  }
  resendOTP() {
    const payload = {
      accountNumber: this.acctNo.toString()
    };
    this.detailFormSpinner = true;
    this.loanRepaymentService.sendOTPToCustomer(payload).subscribe(
      (response) => {
        this.detailFormSpinner = false;
        if (response.ResponseCode === '00') {
          this.otpReference = response.Data;
          this._snackBar.open('Please provide the otp sent to your registered phone number', 'Ok',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
        } else {
          this._snackBar.open('OTP Initiation failed', 'Failed',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
        }
      },
      (err) => {
        this.detailFormSpinner = false;
        this._snackBar.open('Error occured', 'Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
      }
    );
  }

  confirmBVNDateOfBirth(stepper: MatStepper){

    dateOfBirth: Date = this.confirmBVNDateOfBirthForm.controls.dobCtrl.value
    const payload = {
      bvn: this.confirmBVNDateOfBirthForm.controls.bvnNoCtrl.value,
      dob: this.confirmBVNDateOfBirthForm.controls.dobCtrl.value,
      //otpRefence: this.otpReference,
      accountNumber: this.acctNo
    };

    console.log(payload);

    
    this.showSpinner = true;
    this.loanRepaymentService.confirmBVNDateOfBirth(payload).subscribe(
      async (response) => {
        this.showSpinner = false;
        if (response.ResponseCode === '00') {
          this._snackBar.open('BVN and Date of Birth Validated', 'OK',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
             //this.isAuthenticationFormActive = true;
            //this.isDetailFormActive = false;
            //stepper.next();
            // this.isDetailFormDone = true;
            //this.isVerifyFormActive = true;
            this.initiateOTP(stepper)
        }
        else {
          this._snackBar.open(response.Data, 'Failed',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
        }
      },
      (err) => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        this._snackBar.open('Error occured', 'Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
      }
    )


    //this.isAuthenticationFormActive = true;
    //this.isDetailFormActive = false;
    //stepper.next();
    //this.isDetailFormDone = true;
    //this.isVerifyFormActive = true;
  }

  validateOTP(stepper: MatStepper) {
    const payload = {
      otp: this.otpForm.controls.otpControl.value,
      otpRefence: this.otpReference,
      accountNumber: this.acctNo
    };
    this.showSpinner = true;
    this.isAwaitingResponse = true;
    this.disableOTPForm = true;
    this.loanRepaymentService.validateOTP(payload).subscribe(
      async (response) => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        if (response.ResponseCode === '00') {
          this._snackBar.open('OTP Validated Successfully', 'OK',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
            this.isVerifyFormActive = false;
            this.isVerifyFormDone = true;
            stepper.next();
          //this.fetchLoanRepaymentDetails(this.CIF, stepper);
        } else {
          this._snackBar.open('OTP Validated failed', 'Failed',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
          this.disableOTPForm = false;
          // this.fetchLoanRepaymentDetails('102074453', stepper);

        }
      },
      (err) => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        this._snackBar.open('Error occured', 'Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
      }
    );
  }
  onFileSelected(event, fileName) {
    const _fileToUpload: File = event.target.files[0];

    if (_fileToUpload.size / (1000 * 1024) > 2) {
      this.signatureFile = fileName === 'Signature' ? '' : this.signatureFile;

      this.signatureFileExt = fileName === 'Signature' ? 'Size limit for the file is 2 MB' : '';

      this._snackBar.open('Size limit for the file is 2 MB', 'Ok',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: 'errorClass' });
      event.target.value = '';
      return;
    }

    if (!event.target.files || event.target.files.length < 1) {
      this.signatureFile = fileName === 'Signature' ? '' : this.signatureFile;

      this.signatureFileError = fileName === 'Signature' ? 'No file selected. Please select a valid pdf/jpeg file to upload' : '';

      this._snackBar.open('No file selected. Please select a valid pdf/jpeg file to upload',
        'Ok', { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
      event.target.value = '';
      return;
    }
    const file: File = event.target.files[0];

    if (fileName === 'Signature') {
      this.signatureFile = event.target.files[0].name;
      const extension = event.target.files[0].name.split('.');
      this.signatureFileExt = extension[extension.length - 1];
      this.uploadSignatureForm.patchValue({ signatureCtrl: event.target.files[0].name });
      this._snackBar.open('File uploaded successfully', 'Ok',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
      this.ConvertToBase64(file).then(result => {
        this.signatureBase64 = this.transformBase64String(result);
      });
    }
    event.target.value = '';
  }

  ConvertToBase64(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  transformBase64String(base64String: string) {
    if (base64String && base64String.indexOf('base64') > -1) {
      const hay = base64String.indexOf('base64');
      return base64String.substr(hay + 7);
    }
    console.log(base64String);
    return base64String;
  }

  onSelectDebitCard(value) {
    if (value === 'Yes') {
      this.showUploadSignatureForm = false;
      this.fetchInterswitchURL();
    } else {
      this.showUploadSignatureForm = true;
    }
  }

  initiateOTP(stepper: MatStepper) {
    const payload = {
      accountNumber: this.acctNo.toString()
    };
    this.showSpinner = true;
    //this.detailFormSpinner = true;
    this.loanRepaymentService.sendOTPToCustomer(payload).subscribe(
      (response) => {
        this.showSpinner = false;
        //this.detailFormSpinner = false;
        if (response.ResponseCode === '00') {

          this.isDetailFormDone = true;

          this.otpReference = response.Data;
          this._snackBar.open('Please provide the otp sent to your registered phone number', 'Ok',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
          this.isDetailFormActive = false;
          stepper.next();
          this.isDetailFormDone = true;
          this.isVerifyFormActive = true;
        } else {
          this._snackBar.open('OTP Initiation failed', 'Failed',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
        }
      },
      (err) => {
        this.detailFormSpinner = false;
        this._snackBar.open('Error occured', 'Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
      }
    );
  }
  _window(): any {
    // return the global native browser window object
    return window;
  }
  buildPayload() {
    return {
      accountNumber: this.acctNo,
      accountName: this.accountName,
      haveDebitCard: this.debitCardValue,
      repaymentPlan: this.repaymentPlan,
      accountSegment: this.accountSegment,
      signatureBase64: this.signatureBase64,
      signatureExt: this.signatureFileExt,
      amount: this.repaymentPlan === 'Partial Repayment' ? this.amount.value : this.amountLoaned,
      repaymentAmount: this.repaymentPlan === 'Partial Repayment' ? this.amount.value : this.amountLoaned,
      loanAccountNo: this.loanAcctSelected,
      loanCurrentBalance: this.amountLoaned,
      repaymentAcctNo: this.repaymentAcctSelected
    };
  }
  removeSelectedFile() {
    this.signatureFile = '';
    this.signatureFileExt = '';
    this.uploadSignatureForm.controls.signatureCtrl.setValue('');
    return;
  }

  InitiateRequest(stepper) {
    const amountLoaned = Number(this.amountLoaned);
    const amountToBeRepaid = Number(this.amountToBeRepaid);

    if (this.repaymentPlan === 'Partial Repayment') {
      if (this.totalAmountOnView > amountToBeRepaid || this.totalAmountOnView > amountLoaned) {
        this.insufficientFund = true;
        this._snackBar.open('You have an insufficient balance.', 'OK',
          { duration: 25000, horizontalPosition: 'center', verticalPosition: 'top' });
        return;
      }
    }
    if (this.repaymentPlan !== 'Partial Repayment') {
      if (amountLoaned > amountToBeRepaid) {
        this.insufficientFund = true;
      } else {
        this.insufficientFund = false;
      }
      if (this.insufficientFund) {
        this._snackBar.open('You have an insufficient balance.', 'OK',
          { duration: 25000, horizontalPosition: 'center', verticalPosition: 'top' });
        return;
      }
    }
    const payload = this.buildPayload();

    this.loanRepaymentService.submitRequest(payload).subscribe(
      (resp) => {
        this.ticketID = resp.Data.TicketID;
        this.isRepayLoanFormActive = false;
        this.isRepayLoanFormDone = true;
        stepper.next();
      },
      (err) => {
        this.showSpinner = false;
        this._snackBar.open('Error occured', 'Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
      }
    );
  }
  fetchInterswitchURL() {
    const self = this;
    const payload = {
      accountNumber: this.acctNo
    };
    this.dialog.closeAll();
    this.showSpinner = true;
    this.isRadioButtonDisabled = true;
    this.debitCardAuthModalSub = this.interswitchService.fetchInterswitchURL(payload).
      subscribe(response => {

        this.isRadioButtonDisabled = false;

        this.hideIframe = false;
        this.showSpinner = false;
        this.iframeModalRef = this.dialog.open(this.iFrameModalTemplate, {
          width: '800px',
          height: '600px',
        });
        // Init Iframe
        $('#quickServiceIFrame').attr('src', 'data:text/html;charset=utf-8,' + escape(response.Data));
        console.log('w', window);

        this._window().frames.quickServiceIFrame.focus();

        $('#quickServiceIFrame').on('load', () => {
          console.log('done loading iframe');
        });

        // https://gist.github.com/cirocosta/9f730967347faf9efb0b
        // set up the communication between iframe and parent window
        if (this._window().addEventListener) {
          this._window().addEventListener('message', onMessage, false);
        } else if (this._window().attachEvent) {
          this._window().attachEvent('onmessage', onMessage, false);
        }

        // this would be call once the iframe send a message
        function onMessage(event) {
          const data = event.data;
          if (data && data.appsource && data.appsource === 'quickservice') {

            if (data.responseCode && data.responseCode === '00') {
              self._snackBar.open('Card authenticated successfully', 'OK',
                { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
              self.dialog.closeAll();

              // self.InitiateRequest(self.stepperIndex);
              return;
            } if (data.responseDescription === 'Customer cancelation') {
              self._snackBar.open('Card validation cancelled', 'OK',
                { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
              self.dialog.closeAll();
              return;
            } else {
              self.dialog.closeAll();
              self._snackBar.open('Card Validation failed', 'Failed',
                { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['errorSnackbar'] });
            }

            // remove iframe
            $('#quickServiceIFrame').remove();
            this.isRadioButtonDisabled = false;
            // frame.parentNode.removeChild(frame);

            // send the user to another screen.
          }
        }

      },
        (error: any) => {
          this._snackBar.open('A problem has occured', null, { verticalPosition: 'top', horizontalPosition: 'right', duration: 2500 });
        });
  }
}
