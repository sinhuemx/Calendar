import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { isActiveBtnPanico, numBtnPanico } from './calendario-profesores-constants';

//import { MitecHeaderComponent } from '../mitec-header/mitec-header.component';

import { ThemeService} from '@services/theme.service';
import { HeaderComponent } from '@components/header/header.component';
import { IonicCalendarioProfesoresComponent } from './ionic-calendario-profesores/ionic-calendario-profesores.component';
import { SelectCalendarioProfesoresComponent } from './select-calendario-profesores/select-calendario-profesores.component';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from '@services/firebase.service';
import { MitecHeaderComponent } from '@components/mitec-header/mitec-header.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-calendario-profesores',
  templateUrl: './calendario-profesores.component.html',
  styleUrls: ['./calendario.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarioProfesoresComponent implements OnInit {
  @ViewChild(SelectCalendarioProfesoresComponent)
  selectCalendario!: SelectCalendarioProfesoresComponent;
  @ViewChild(IonicCalendarioProfesoresComponent)
  ionicCalendario!: IonicCalendarioProfesoresComponent;

  isDarkMode: boolean = false;
  viewTitle: any;
  titulo: 'Calendario Profesores' | undefined;
  refrescarEvento: any;
  pendienteARefrescar = 0;
  loadingCtrl: any;
  storageService: any;
  azureService: any;
  load: boolean;
  alertController: any;
  horario: any;
  events: any;
  numBtnPanico = numBtnPanico
  isActiveBtnPanico = isActiveBtnPanico
  public feedback: string = '';
  private destruir$ = new Subject<void>();


  constructor(
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.validateTheme();
    this.aplicarTema();
    // this.loadFirebaseData();
  }

  // private async loadFirebaseData() {
  //   const fireCalendario = await this._firebase.getServicesById('CalendarioAlumnos');

  //   console.log(fireCalendario);
  // }

  ngAfterViewInit() {
    this.inicializarSuscripcionesCalendario();
    // this.selectCalendario.refreshComplete.subscribe(() => {
    //   this.cicloActualizar();
    // });
    // this.ionicCalendario.refreshComplete.subscribe(() => {
    //   this.cicloActualizar();
    // });
    // if (this.selectCalendario && this.selectCalendario.refreshComplete){
    //     this.selectCalendario.refreshComplete.subscribe(()  => {
    //       this.cicloActualizar();
    //     }  );
    // }else {
    //   console.error("selectCalendario no funciona")
    // }

    // if(this.ionicCalendario && this.ionicCalendario.refreshComplete){
    //   this.ionicCalendario.refreshComplete.subscribe(()  =>{
    //     this.cicloActualizar();
    //   });
    // }else{
    //   console.error("ionicCalendario no funciona") 
    // }
  }

  inicializarSuscripcionesCalendario() {
    if (this.ionicCalendario) {
      this.ionicCalendario.refreshComplete
        .subscribe(() => {
          this.cicloActualizar();
        });
    } else {
      console.error("IonicCalendario no está inicializado");
    }

    if (this.selectCalendario) {
      this.selectCalendario.refreshComplete
        
        .subscribe(() => {
                });
    } else {
      console.error("SelectCalendario no está inicializado");
    }
  }


  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.aplicarTema();
  }

  aplicarTema() {
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.body.setAttribute('theme', theme);
  }

  manejoDeActualizar(event: any) {
    setTimeout(() => {
      this.refrescarEvento = event;
      this.pendienteARefrescar = 2;
      this.selectCalendario.refresh();
      this.ionicCalendario.refresh();
      event.target.complete();
    }, 2000);
  }

  cicloActualizar() {
    this.pendienteARefrescar--;
    if (this.pendienteARefrescar === 0 && this.refrescarEvento) {
      console.table(this.ionicCalendario);
      this.refrescarEvento.target.complete();
      this.refrescarEvento = null;
    }
  }

 
  
}
