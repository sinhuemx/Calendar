import { Subject } from "rxjs";
import { EjerAcademicos } from "src/models/ejerciciosAcademicos_model";
import { HorarioDeCursos } from "src/models/horarioDeCursos_model";
import { vistaCalendarioMode } from "./calendario-profesores-types";
import { CalendarEvent } from "angular-calendar";
import { CalendarMode } from "ionic7-calendar";
import { ICalendarEvent } from "@models/getHorarioBanner9.model";

//Configuracion del Calendario
export const calendarOptions: {
  locale: string;
  allDayLabel: string;
  noEventsLabel: string;
  formatMonthTitle: string;
  formatWeekTitle: string;
  formatDayTitle: string;
} = {
  locale: "es-ES",
  allDayLabel: "Día",
  noEventsLabel: "No hay eventos",
  formatMonthTitle: "MMMM YYYY",
  formatWeekTitle: "MMMM 'Week' W",
  formatDayTitle: " MMMM dd, yyyy",
};

export const selectOpciones = {
  header: "Selecciona Vista",
};

//EjerAcademicos
//export const nomina = 'L03132058';
//export const estatusEjercicioAcademico = 'A';
//export const totalDeResultados = '';
//export const claveEjercicioAcademico = '';

//GetHorarios
//export const initialEjercicios: EjerAcademicos[] = [];
//export const initialHorarioDeCursos: HorarioDeCursos[] = [];
//export const initialEventSource: HorarioDeCursos[] = [];
export const isToday = false;
export const isCurrentMonth = true;
export const isEventListVisible = true;
//export const viewTitle: string = '';
export const destroy$ = new Subject<void>();
export const eventosMes: HorarioDeCursos[] = [];
//export const nomina: string = '';

export const calendar: {
  mode: vistaCalendarioMode;
  currentDate: Date;
  lockSwipeToPrev: boolean;
  lockSwipeToNext: boolean;
} = {
  mode: "month",
  currentDate: new Date(),
  lockSwipeToPrev: false,
  lockSwipeToNext: false,
};

//estudiantes

export const hasAllDayEvents = false;
export const darkThemeClass = "dark-theme-calendar";
export const load = false;
export const dateCalendarDay = new Date();
export const edificio = "";
export const grupo = "";
export const salon = "";
export const profesor = "";
export const _objMateriaSeleccionada = [];
export const horario = [];
export const events: CalendarEvent[] = [];
//* Nombre del día en donde se hace click
export let viewTitle: string;
//> CONFIGURACION DEL CALENDARIO EN MODO MONTH
export const calendarMonth = {
  mode: "month" as CalendarMode,
  currentDate: new Date(),
  locale: "es",
};

export const calendarDay = {
  mode: "day" as CalendarMode,
  currentDate: new Date(),
  locale: "es",
};

//* Formato del título que se muestra en la vista del mes.
export const formatMonthTitle = "MMMM";

//* Texto que se muestra en cuando no hay eventos asignados en el día seleccionado
export const noEvents = "Sin clases asignadas";

//> Fecha seleccionada
export let selectedDate: Date;
export let eventSource: ICalendarEvent[] = [];
export const isModalOpen = false;
export const modal_titulo = "";
export const currentColor = 0;
export const _colorMaterias = [];
export let showMateriaInfo: any;
export const urlFeedback: string = "";
export const isVisibleFeedback: boolean = false;
export const isActiveBtnPanico: boolean = false;
export const numBtnPanico: number = 0;
