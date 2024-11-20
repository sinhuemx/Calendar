import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { EjerAcademicos } from 'src/models/ejerciciosAcademicos_model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'modal-calendario-profesores',
  templateUrl: './modal-calendario-profesores.component.html',
  styleUrls: ['../calendario.scss'],
  standalone: true,
  imports: [
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class ModalCalendarioProfesoresComponent {
  @Input() ejercicios: EjerAcademicos[] = [];
  @Input() isOpen: boolean = false;
  @Input() event: any;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private modalCtrl: ModalController) { }

  close() {
    this.isOpen = false;
    this.closeModal.emit();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    const selectedEjercicios = this.ejercicios.filter(ejercicio => ejercicio.selected);
    this.modalCtrl.dismiss(selectedEjercicios);
  }

}
