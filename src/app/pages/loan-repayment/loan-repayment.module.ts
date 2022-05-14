import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { LoanRepaymentComponent } from './loan-repayment.component';

const routes: Routes = [
    {
        path: '',
        component: LoanRepaymentComponent
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
    }
];


@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), ReactiveFormsModule, FormsModule,
        MaterialModule],
    exports: [],
    declarations: [LoanRepaymentComponent],
    providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},DecimalPipe

    ],
    entryComponents: []
})
export class LoanRepaymentModule { }