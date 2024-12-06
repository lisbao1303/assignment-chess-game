
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class PostMessageService {
  private messageObservable: Observable<MessageEvent>;

  constructor() {
    this.messageObservable = new Observable(observer => {
      const messageHandler = (event: MessageEvent) => {
        observer.next(event); // Emits event to subscribers
      };

      // window message listener
      window.addEventListener('message', messageHandler);

      // Remove message listener
      return () => {
        window.removeEventListener('message', messageHandler);
      };
    });
  }

  // get observable
  getMessages(): Observable<MessageEvent> {
    return this.messageObservable;
  }
}

