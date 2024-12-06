import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.css']
})
export class FormInputComponent {
  @Input() buttonLabel: string = 'Join Game';  
  @Input() placeholder: string = 'Enter game code';  
  @Output() submitValue = new EventEmitter<string>();  
  @Input() inputValue: string = '';  

  customSubmit():void{
    this.submitValue.emit(this.inputValue); 
  }
}
