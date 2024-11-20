import { ElementRef, Injectable } from '@angular/core';

@Injectable()
export class ElementRefUtils {
  constructor() { }

public isElementRefOf<T extends HTMLElement>(
    el: ElementRef<any>,
    type: { new(...args: any[]): T }
  ): el is ElementRef<T> {
    return el.nativeElement instanceof type;
  }
}

export interface HTMLIonCalendarElement extends HTMLElement {
  // Propiedades de entrada (input properties)


  // Métodos y propiedades de salida (output por ejemplo)


  // Métodos públicos
  currentDate: Date;

}

export type vistaCalendarioMode = 'month' | 'week' | 'day';
