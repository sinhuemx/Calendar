import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AzureService } from 'src/app/services/azure.service';
import {
  EjerAcademicos,
  EjerAcademicosResponse,
} from 'src/models/ejerciciosAcademicos_model';
import { AlertController, NavController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'select-calendario-profesores',
  templateUrl: './select-calendario-profesores.component.html',
  styleUrls: ['../calendario.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [AzureService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SelectCalendarioProfesoresComponent implements OnInit {
  @Input() dataEjerAcademico$: Observable<any> | undefined;
  @Input() isDarkMode: boolean | undefined;
  @Input() nomina: string = 'L03132058';
  @Input() estatusEjercicioAcademico = 'A';
  @Input() totalDeResultados = '20';
  @Output() refreshComplete = new EventEmitter<void>();

  viewTitle: any;
  titulo: 'Calendario Profesores' | undefined;

  constructor(
    private azureService: AzureService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadEjerciciosAcademicos(
      this.nomina,
      this.estatusEjercicioAcademico,
      this.totalDeResultados
    );
  }

  loadEjerciciosAcademicos(
    nomina: string,
    estatusEjercicioAcademico: string,
    totalDeResultados: string
  ): void {
    this.dataEjerAcademico$ = this.azureService
      .getEjerciciosAcademicos(
        nomina,
        estatusEjercicioAcademico,
        totalDeResultados
      )
      .pipe(
        map((data: EjerAcademicosResponse) => data.data),
        map((ejercicios: EjerAcademicos[]) =>
          ejercicios.filter(
            (ejercicio: EjerAcademicos) =>
              ejercicio.attributes.estatusEjercicioAcademico === 'A'
          )
        ),
        tap((ejerciciosFiltrados: EjerAcademicos[]) =>
          console.log('Ejercicios filtrados:', ejerciciosFiltrados)
        )
      );
  }

  refresh() {
    this.loadEjerciciosAcademicos(
      this.nomina,
      this.estatusEjercicioAcademico,
      this.totalDeResultados
    );
    this.refreshComplete.emit();
  }

  handleDateSelected(date: Date): void {
    // Lógica para manejar la fecha seleccionada
  }

  handleEventSelected(event: any): void {
    // Lógica para manejar el evento seleccionado
  }

  async alertNoDisponible() {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: 'No tienes un Horario Disponible',
      buttons: ['OK'],
    });
    await alert.present();
  }

  cerrarVista() {
    this.navCtrl.pop();
  }
}
