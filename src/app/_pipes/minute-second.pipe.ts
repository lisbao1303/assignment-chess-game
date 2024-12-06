import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minuteSecond'
})
export class MinuteSecondPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null || value < 0) return '00:00'; 

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    return `${formattedMinutes}:${formattedSeconds}`;
  }
}
