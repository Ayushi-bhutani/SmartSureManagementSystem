import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="getStatusClass()">
      {{ status }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-active {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-approved {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-draft {
      background-color: #f5f5f5;
      color: #616161;
    }

    .status-submitted {
      background-color: #e1f5fe;
      color: #0277bd;
    }

    .status-under-review {
      background-color: #fff9c4;
      color: #f57f17;
    }

    .status-closed {
      background-color: #eceff1;
      color: #455a64;
    }

    .status-cancelled {
      background-color: #fce4ec;
      color: #880e4f;
    }

    .status-expired {
      background-color: #efebe9;
      color: #4e342e;
    }

    .status-terminated {
      background-color: #ffcdd2;
      color: #b71c1c;
    }

    .status-failed {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .status-success {
      background-color: #c8e6c9;
      color: #388e3c;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  getStatusClass(): string {
    const statusLower = this.status.toLowerCase().replace(/\s+/g, '-');
    return `status-${statusLower}`;
  }
}
