import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnDestroy {
  public timeRemaining: number = 0;
  private incrementTime: number = 0;
  private timerSubscription!: Subscription;
  private isRunning = false;
  @Output() timeOut = new EventEmitter<boolean>(); 


  startTimer(): void {
    if (!this.isRunning && this.timeRemaining > 0) {
      this.timerSubscription = interval(1000).subscribe(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          this.incrementTime = 0;
          this.timeOut.emit(true); 
          this.stopTimer();
        }
      });
      this.isRunning = true;
    }
  }

  stopTimer(): void {
    if (this.isRunning && this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.isRunning = false;
      this.timeRemaining += this.incrementTime;
    }
  }

  getTimeStats():number[]{
    return [this.timeRemaining,this.incrementTime];
  }

  resetTimer(initialTime: number, incrementTime: number): void {
    this.stopTimer();
    this.timeRemaining = initialTime;
    this.incrementTime = incrementTime;
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }


}
