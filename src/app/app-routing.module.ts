import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainOfflinePageComponent } from './pages/main-offline-page/main-offline-page.component';
import { IframePageComponent } from './pages/iframe-page/iframe-page.component';
import { MainOnlinePageComponent } from './pages/main-online-page/main-online-page.component';

const routes: Routes = [
  {path: '', component: MainOfflinePageComponent},
  {path: 'mainpage', component: MainOfflinePageComponent},
  {path: 'onlineGame', component: MainOnlinePageComponent},
  {path: 'iframepage/:index', component: IframePageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
