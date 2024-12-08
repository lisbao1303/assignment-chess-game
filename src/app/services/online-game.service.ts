import { Injectable } from '@angular/core';
import { Database, ref, set, update, onValue, get, DataSnapshot, remove, runTransaction } from '@angular/fire/database';
import { Observable, BehaviorSubject, from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineGameService {
  private gameData = new BehaviorSubject<any>(null);

  constructor(private db: Database) {}

  // Observable to create a new game
  createGame(hostStartsWith:string): Observable<string> {
    const gameCode = Math.random().toString(36).substring(2, 8); 
    const gameRef = ref(this.db, `games/${gameCode}`);
    return from(set(gameRef, {
      hostStartsWith: hostStartsWith,
      nextMove: '', 
      currentTurn: 'white',
      gameStatus: 'ongoing'
    })).pipe( // pipe at the return of set() return gamecode
      map(() => {
        return gameCode;
      })
    );
  }

  // Observable to Join a game and get initial data
  joinGame(gameCode: string): Observable<any> {
    const gameRef = ref(this.db, `games/${gameCode}`);
    return from(update(gameRef, { matchmaking: true })).pipe(
      switchMap(() => from(get(gameRef).then((snapshot) => snapshot.val())))  //pass to get observable
    );
  }

  // Método para escutar atualizações no jogo
  listenToGameUpdates(gameCode: string): Observable<any> {
    const gameRef = ref(this.db, `games/${gameCode}`);
    onValue(gameRef, (snapshot) => {
      this.gameData.next(snapshot.val());
    });
    return this.gameData.asObservable();
  }

  // Método para realizar uma jogada
  makeMove(gameCode: string, nextMove: string, colorPlayer: string,gameStatus:string): Observable<void> {
    const nextTurn = colorPlayer === 'white' ? 'black' : 'white';
    const gameRef = ref(this.db, `games/${gameCode}`);
    return from(update(gameRef, { nextMove, currentTurn: nextTurn , gameStatus}));
  }


  // Método para remover um jogo pelo código
  removeGameByCode(gameCode: string): Observable<void> {
    const gameRef = ref(this.db, `games/${gameCode}`);
    return from(remove(gameRef));
  }
}
