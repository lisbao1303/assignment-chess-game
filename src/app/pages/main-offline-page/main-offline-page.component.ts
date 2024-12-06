import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { TimerComponent } from 'src/app/_component/timer/timer.component';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { PostMessageService } from 'src/app/services/post-message.service';

enum PlayerColor {
  White = 'white',
  Black = 'black'
}

enum GameEndReason {
  Checkmate = 'checkmate',
  Stalemate = 'stalemate',
  Timeout = 'timeout'
}

@Component({
  selector: 'app-main-offline-page',
  templateUrl: './main-offline-page.component.html',
  styleUrls: ['./main-offline-page.component.css']
})
export class MainOfflinePageComponent implements OnInit, OnDestroy {
  @ViewChild('iFrame1', { static: false }) player1!: ElementRef;
  @ViewChild('iFrame2', { static: false }) player2!: ElementRef;
  // Timers
  @ViewChild('timerComponentPlayer1', { static: false }) timerComponentPlayer1!: TimerComponent;
  @ViewChild('timerComponentPlayer2', { static: false }) timerComponentPlayer2!: TimerComponent;

  public boardLoadedCount = 0;
  public gameisRunning = false;
  public endGame: string = '';
  public timerState = false;
  public invalidTime = false;
  public initialTime: string = '';
  public incrementTime: string = '';
  private appState: any = null;
  private messageSubscription!: Subscription;
  public endGameReason = GameEndReason;

