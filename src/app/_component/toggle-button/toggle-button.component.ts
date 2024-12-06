import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.css']
})
export class ToggleButtonComponent {
  @Output() toggle = new EventEmitter<boolean>(); 
  @Input() gameisRunning : boolean = false; 
  @Input() isOn = false; 

  toggleState(): void {
    this.isOn = !this.isOn;
    this.toggle.emit(this.isOn); 
  }
}
