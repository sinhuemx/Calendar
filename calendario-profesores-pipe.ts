import { Pipe, PipeTransform } from '@angular/core';
import { ICalendarEvent } from 'src/models/horarioDeCursos_model';

@Pipe({
  name: 'calendarioPipe',
  standalone: true
})
export class CalendarioPipe implements PipeTransform {
  obtenerClaseEvento(cellDate: Date, eventSource: ICalendarEvent<any>[], selectedDate: { date: Date; events: ICalendarEvent[]; }): string {
    throw new Error('Method not implemented.');
  }
  esDiaSeleccionado(date: Date, selectedDate: { date: Date; events: ICalendarEvent[]; }): boolean {
    throw new Error('Method not implemented.');
  }

  transform(value: any, ...args: any[]): any {
    if (args[0] === 'esperarElementosTd') {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const calendarCells = document.querySelectorAll(
            'td[tappable] > div > div'
          );
          if (calendarCells.length > 0) {
            clearInterval(interval);
            resolve(calendarCells);
          }
        }, 100);
      });
    } else if (args[0] === 'agregarIconosAlCalendario') {
      const calendarCells: NodeListOf<HTMLTableCellElement> = value;
      const currentDate = args[1];
      const eventSource = args[2];
      calendarCells.forEach((cell) => {
        const dateText = cell.textContent.trim();
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), +dateText);
        const events = eventSource.filter(event =>
          new Date(event.startTime).toDateString() === date.toDateString()
        );
        if (events.length > 0) {
          const icon = document.createElement('ion-icon');
          icon.setAttribute('name', 'calendar');
          icon.setAttribute('size', 'small');
          cell.appendChild(icon);
        }
      });
    }
    return value;
  }

  public agregarIconosAlCalendario(calendarCells: NodeListOf<HTMLTableCellElement>, currentDate: Date, eventSource: ICalendarEvent[]): void {
    calendarCells.forEach((cell) => {
      const cellDateText = cell.textContent?.trim();
      if (cellDateText && !isNaN(Number(cellDateText))) {
        const cellDate = this.obtenerFechaDesdeTexto(cellDateText, currentDate);
        const isToday = this.esMismoDia(cellDate, new Date());
        const hasEvents = this.tieneEventosEnElDia(cellDate, eventSource);
  
        cell.classList.remove('monthview-current', 'monthview-primary-with-event');
  
        if (isToday || hasEvents) {
          const iconElement = document.createElement('ion-icon');
          iconElement.setAttribute('name', 'ellipse');
          iconElement.classList.add('calendar-event-icon');
  
          if (isToday) {
            cell.classList.add('monthview-current');
          }
  
          if (hasEvents) {
            cell.classList.add('monthview-primary-with-event');
          }
  
          cell.appendChild(iconElement);
        }
      }
    });
  }
  
  public tieneEventosEnElDia(date: Date, eventSource: ICalendarEvent[]): boolean {
    return eventSource.some(event => this.esMismoDia(new Date(event.startTime), date));
  }

  public esperarElementosTd(): Promise<NodeListOf<HTMLTableCellElement>> {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const calendarCells = document.querySelectorAll('td');
        if (calendarCells.length > 0) {
          resolve(calendarCells);
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  public obtenerFechaDesdeTexto(dia: string, currentDate: Date): Date {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return new Date(currentYear, currentMonth, parseInt(dia, 10));
  }

  public esMismoDia(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  public tieneEventosEnElMes(date: Date, eventSource: ICalendarEvent[]): boolean {
    return eventSource.some(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  }
}