  constructor(
    private messageService: PostMessageService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.messageSubscription = this.subscribePostMessage();
    this.saveStateOnChangeRoute();
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  // Load App State logic
  loadAppState(): void {
    const savedState = this.localStorageService.loadState("chessOfflineState");
    if (savedState) {
      this.appState = savedState;
      this.loadPGN(savedState.pgn);
      this.loadTimerStats(savedState.timerStatsPlayer1, savedState.timerStatsPlayer2);
      this.setCurrentPlayer(savedState.currentplayer);
      
      this.gameisRunning = true;
    }
    this.localStorageService.clearAll();
  }

  // Load App State logic (load pgn)
  loadPGN(pgn: any): void {
    this.player1.nativeElement.contentWindow.postMessage({ action: 'loadState', pgn });
    this.player2.nativeElement.contentWindow.postMessage({ action: 'loadState', pgn });
  }

  // Load App State logic (load timers if exists)
  loadTimerStats(player1Stats: any, player2Stats: any): void {
    if (player1Stats && player2Stats) {
      this.timerState = true;
      this.timerComponentPlayer1.resetTimer(player1Stats[0], player1Stats[1]);
      this.timerComponentPlayer2.resetTimer(player2Stats[0], player2Stats[1]);
    }
  }

  // Load App State logic (set current player to restart the match)
  setCurrentPlayer(currentPlayer: string): void {
    if (currentPlayer === PlayerColor.White) {
      this.player1.nativeElement.contentWindow.postMessage({ action: 'enableBoard' });
      if (this.timerState) this.timerComponentPlayer1.startTimer();
    } else {
      this.player2.nativeElement.contentWindow.postMessage({ action: 'enableBoard' });
      if (this.timerState) this.timerComponentPlayer2.startTimer();
    }
  }

  // Save State on close window
  @HostListener('window:beforeunload', ['$event'])
  saveState(): void {
    if (this.gameisRunning) {
      this.saveTimerStats();
      this.localStorageService.saveState("chessOfflineState", this.appState);
    }
  }

  // Save State on change route
  saveStateOnChangeRoute() {
    // Listen for route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url !== "/mainpage") {
          this.saveState();
        }
      }
    });
  }

  // Save State on close window logic (Save timer stats if exists)
  saveTimerStats(): void {
    if (this.timerState) {
      this.appState = {
        ...this.appState,
        timerStatsPlayer1: this.timerComponentPlayer1.getTimeStats(),
        timerStatsPlayer2: this.timerComponentPlayer2.getTimeStats(),
      };
    }
  }

  // Subscribe on PostMessage
  subscribePostMessage(): Subscription {
    return this.messageService.getMessages().subscribe({
      next: (messageEvent) => {
        if (messageEvent.data === "boardLoaded") {
          this.boardLoadedCount++;
          if (this.boardLoadedCount === 2) {
            this.loadAppState();
            this.boardLoadedCount = 0;
          }
        } else {
          this.handlePlayerMove(messageEvent);
        }
      },
      error: (err) => console.error('Erro:', err),
    });
  }

  // Send oponent move and update state and timer
  handlePlayerMove(messageEvent: any): void {
    const { color, move, checkmate, stalemate, pgn } = messageEvent.data;
    const opponentColor = color === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;

    this.sendMoveToPlayer(opponentColor, move);
    const checkEnd = this.checkGameEnd(color, checkmate, stalemate);
    if (checkEnd) return;
    this.saveBoardState(pgn, opponentColor);
    this.toggleTimers(color);
  }

  // Send oponent move
  sendMoveToPlayer(opponentColor: string, move: any): void {
    const player = opponentColor === PlayerColor.White ? this.player1 : this.player2;
    player.nativeElement.contentWindow.postMessage({ action: 'update', move });
  }

  // check game end
  checkGameEnd(color: string, checkmate: boolean, stalemate: boolean): boolean {
    if (checkmate || stalemate) {
      const reason = checkmate ? GameEndReason.Checkmate : GameEndReason.Stalemate;
      this.onGameEnd(color, reason);
      return true;
    }
    return false;

  }

  //update state
  saveBoardState(pgn: any, opponentColor: string): void {
    this.appState = {
      pgn: pgn.pgn,
      currentplayer: opponentColor,
    };
  }

  // toggle timer on move piece
  toggleTimers(color: string): void {
    if (this.timerState) {
      if (color === PlayerColor.White) {
        this.timerComponentPlayer1.stopTimer();
        this.timerComponentPlayer2.startTimer();
      } else {
        this.timerComponentPlayer2.stopTimer();
        this.timerComponentPlayer1.startTimer();
      }
    }
  }

  // end logic
  onGameEnd(player: string, defeatReason: GameEndReason): void {
    switch (defeatReason) {
      case (GameEndReason.Checkmate):
        this.endGame = `CHECKMATE! WINNER: ${player}`
        break;
      case (GameEndReason.Stalemate):
        this.endGame = "STALEMATE"
        break;
      case (GameEndReason.Timeout):
        this.endGame = `TIMEOUT! WINNER: ${player}`
        break;

    };
    if (this.timerState) {
      this.timerComponentPlayer1.stopTimer();
      this.timerComponentPlayer2.stopTimer();
    }
    this.gameisRunning = false;
    this.disableBoards();

  }

  //enable timer
  timerStateToggle(newState: boolean): void {
    this.timerState = newState;
  }

  disableBoards(): void {
    this.player1.nativeElement.contentWindow.postMessage({ action: 'disableBoard' });
    this.player2.nativeElement.contentWindow.postMessage({ action: 'disableBoard' });
  }

  //Start/Restart game
  resetBoards(): void {
    if (this.timerState && !this.isValidTime()) return;
    if (this.timerState) this.resetTimers();
    this.endGame = '';
    this.invalidTime = false;
    this.gameisRunning = true;
    this.saveBoardState({}, PlayerColor.White);
    this.player1.nativeElement.contentWindow.postMessage({ action: 'startsNew' });
    this.player2.nativeElement.contentWindow.postMessage({ action: 'startsNew' });

  }

  isValidTime(): boolean {
    const initialTime = this.convertToSeconds(this.initialTime);
    const incrementTime = this.convertToSeconds(this.incrementTime);
    if (!initialTime || Number.isNaN(incrementTime)) {
      this.invalidTime = true;
      return false;
    }
    return true;
  }

  resetTimers(): void {
    const initialTime = this.convertToSeconds(this.initialTime);
    const incrementTime = this.convertToSeconds(this.incrementTime);
    this.timerComponentPlayer1.resetTimer(initialTime, incrementTime);
    this.timerComponentPlayer2.resetTimer(initialTime, incrementTime);
    this.timerComponentPlayer1.startTimer();
  }

  //Stop game logic
  stopGame(): void {
    this.gameisRunning = false;
    if (this.timerState) {
      this.timerComponentPlayer1.resetTimer(0, 0);
      this.timerComponentPlayer2.resetTimer(0, 0);
    }
    this.disableBoards();
  }

  convertToSeconds(timeInput: string): number {
    const [minutes, seconds] = timeInput.split(':').map(Number);
    return minutes * 60 + seconds;
  }

}
