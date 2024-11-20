import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  LOCALE_ID,
  SimpleChanges,
  ViewChild,
  OnChanges,
  NgZone,
  TemplateRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Renderer2,
  NO_ERRORS_SCHEMA,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CalendarComponent, NgCalendarModule } from 'ionic7-calendar';
import { CommonModule, registerLocaleData } from '@angular/common';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';

import { ModalCalendarioProfesoresComponent } from '../modal-calendario-profesores/modal-calendario-profesores.component';
import { CalendarioFacadeService } from 'src/app/services/calendario-facade.service';
import localeMx from '@angular/common/locales/es-MX';
import { CalendarioPipe } from '../calendario-profesores-pipe';
import { ITimeSelected } from 'ionic7-calendar/calendar.interface';
import { SelectCalendarioProfesoresComponent } from '../select-calendario-profesores/select-calendario-profesores.component';
import { ThemeService } from '@services/theme.service';
import { StorageService } from '@services/storage.service';
import { vistaCalendarioMode } from '../calendario-profesores-types';
import { viewTitle, isEventListVisible, destroy$ } from '../calendario-profesores-constants';

import { isToday as dateFnsIsToday } from 'date-fns';
import moment from 'moment';
import { CalendarCellIconDirective } from '../calendar-cell-icon.directive';
import { ICalendarEvent } from '@models/getHorarioBanner9.model';

const colors: any[] = [
  {
    primary: '#ff6800',
    secondary: '#ff6800'
  },
  {
    primary: '#d93b7a',
    secondary: '#d93b7a'
  },
  {
    primary: '#206e9f',
    secondary: '#206e9f'
  },
  {
    primary: '#32c787',
    secondary: '#32c787'
  },
  {
    primary: '#795548',
    secondary: '#795548'
  },
  {
    primary: '#00A7F7',
    secondary: '#00A7F7'
  },
  {
    primary: '#673AB7',
    secondary: '#673AB7'
  },
  {
    primary: '#ff6b68',
    secondary: '#ff6b68'
  },
  {
    primary: '#29517B',
    secondary: '#29517B'
  },
  {
    primary: '#ff5652',
    secondary: '#ff5652'
  },
  {
    primary: '#4DB6AC',
    secondary: '#4DB6AC'
  },
  // {
  //   primary: '#00163e',
  //   secondary: '#00163e'
  // },
  {
    primary: '#b256fa',
    secondary: '#b256fa'
  }
];

registerLocaleData(localeMx);

