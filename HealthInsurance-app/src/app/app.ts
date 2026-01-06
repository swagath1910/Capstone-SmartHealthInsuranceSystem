import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('HealthInsurance-app');
  showHeader = false;
  showSidebar = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // Hides header on home, login, and register pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      const authPages = ['/', '/home', '/login', '/register'];
      this.showHeader = !authPages.includes(url);
      this.showSidebar = this.showHeader; // this shows sidebar when header is shown
      this.cdr.detectChanges();
    });
  }
}
