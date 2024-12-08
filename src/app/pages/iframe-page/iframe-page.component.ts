import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoveChange, NgxChessBoardComponent } from 'ngx-chess-board';
import { Subscription } from 'rxjs';
import { PostMessageService } from 'src/app/services/post-message.service';

@Component({
  selector: 'app-iframe-page',
  templateUrl: './iframe-page.component.html',
  styleUrls: ['./iframe-page.component.css']
})
export class IframePageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('board', { static: false }) boardManager!: NgxChessBoardComponent;

  private messageSubscription!: Subscription;
  private routeSubscription!: Subscription;
  private indexPlayer: string | null = '1';
  private initialLoading: boolean = false;

  public darkDisabled: boolean = true;
  public iframeDisabled: boolean = true;
  public darkTileColor = '#885f3d';
  public lightTileColor = '#d0d0d0';
  public size = 400;

  constructor(
    private route: ActivatedRoute,
    private messageService: PostMessageService
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.subscribeToRouteParams();
    this.subscribeToPostMessages();
    this.notifyParentBoardLoaded();
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  private subscribeToRouteParams(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.indexPlayer = params.get('index');
      this.setBoardOrientation();
    });
  }

  private subscribeToPostMessages(): void {
    this.messageSubscription = this.messageService.getMessages().subscribe({
      next: (messageEvent) => this.handleMessage(messageEvent.data),
      error: (err) => console.error('Erro ao receber mensagem:', err),
    });
  }

  // notify load in ngAfterViewInit
  private notifyParentBoardLoaded(): void {
    window.parent.postMessage('boardLoaded');
  }

  private handleMessage(messageEventData: any): void {
    const { action, move, pgn } = messageEventData;

    switch (action) {
      case 'update':
        this.boardManager.move(move);
        break;
      case 'startsNew':
        this.setNewGame();
        break;
      case 'disableBoard':
        this.iframeDisabled = true;
        break;
      case 'enableBoard':
        this.iframeDisabled = false;
        break;
      case 'loadState':
        this.loadGameState(pgn);
        break;
    }
  }
  
  // load state from localstorage
  private loadGameState(pgn: string): void {
    this.initialLoading = true;
    this.boardManager.setPGN(pgn);
    this.setBoardOrientation();
    this.initialLoading = false;
  }

  private setBoardOrientation(): void {
    if (this.indexPlayer === '2') {
      this.boardManager.reverse();
      this.darkDisabled = false;
    }
  }

  //Reset Board
  public setNewGame(): void {
    this.boardManager.reset();
    this.darkDisabled = this.indexPlayer === '1';
    this.iframeDisabled = this.indexPlayer !== '1';
    if (this.indexPlayer === '2') this.boardManager.reverse();
  }
  
  //Send Main a message
  public updateBoard(event: MoveChange): void {
    if (this.initialLoading) return;

    this.iframeDisabled = !this.iframeDisabled;
    window.parent.postMessage(event);
  }
}
