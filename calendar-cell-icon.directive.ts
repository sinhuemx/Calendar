import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ICalendarEvent } from '@models/getHorarioBanner9.model';
 

@Directive({
  selector: '[appCalendarCellIcon]'
})
export class CalendarCellIconDirective implements OnInit {
  @Input('appCalendarCellIcon') date!: Date;
  @Input() eventSource: ICalendarEvent[] = [];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.agregarIcono();
  }

  public agregarIcono() {
    const hasEvent = this.eventSource.some(evento => this.esMismoDia(new Date(evento.startTime), this.date));
    const isToday = this.esHoy(this.date);

    if (hasEvent || isToday) {
      let iconElement = this.el.nativeElement.querySelector('ion-icon');
      if (!iconElement) {
        iconElement = this.renderer.createElement('ion-icon');
        this.renderer.setAttribute(iconElement, 'name', 'ellipse');
        this.renderer.setAttribute(iconElement, 'color', isToday ? 'secondary' : 'primary');
        this.renderer.appendChild(this.el.nativeElement, iconElement);
      }
    }
  }

  public esMismoDia(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  public esHoy(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}
