import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { InsuranceService } from '../../services/insurance.service';
import { InsuranceType } from '../../models/policy.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    NavbarComponent,
    FooterComponent
  ],
  template: `
    <div class="landing-page">
      <app-navbar></app-navbar>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Protect What Matters Most</h1>
          <p class="hero-subtitle">
            Comprehensive insurance solutions tailored to your needs. 
            Fast, reliable, and transparent.
          </p>
          <div class="hero-buttons">
            <button mat-raised-button color="primary" class="cta-button" 
                    (click)="navigateToAction()">
              <mat-icon>shield</mat-icon>
              {{ isAuthenticated ? 'Go to Dashboard' : 'Get Started' }}
            </button>
            <button mat-stroked-button class="secondary-button" 
                    (click)="scrollToInsuranceTypes()">
              <mat-icon>explore</mat-icon>
              Explore Plans
            </button>
          </div>
        </div>
        <div class="hero-image">
          <mat-icon class="hero-icon">security</mat-icon>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">Why Choose SmartSure?</h2>
          <div class="features-grid">
            <mat-card class="feature-card">
              <mat-icon class="feature-icon">flash_on</mat-icon>
              <h3>Instant Coverage</h3>
              <p>Get insured in minutes with our streamlined digital process</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">verified_user</mat-icon>
              <h3>Trusted Protection</h3>
              <p>Comprehensive coverage backed by industry-leading partners</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">support_agent</mat-icon>
              <h3>24/7 Support</h3>
              <p>Expert assistance whenever you need it, day or night</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">trending_down</mat-icon>
              <h3>Best Rates</h3>
              <p>Competitive pricing with exclusive discounts for loyal customers</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">phone_android</mat-icon>
              <h3>Mobile First</h3>
              <p>Manage your policies anytime, anywhere from any device</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon class="feature-icon">assignment_turned_in</mat-icon>
              <h3>Easy Claims</h3>
              <p>Simple claim process with fast approvals and settlements</p>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Insurance Types Section -->
      <section class="insurance-types-section" id="insurance-types">
        <div class="container">
          <h2 class="section-title">Our Insurance Plans</h2>
          <p class="section-subtitle">Choose the perfect coverage for your needs</p>
          
          <div class="insurance-grid" *ngIf="insuranceTypes.length > 0">
            <mat-card class="insurance-card" *ngFor="let type of insuranceTypes">
              <div class="insurance-icon-wrapper">
                <mat-icon class="insurance-icon">{{ getIconForType(type.name) }}</mat-icon>
              </div>
              <h3>{{ type.name }}</h3>
              <p>{{ type.description }}</p>
              <button mat-raised-button color="primary" (click)="navigateToBuyPolicy(type.typeId)">
                Get Quote
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card>
          </div>

          <div class="loading-state" *ngIf="insuranceTypes.length === 0">
            <p>Loading insurance plans...</p>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <div class="container">
          <h2 class="section-title">How It Works</h2>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">1</div>
              <mat-icon class="step-icon">search</mat-icon>
              <h3>Choose Your Plan</h3>
              <p>Browse our insurance options and select the one that fits your needs</p>
            </div>

            <div class="step-card">
              <div class="step-number">2</div>
              <mat-icon class="step-icon">description</mat-icon>
              <h3>Fill Details</h3>
              <p>Provide necessary information through our simple guided process</p>
            </div>

            <div class="step-card">
              <div class="step-number">3</div>
              <mat-icon class="step-icon">payment</mat-icon>
              <h3>Make Payment</h3>
              <p>Secure payment processing with multiple payment options</p>
            </div>

            <div class="step-card">
              <div class="step-number">4</div>
              <mat-icon class="step-icon">check_circle</mat-icon>
              <h3>Get Covered</h3>
              <p>Instant policy activation and digital documents delivered immediately</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div class="stat-item">
              <h3>$50M+</h3>
              <p>Claims Settled</p>
            </div>
            <div class="stat-item">
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
            <div class="stat-item">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <h2>Ready to Get Protected?</h2>
          <p>Join thousands of satisfied customers who trust SmartSure</p>
          <button mat-raised-button color="accent" class="cta-button" 
                  (click)="navigateToAction()">
            <mat-icon>rocket_launch</mat-icon>
            {{ isAuthenticated ? 'View My Policies' : 'Start Now' }}
          </button>
        </div>
      </section>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .landing-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 100px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 60px;
      min-height: 600px;
    }

    .hero-content {
      flex: 1;
      max-width: 600px;
    }

    .hero-title {
      font-size: 56px;
      font-weight: 700;
      margin: 0 0 24px 0;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 20px;
      margin: 0 0 40px 0;
      opacity: 0.95;
      line-height: 1.6;
    }

    .hero-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .cta-button {
      height: 56px;
      padding: 0 32px;
      font-size: 18px;
      font-weight: 600;
    }

    .secondary-button {
      height: 56px;
      padding: 0 32px;
      font-size: 18px;
      background: white;
      color: #667eea;
    }

    .hero-image {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-icon {
      font-size: 300px;
      width: 300px;
      height: 300px;
      opacity: 0.2;
    }

    /* Features Section */
    .features-section {
      padding: 80px 20px;
      background: #f5f5f5;
    }

    .section-title {
      text-align: center;
      font-size: 42px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .section-subtitle {
      text-align: center;
      font-size: 18px;
      color: #666;
      margin: 0 0 60px 0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .feature-card {
      padding: 40px;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .feature-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #667eea;
      margin-bottom: 20px;
    }

    .feature-card h3 {
      font-size: 24px;
      margin: 0 0 12px 0;
      color: #333;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    /* Insurance Types Section */
    .insurance-types-section {
      padding: 80px 20px;
      background: white;
    }

    .insurance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
    }

    .insurance-card {
      padding: 40px;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .insurance-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .insurance-icon-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .insurance-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .insurance-card h3 {
      font-size: 24px;
      margin: 0 0 12px 0;
      color: #333;
    }

    .insurance-card p {
      color: #666;
      line-height: 1.6;
      margin: 0 0 24px 0;
      min-height: 60px;
    }

    .insurance-card button {
      width: 100%;
    }

    /* How It Works Section */
    .how-it-works-section {
      padding: 80px 20px;
      background: #f5f5f5;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }

    .step-card {
      text-align: center;
      position: relative;
    }

    .step-number {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      margin: 0 auto 20px;
    }

    .step-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .step-card h3 {
      font-size: 22px;
      margin: 0 0 12px 0;
      color: #333;
    }

    .step-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    /* Stats Section */
    .stats-section {
      padding: 80px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 40px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-item h3 {
      font-size: 48px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .stat-item p {
      font-size: 18px;
      margin: 0;
      opacity: 0.9;
    }

    /* CTA Section */
    .cta-section {
      padding: 100px 20px;
      background: white;
      text-align: center;
    }

    .cta-section h2 {
      font-size: 42px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .cta-section p {
      font-size: 20px;
      color: #666;
      margin: 0 0 40px 0;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-section {
        flex-direction: column;
        padding: 60px 20px;
        text-align: center;
      }

      .hero-title {
        font-size: 36px;
      }

      .hero-subtitle {
        font-size: 16px;
      }

      .hero-icon {
        font-size: 150px;
        width: 150px;
        height: 150px;
      }

      .hero-buttons {
        justify-content: center;
      }

      .section-title {
        font-size: 32px;
      }

      .cta-section h2 {
        font-size: 32px;
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  private insuranceService = inject(InsuranceService);
  private authService = inject(AuthService);
  private router = inject(Router);

  insuranceTypes: InsuranceType[] = [];
  isAuthenticated = false;

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadInsuranceTypes();
  }

  loadInsuranceTypes(): void {
  this.insuranceService.getAllTypes().subscribe({
    next: (types) => {
      console.log('Insurance types received:', types);
      this.insuranceTypes = types;  // No filtering
    },
    error: (err) => {
      console.error('Failed to load insurance types:', err);
    }
  });
}

  getIconForType(typeName: string): string {
    const iconMap: { [key: string]: string } = {
      'Vehicle': 'directions_car',
      'Car': 'directions_car',
      'Auto': 'directions_car',
      'Home': 'home',
      'House': 'home',
      'Property': 'apartment',
      'Health': 'favorite',
      'Medical': 'local_hospital',
      'Life': 'person',
      'Travel': 'flight',
      'Business': 'business'
    };

    for (const key in iconMap) {
      if (typeName.toLowerCase().includes(key.toLowerCase())) {
        return iconMap[key];
      }
    }
    return 'shield';
  }

  navigateToAction(): void {
    if (this.isAuthenticated) {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'Admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/customer/dashboard']);
      }
    } else {
      this.router.navigate(['/auth/register']);
    }
  }

  navigateToBuyPolicy(typeId?: string): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/customer/buy-policy'], {
        queryParams: typeId ? { typeId } : {}
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  scrollToInsuranceTypes(): void {
    const element = document.getElementById('insurance-types');
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}
