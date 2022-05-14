import { NgModule } from "@angular/core";
import { MaterialModule } from './material.module';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule
    ({
        imports: [MaterialModule, FormsModule, ReactiveFormsModule],
        exports: [SidemenuComponent],
        declarations: [SidemenuComponent],
        providers: []
    })
export class SharedModule {

}
