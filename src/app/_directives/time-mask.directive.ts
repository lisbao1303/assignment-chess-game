import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTimeMask]'
})
export class TimeMaskDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    let value = this.el.nativeElement.value;
    
    // Remove non-numeric characters
    value = value.replace(/\D/g, '');

    // Apply the MM:SS format
    if (value.length >= 3) {
      value = value.substring(0, 2) + ':' + value.substring(2, 4);
    }

    // Set the formatted value back to the input field
    this.el.nativeElement.value = value;
  }
}
