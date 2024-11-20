import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarioProfesoresComponent } from './calendario-profesores.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarioProfesoresComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarioProfesoresRoutingModule {}
