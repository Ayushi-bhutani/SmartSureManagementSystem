import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner diameter="60"></mat-spinner>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .callback-container p {
      margin-top: 24px;
      color: white;
      font-size: 18px;
      font-weight: 500;
    }
  `]
})
export class GoogleCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  message = 'Processing Google authentication...';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        this.message = 'Authentication failed. Redirecting...';
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else if (token) {
        this.message = 'Authentication successful! Redirecting...';
        this.authService.handleGoogleCallback(token);
      } else {
        this.message = 'Invalid callback. Redirecting...';
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      }
    });
  }
}