@Component({
  selector: 'ionic-calendario-profesores',
  templateUrl: './ionic-calendario-profesores.component.html',
  styleUrls: ['../calendario.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IonicCalendarioProfesoresComponent implements OnInit, OnDestroy, OnChanges {
  
  private eventCache: Map<string, boolean> = new Map();
  private currentColor = 0;
  @ViewChild(CalendarComponent) myCalendar!: CalendarComponent;
  @ViewChild('dayCalendar') items;

  @Output() onCalendarReady = new EventEmitter<void>();
  @Output() refreshComplete = new EventEmitter<void>();

  @Input() isDarkMode: boolean = false;
  eventSource: ICalendarEvent[] = [];
  @Input() calendar = {
    mode: 'month' as vistaCalendarioMode,
    currentDate: new Date(),
    lockSwipeToPrev: true,
    lockSwipeToNext: true,
  };
  @Input() selectedDate: { date: Date; events: ICalendarEvent[] } | null = null;
  @Input() isModalOpen: boolean = false;
  @Input() selectedEvent: any;
  @Input() events: any[] = [];
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() eventSelected = new EventEmitter<any>();
  
  viewTitle = viewTitle;
  isEventListVisible = isEventListVisible;
  destroy$ = destroy$;
  datos: any = {};
  showDateInput: boolean = false;
  currentDate: string = new Date().toISOString();
  private datosIniciales: ICalendarEvent[] | null = null;
  selectedMonth: string = '';
  selectedYear: number = new Date().getFullYear();
  months: string[] = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  years: number[] = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  @ViewChild('monthCalendar', { static: false, read: ElementRef }) monthCalendar!: ElementRef;
  @ViewChild('weekCalendar') weekCalendar!: CalendarComponent;
  @ViewChild('dayCalendar') dayCalendar!: CalendarComponent;
  @ViewChild('customEventTemplate') customEventTemplate: TemplateRef<any> | undefined;
  load: boolean = false;
  el: any;
  observer: MutationObserver | undefined;

  public configCalendar = {
    locale: 'es-MX',
    startHour: 6,
    endHour: 24
  }

  constructor(
    private ngZone: NgZone,
    private calendarioPipe: CalendarioPipe,
    private storageService: StorageService,
    private themeService: ThemeService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private calendarioFacadeService: CalendarioFacadeService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.themeService.validateTheme();
    this.cargarDatosIniciales().then(() => {
      this.cdr.detectChanges(); 
      this.loadEvents(); 
      this.agregarIconosAlCalendario();
      // this.loadEvents();
      console.log('Datos iniciales cargados y eventos mostrados inmediatamente');
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.agregarIconosAlCalendario();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventSource'] && !changes['eventSource'].isFirstChange()) {
      this.agregarIconosAlCalendario();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.observer) {
      this.observer.disconnect();
    }
  }



  public async cargarDatosIniciales(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'bubbles',
    });
    await loading.present();
  
    try {
      await this.getStorageInfo();
      const eventos = await this.calendarioFacadeService.getHorarioBanner9().toPromise();
      console.log('Eventos cargados:', eventos);
      this.eventSource = eventos;
      this.updateCalendarEventSources(this.eventSource);
      this.agregarIconosAlCalendario();
    } catch (error) {
      console.error('Error al cargar datos iniciales', error);
      this.mostrarErrorAlerta('Ocurrió un error al cargar los datos del calendario.');
    } finally {
      await loading.dismiss();
    }
  }

  public onTimeSelected(ev: ITimeSelected) {
    const selectedTime = ev.selectedTime;
    const selectedEvents: ICalendarEvent[] = ev.events.map((event: any, index) => {
      const extendedProps = event.extendedProps || {};

      return {
        id: `${index}`,
        type: 'class',
        title: event.title || '',
        draggable: false,
        allDay: event.allDay || false,
        endTime: new Date(event.endTime),
        startTime: new Date(event.startTime),
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        color: event.color,
        extendedProps: {
          id_unidadFormacion: extendedProps.id_unidadFormacion || '',
          id_ejerciciosAcademico: extendedProps.id_ejerciciosAcademico || '',
          id_profesorTitular: extendedProps.id_profesorTitular || '',
          id_modalidadImpartida: extendedProps.id_modalidadImpartida || '',
          fechaInicioClase: extendedProps.fechaInicioClase || '',
          fechaFinClase: extendedProps.fechaFinClase || '',
          horaInicioClase: extendedProps.horaInicioClase || '',
          horaFinClase: extendedProps.horaFinClase || '',
          descripcionEdificio: extendedProps.descripcionEdificio || '',
          claveSalon: extendedProps.claveSalon || '',
          grupo: extendedProps.grupo || '',
          fechaInicioCurso: extendedProps.fechaInicioCurso || '',
          fechaFinCurso: extendedProps.fechaFinCurso || '',
          diasemana: extendedProps.diasemana || '',
          numeroCurso: extendedProps.numeroCurso || '',
          codigoMateria: extendedProps.codigoMateria || '',
          nombreCompleto: extendedProps.nombreCompleto || '',
          descripcionEjercicioAcademico: extendedProps.descripcionEjercicioAcademico || '',
          fechaInicioEjercicioAcademico: extendedProps.fechaInicioEjercicioAcademico || '',
          fechaFinEjercicioAcademico: extendedProps.fechaFinEjercicioAcademico || '',
          salon: extendedProps.salon || '',
          dia: extendedProps.dia || '',
        },
        resizable: {
          beforeStart: false,
          afterEnd: false,
        },
        meta: {},
      };
    });

    this.selectedDate = { date: selectedTime, events: selectedEvents };
    this.calendar.currentDate = selectedTime;
    this.dateSelected.emit(selectedTime);

    if (this.calendar.mode === 'month') {
      this.actualizarEventosDelDia(selectedTime);
    } else if (this.calendar.mode === 'week') {
      this.actualizarEventosDeSemana(selectedTime);
    } else {
      console.log('dia evento')
    }

    this.agregarIconosAlCalendario();
    console.log('Selected time: ' + selectedTime + ', hasEvents: ' + (selectedEvents.length !== 0));
  }

  public isEventOnSelectedDate(event: ICalendarEvent, selectedDate: Date): boolean {
    const eventStart = new Date(event.startTime);
    return this.esMismoDia(eventStart, selectedDate);

    
  }

  public agregarIconosAlCalendario() {
    console.log('Iniciando agregarIconosAlCalendario');
    
    // Esperar a que el DOM se actualice
    setTimeout(() => {
      this.changeColorHorario(this.eventSource);
      // const calendarElement = this.elRef.nativeElement.querySelector('.monthview-container');
      const calendarElement  = document.querySelector('.monthview-container');
      if (!calendarElement) {
        console.error('No se encontró el contenedor del calendario (.monthview-container)');
        return;
      }
  
      const cells = calendarElement.querySelectorAll('.monthview-date-cell');
      if (cells.length === 0) {
        console.error('No se encontraron celdas del calendario (.monthview-date-cell)');
        return;
      }
  
      console.log(`Se encontraron ${cells.length} celdas del calendario`);
  
      cells.forEach((cell: HTMLElement) => {
        const dateAttr = cell.getAttribute('data-date');
        if (!dateAttr) {
          console.warn('Celda sin atributo data-date', cell);
          return;
        }
  
        const cellDate = new Date(dateAttr);
        const hasEvent = this.hasEvent(cellDate);
        const isToday = this.isToday(cellDate);
  
        console.log(`Fecha: ${cellDate.toISOString()}, Tiene evento: ${hasEvent}, Es hoy: ${isToday}`);
  
        // Eliminar icono existente si lo hay
        const existingIcon = cell.querySelector('.event-icon');
        if (existingIcon) {
          existingIcon.remove();
        }
  
        if (hasEvent || isToday) {
          const icon = this.renderer.createElement('ion-icon');
          this.renderer.setAttribute(icon, 'name', 'ellipse');
          this.renderer.addClass(icon, 'event-icon');
          
          if (isToday) {
            this.renderer.addClass(icon, 'today-icon');
          }
          
          if (hasEvent) {
            this.renderer.addClass(icon, 'has-event-icon');
          }
  
          this.renderer.appendChild(cell, icon);
          console.log(`Icono agregado a la celda para la fecha ${cellDate.toISOString()}`);
        }
      });
  
      console.log('Finalizado agregarIconosAlCalendario');
    }, 200);
  }

  public obtenerFechaDesdeTexto(dateText: string): Date {
    const currentDate = this.calendar.currentDate;
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dateText, 10));
  }

  public obtenerClaseEvento(cellDate: Date): string {
    return this.calendarioPipe.obtenerClaseEvento(cellDate, this.eventSource, this.selectedDate);
  }

  public tieneEventosEnElMes(date: Date): boolean {
    return this.calendarioPipe.tieneEventosEnElMes(date, this.eventSource);
  }

  public tieneEventosEnElDia(date: Date): boolean {
    return this.eventSource.some(event => this.esMismoDia(new Date(event.startTime), date));
  }

  public esDiaSeleccionado(date: Date): boolean {
    return this.calendarioPipe.esDiaSeleccionado(date, this.selectedDate);
  }

  public esMismoDia(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  public aplicarTema() {
    this.ngZone.runOutsideAngular(() => {
      document.body.setAttribute('theme', this.isDarkMode ? 'dark' : 'light');
    });
  }

  public today(): void {
    this.cambiarFecha(new Date());
    this.calendar.mode = 'month';
  }

  public cambiarFecha(date: Date) {
    this.calendar.currentDate = date;
    this.verificarSiEsHoy();
  }

  public verificarSiEsHoy(): void {
    const today = new Date();
    this.isToday(today);
  }

  public onEventSelected(event: any): void {
    this.eventSelected.emit(event);
    this.openModal(event);
    console.log('Event selected: ' + event.startTime + '-' + event.endTime + ', ' + event.title);
  }

  public onViewTitleChanged(title: string) {
    this.viewTitle = title.replace('Week', 'Semana');
    setTimeout(() => this.agregarIconosAlCalendario(), 100);
  }

  public changeMode(mode: vistaCalendarioMode): void {
    this.calendar.mode = mode;
    this.loadEvents();
  }

  public onCurrentDateChanged(event: Date) {
    console.log('current date changed:', event);
    this.calendar.currentDate = event;
    this.clearEventCache();
    this.cdr.markForCheck();

  }

  public toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.aplicarTema();
  }

  public refresh() {
    this.cargarDatosIniciales();
  }

  public openModal(event: any) {
    this.isModalOpen = true;
    this.selectedEvent = event;
  }

  public closeModal() {
    this.isModalOpen = false;
    this.selectedEvent = null;
  }

  public actualizarSelectedDate(selectedTime: Date, eventos: ICalendarEvent[]) {
    this.selectedDate = {
      date: selectedTime,
      events: eventos.filter(evento => this.isEventOnSelectedDate(evento, selectedTime)),
    };

    console.log('Se actualiza actualizarSelectedDate')
  }

  public actualizarEventSource(eventos: ICalendarEvent[]) {
    this.eventSource = eventos;
    this.updateCalendarEventSources(this.eventSource);

    if (this.calendar.mode === 'week') {
      this.selectedDate = {
        date: this.calendar.currentDate,
        events: this.eventSource,
      };
    }
  }

  public async actualizarEventosDelDia(date: Date) {
    const eventos = this.eventSource.filter(evento => this.isEventOnSelectedDate(evento, date));

    console.log('Updating events for day:', date, 'found events:', eventos);

    this.selectedDate = {
      date,
      events: eventos,
    };
    this.agregarIconosAlCalendario();
    this.changeColorHorario(eventos);
  }

  private changeColorHorario(eventos: any) {
    // console.log(eventos)
    setTimeout(() => {
      
      // const element = document.querySelector('.calendar-event-inner');
      // console.log(element)
      // if (element) {
        
      //   this.renderer.setStyle(element, 'background-color', `${eventos[0].color.primary}`); // Aplica el color de fondo
      // }
      const elementosDias  = document.querySelectorAll('.calendar-event-inner');
          elementosDias.forEach((elemento, i) => {
            const searchColor = eventos.filter((event: any) => event.title === elemento.textContent);
            this.renderer.setStyle(elemento, 'background-color', `${searchColor[0].color}`);       
          });
    }, 200);
  }


  public async actualizarEventosDeSemana(date: Date) {
    const startOfWeek = moment(date).startOf('week').toDate();
    const endOfWeek = moment(date).endOf('week').toDate();

    const eventos = this.eventSource.filter(evento => {
      const eventStart = new Date(evento.startTime);
      return eventStart >= startOfWeek && eventStart <= endOfWeek;
    });

    console.log('Updating events for week starting:', startOfWeek, 'ending:', endOfWeek, 'found events:', eventos);

    this.selectedDate = {
      date,
      events: eventos,
    };
    this.agregarIconosAlCalendario();
    this.changeColorHorario(eventos);
  }

  public onSwipe(event: any): void {
    if (this.monthCalendar && this.monthCalendar.nativeElement) {
      if (event.direction === 2) {
        this.monthCalendar.nativeElement.slideNext();
      } else if (event.direction === 4) {
        this.monthCalendar.nativeElement.slidePrev();
      }
      console.log('Swiped:', event.direction);
    }
  }

  private async mostrarErrorAlerta(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  public loadEvents() {
    const currentDate = this.calendar.currentDate;

    if (this.calendar.mode === 'month') {
        this.cargarDatosIniciales().then(() => {
            this.cdr.detectChanges();
        });
    } else if (this.calendar.mode === 'week') {
        this.actualizarEventosDeSemana(currentDate).then(() => {
            this.cdr.detectChanges();
        });
    } else if (this.calendar.mode === 'day') {  // Manejo para modo día
        this.actualizarEventosDelDia(currentDate).then(() => {
            this.cdr.detectChanges(); // Asegura que la vista se actualice para modo día
        });
    }
}

  updateCalendarEventSources(eventSource: ICalendarEvent[]) {
    this.eventSource = eventSource;
    (this.myCalendar as any).eventSource = this.eventSource;
    console.log('eventSource')
  }

  public async getStorageInfo() {
    try {
      const datos = await this.storageService.getData('matricula');
      this.datos = datos;
    } catch (error) {
      console.error('Error al obtener datos del almacenamiento:', error);
    }
  }

  public onMonthChange(event: any) {
    this.selectedMonth = event.detail.value;
    this.filterEvents();
  }

  public onYearChange(event: any) {
    this.selectedYear = event.detail.value;
    this.filterEvents();
  }

  public filterEvents() {
    const selectedDate = new Date(this.selectedYear, this.months.indexOf(this.selectedMonth), 1);
    this.calendar.currentDate = selectedDate;
    this.viewTitle = this.formatDate(selectedDate, 'MMMM YYYY');
    this.loadEvents();
  }

  public formatDate(date: Date, format: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (format === 'MMMM YYYY') {
      options.day = undefined;
    }

    return date.toLocaleString('es-MX', options);
  }

  public hasEvent(date: Date): boolean {
    return this.eventSource.some(event => 
      this.isSameDay(new Date(event.startTime), date)
    );
  }
  
  public isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  public clearEventCache() {
    this.eventCache.clear();
  }

  public updateEvents(newEvents: ICalendarEvent[]) {
    this.eventSource = newEvents;
    this.clearEventCache();
    this.cdr.markForCheck();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  public dayRenderFunction = (date: Date) => {
    const hasEvent = this.hasEvent(date);
    const isToday = this.isToday(date);
    
    let className = '';
    if (hasEvent) className += 'has-event ';
    if (isToday) className += 'is-today';
    
    return {
      html: `<div class="${className}">${date.getDate()}</div>`,
      callback: (element: HTMLElement) => {
        if (hasEvent || isToday) {
          const icon = this.renderer.createElement('ion-icon');
          this.renderer.setAttribute(icon, 'name', 'ellipse');
          this.renderer.addClass(icon, 'event-icon');
          this.renderer.appendChild(element, icon);
        }
      }
    };
  }

  public get eventTemplate() {
    return this.customEventTemplate;
  }

  public setupMutationObserver() {
    if (this.monthCalendar) {
      const calendarElement = this.monthCalendar.nativeElement;

      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            this.agregarIconosAlCalendario();
          }
        }
      });

      observer.observe(calendarElement, {
        childList: true,
        subtree: true 
      });

      console.log('MutationObserver set up on', calendarElement);
    } else {
      console.error('Month calendar element not found');
    }
  }

 

  public observeCalendarChanges() {
    const targetNode = this.elRef.nativeElement.querySelector('ionic-calendario-profesores');

    const config = { childList: true, subtree: true };

    const callback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          this.agregarIconosAlCalendario();
        }
      }
    };

    const observer = new MutationObserver(callback);
    // console.log(observer)
    // observer.observe(targetNode, config);

    this.agregarIconosAlCalendario();
  }
    // public procesarDatosIniciales(selectedTime?: Date) {
  //   if (this.datosIniciales) {
  //     this.eventSource = this.datosIniciales;
  //     this.updateCalendarEventSources(this.eventSource);
  //     if (selectedTime) {
  //       this.calendar.currentDate = selectedTime;
  //       if (this.calendar.mode === 'month') {
  //         this.actualizarEventosDelDia(selectedTime);
  //       } else if (this.calendar.mode === 'week') {
  //         this.actualizarEventosDeSemana(selectedTime);
  //       }
  //     }
  //   }
  // }


}
