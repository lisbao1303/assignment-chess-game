import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showTopBar = true;

  // Rotas onde a barra será oculta
  hiddenRoutes: string[] = ['/iframepage/1','/iframepage/2'];

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Oculta a barra se a rota atual estiver na lista
        this.showTopBar = !this.hiddenRoutes.includes(event.urlAfterRedirects);
      }
    });
  }
}