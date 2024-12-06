import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainOfflinePageComponent } from './pages/main-offline-page/main-offline-page.component';
import { IframePageComponent } from './pages/iframe-page/iframe-page.component';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { TimerComponent } from './_component/timer/timer.component';
import { ToggleButtonComponent } from './_component/toggle-button/toggle-button.component';
import { TimeMaskDirective } from './_directives/time-mask.directive';
import { FormsModule } from '@angular/forms';
import { MinuteSecondPipe } from './_pipes/minute-second.pipe';
import { MainOnlinePageComponent } from './pages/main-online-page/main-online-page.component';
import { FormInputComponent } from './_component/form-input/form-input.component';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MainOfflinePageComponent,
    IframePageComponent,
    TimerComponent,
    ToggleButtonComponent,
    TimeMaskDirective,
    MinuteSecondPipe,
    MainOnlinePageComponent,
    FormInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxChessBoardModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideDatabase(() => getDatabase())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
