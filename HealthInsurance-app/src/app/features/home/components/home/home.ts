import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  features = [
    {
      icon: '🏥',
      title: 'Hospital Network',
      description: 'Access to 500+ trusted hospitals nationwide'
    },
    {
      icon: '📋',
      title: 'Easy Claims',
      description: 'Simple and fast claim processing'
    },
    {
      icon: '💳',
      title: 'Flexible Plans',
      description: 'Customizable insurance plans for your needs'
    },
    {
      icon: '⚡',
      title: 'Instant Support',
      description: '24/7 customer support available'
    }
  ];

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
