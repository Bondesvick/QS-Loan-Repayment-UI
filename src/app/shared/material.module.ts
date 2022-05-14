import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material//input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
    imports: [MatInputModule, MatStepperModule, MatFormFieldModule, MatButtonModule, MatRadioModule, MatSortModule,
        MatMenuModule, MatSelectModule, MatDialogModule, MatIconModule, MatProgressBarModule, MatCheckboxModule,
        MatCardModule, MatDatepickerModule, MatTooltipModule, MatTableModule, MatPaginatorModule],
    exports: [MatInputModule, MatStepperModule, MatFormFieldModule, MatButtonModule, MatRadioModule, MatPaginatorModule,
        MatCheckboxModule, MatCardModule, MatDatepickerModule, MatTableModule, MatSortModule,
        MatMenuModule, MatSelectModule, MatDialogModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
    providers: [{
        provide: MAT_RADIO_DEFAULT_OPTIONS,
        useValue: { color: 'accent' },
    }, {
        provide: STEPPER_GLOBAL_OPTIONS,
        useValue: { displayDefaultIndicatorType: false }

    }]
})
export class MaterialModule {

}
