import { LoanRepaymentComponent } from './pages/loan-repayment/loan-repayment.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppConfigService } from './core/services/appconfig.service';
import { UtilService } from './core/services/helpers.service';
import { InterswitchService } from './core/services/interswitch.service';
import { LoanRepaymentService } from './core/services/loan-repayment.service';
import { UtilityService } from './core/services/utils.service';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './shared/material.module';
import { MatStepperModule } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BotDetectCaptchaModule } from 'angular-captcha';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@NgModule({
  declarations: [
    AppComponent,
    // LoanRepaymentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    SharedModule,
    MaterialModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    HttpClientModule,
    MatNativeDateModule,
    RouterModule,

    MatInputModule,
    MatProgressBarModule,

    BotDetectCaptchaModule,
    RecaptchaFormsModule,
    RecaptchaModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
    },
    AppConfigService,
    UtilService,
    InterswitchService,
    LoanRepaymentService,
    UtilityService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
