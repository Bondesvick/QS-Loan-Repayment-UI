import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'loan-repayment',
    loadChildren: () => import('./pages/loan-repayment/loan-repayment.module').then(m => m.LoanRepaymentModule),
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'loan-repayment',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
