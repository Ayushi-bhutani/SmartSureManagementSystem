import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h3><mat-icon>shield</mat-icon> SmartSure</h3>
            <p>Your trusted insurance management partner</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p><mat-icon>email</mat-icon> support&#64;smartsure.com</p>
            <p><mat-icon>phone</mat-icon> 1-800-SMARTSURE</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} SmartSure Insurance Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #263238;
      color: white;
      padding: 40px 20px 20px;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }

    .footer-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .footer-section h4 {
      margin-bottom: 16px;
      color: #90caf9;
    }

    .footer-section p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #b0bec5;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
    }

    .footer-section ul li {
      margin-bottom: 8px;
    }

    .footer-section ul li a {
      color: #b0bec5;
      text-decoration: none;
      transition: color 0.3s;
    }

    .footer-section ul li a:hover {
      color: #90caf9;
    }

    .footer-bottom {
      border-top: 1px solid #37474f;
      padding-top: 20px;
      text-align: center;
      color: #78909c;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
