import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgxChessBoardComponent } from 'ngx-chess-board';
import { OnlineGameService } from 'src/app/services/online-game.service';

@Component({
  selector: 'app-main-online-page',
  templateUrl: './main-online-page.component.html',
  styleUrls: ['./main-online-page.component.css']
})
export class MainOnlinePageComponent implements OnInit, OnDestroy {
  @ViewChild('board', { static: false }) boardManager!: NgxChessBoardComponent;

  public matchStarted = false;
  public boardDisabled = true;
  public darkDisabled = true;
  public darkTileColor = '#885f3d';
  public lightTileColor = '#d0d0d0';
  public size = 500;

  public gameCode = '';
  public playerColor = '';
  public currentTurn = '';
  public endGame = '';
  public gameNotFound = '';

  constructor(
    private onlineGameService: OnlineGameService,
  ) { }


  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.exitMatch();
  }

  //Update board move
  public updateBoard(event: any): void {
    const { color, move, checkmate, stalemate } = event;
    const gameStatus = checkmate ? 'checkmate' : stalemate ? 'stalemate' : 'ongoing';
    if (color === this.playerColor) {
      this.makeMove(move, gameStatus);
    }
  }

  // do a move e updates turn
  private makeMove(move: string, gameStatus: string): void {
    this.onlineGameService.makeMove(this.gameCode, move, this.playerColor, gameStatus).subscribe({
      next: () => {
        if (gameStatus === 'ongoing') {
          this.startOpponentTurn();
        }
      },
      error: (err) => console.error('Erro ao realizar movimento:', err)
    });
  }


  //Create a new game 
  public createGame(): void {
    this.gameNotFound = '';
    const startingPlayer = 'Player1';

    this.onlineGameService.createGame(startingPlayer).subscribe({
      next: (gameCode) => {
        this.gameCode = gameCode;
        this.listenToUpdates();
        startingPlayer === 'Player1' ? this.startAsWhite() : this.startAsBlack();
      },
      error: (err) => console.error('Error at create a new game :', err)
    });
  }

  // Subscribes on game updates
  private listenToUpdates() {
    this.onlineGameService.listenToGameUpdates(this.gameCode).subscribe((gameData) => {
      if (gameData) {
        this.handleGameUpdates(gameData);
      }
    });
  }

  //handle updates
  private handleGameUpdates(gameData: any): void {
    if (!this.matchStarted && gameData.player2) {
      this.matchStarted = true;
      this.currentTurn = 'white';
    }

    if (gameData.currentTurn === this.playerColor) {
      this.boardManager.move(gameData.nextMove);
      this.startMyTurn();
    }

    this.checkGameEnd(gameData.gameStatus, gameData.currentTurn);
  }

  // check game status
  private checkGameEnd(gameStatus: string, currentTurn: string) {
    const winner = currentTurn === 'white' ? 'black' : 'white';

    switch (gameStatus) {
      case ('checkmate'):
        this.endGame = `CHECKMATE! WINNER: ${winner}`
        break;
      case ('stalemate'):
        this.endGame = "STALEMATE"
        break;
      case ('endgame'):
        this.resetBoard();
        break;
    };
  }

  //Join a Game logic
  public joinGame(gameCode: string): void {
    this.onlineGameService.joinGame(gameCode).subscribe({
      next: (messageEvent) => {
        if (messageEvent.currentTurn) {
          this.gameCode = gameCode;
          this.gameNotFound = "";
          messageEvent.currentTurn === "Player1" ? this.startAsBlack() : this.startAsWhite()
          this.listenToUpdates();
        } else {
          this.gameNotFound = "Game not Found!";
        }
      },
      error: (err) => console.error('Erro to join game:', err),
    });
  }

  private startAsBlack() {
    this.playerColor = 'black';
    this.boardManager.reverse();
    this.darkDisabled = false;
  }

  private startAsWhite() {
    this.playerColor = 'white';
    this.startMyTurn();
  }

  //my turn
  private startMyTurn() {
    this.boardDisabled = false;
  }

  //opponent turn
  private startOpponentTurn() {
    this.currentTurn = this.playerColor === 'white' ? 'black' : 'white';
    this.boardDisabled = true;
  }

  //exit match
  @HostListener('window:beforeunload', ['$event'])
  public exitMatch(): void {
    if (this.gameCode) {
      const gameCodeToRemove = this.gameCode;
      this.makeMove('', 'endgame');
      this.onlineGameService.removeGameByCode(gameCodeToRemove).subscribe({
        next: () => this.resetBoard(),
        error: (err) => console.error('Erro ao sair do jogo:', err)
      });
    }
  }

  private resetBoard(): void {
    this.endGame = '';
    this.gameCode = '';
    this.boardManager.reset();
    this.matchStarted = false;
  }
}
