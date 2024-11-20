import { NgModule, CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from '@components/header/header.component';
import { AzureService } from '../services/azure.service';

import { CalendarioProfesoresComponent } from './calendario-profesores.component'
import { IonicCalendarioProfesoresComponent } from './ionic-calendario-profesores/ionic-calendario-profesores.component';
import { ModalCalendarioProfesoresComponent } from './modal-calendario-profesores/modal-calendario-profesores.component';
import { NgCalendarModule } from 'ionic7-calendar';
import { CalendarioPipe } from './calendario-profesores-pipe';
import { SelectCalendarioProfesoresComponent } from './select-calendario-profesores/select-calendario-profesores.component';
import { CalendarCellIconDirective } from './calendar-cell-icon.directive';
import { CalendarioFacadeService } from 'src/app/services/calendario-facade.service';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { CalendarioProfesoresRoutingModule } from './calendario-profesores-routing.module';

// import { MitecHeaderComponent } from '@components/mitec-header/mitec-header.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    NgCalendarModule,
    ModalCalendarioProfesoresComponent,
    CalendarioPipe,
    SelectCalendarioProfesoresComponent,
    FormsModule,
    ComponentsModule,
    CalendarioProfesoresRoutingModule,
    // MitecHeaderComponent
  ],
  declarations: [
    CalendarioProfesoresComponent,
    IonicCalendarioProfesoresComponent,
    ],
  providers: [
    AzureService,
    HeaderComponent,
    CalendarCellIconDirective, 
    CalendarioFacadeService,
    SelectCalendarioProfesoresComponent,
    { provide: LOCALE_ID, useValue: 'es-MX' },
    CalendarioPipe,
  ],
})
export class CalendarioProfesoresModule {}
