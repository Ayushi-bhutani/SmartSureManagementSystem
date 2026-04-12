# SmartSure Insurance Management System - Frontend

Modern Angular frontend for the SmartSure Insurance Management System.

## Features

- 🔐 JWT Authentication with Google OAuth
- 👤 Role-based Access Control (Customer & Admin)
- 📋 Policy Management with Wizard Interface
- 💰 Premium Calculation & Mock Payment System
- 📄 Claims Management with Document Upload
- 📊 Admin Dashboard with Reports & Analytics
- 🎨 Modern Material Design UI
- 📱 Responsive Design

## Tech Stack

- Angular 19
- Angular Material
- RxJS
- Chart.js
- TypeScript
- SCSS

## Getting Started

### Prerequisites

- Node.js (LTS version)
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── core/              # Core module (guards, interceptors, services)
│   ├── shared/            # Shared components, pipes, directives
│   ├── features/
│   │   ├── auth/          # Authentication module
│   │   ├── customer/      # Customer dashboard & features
│   │   ├── admin/         # Admin dashboard & features
│   │   ├── policies/      # Policy management
│   │   ├── claims/        # Claims management
│   │   └── reports/       # Reports module
│   ├── models/            # TypeScript interfaces & models
│   └── services/          # API services
├── assets/                # Static assets
├── environments/          # Environment configurations
└── styles/                # Global styles
```

## API Configuration

Update the API base URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5057'  // Ocelot Gateway URL
};
```

**Note:** The payment system uses a MOCK implementation. No payment gateway keys are required.

## Available Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registration
- `/auth/forgot-password` - Password reset

### Customer Routes (Protected)
- `/customer/dashboard` - Customer dashboard
- `/customer/policies` - My policies
- `/customer/buy-policy` - Buy new policy (wizard)
- `/customer/claims` - My claims
- `/customer/initiate-claim` - Initiate claim (wizard)
- `/customer/profile` - Profile management

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard with analytics
- `/admin/policies` - Manage all policies
- `/admin/claims` - Review & approve claims
- `/admin/users` - User management
- `/admin/insurance-types` - Manage insurance products
- `/admin/reports` - Generate reports
- `/admin/audit-logs` - Audit trail

## Features Overview

### Customer Features
1. **Policy Purchase Wizard**
   - Select insurance type & subtype
   - Calculate premium with discounts
   - Enter policy details (vehicle/home)
   - Upload documents
   - Complete demo payment (mock system)

2. **Claims Management**
   - Initiate claim with wizard
   - Upload supporting documents
   - Track claim status
   - View claim history

3. **Dashboard**
   - Active policies overview
   - Recent claims
   - Payment history
   - Quick actions

### Admin Features
1. **Dashboard**
   - Key metrics & KPIs
   - Charts & analytics
   - Recent activities

2. **Claims Review**
   - Review submitted claims
   - Verify documents
   - Approve/reject with notes
   - Track claim lifecycle

3. **Policy Management**
   - View all policies
   - Manage insurance types & subtypes
   - Configure discounts & coupons

4. **Reports**
   - Generate custom reports
   - Export to PDF
   - Policy & claims analytics

5. **User Management**
   - View all users
   - Manage roles
   - Audit logs

## Security

- JWT token-based authentication
- HTTP interceptor for automatic token injection
- Route guards for role-based access
- Secure storage of sensitive data
- CORS configuration
- Mock payment system (no real payment processing)

## Payment System

The application uses a **MOCK payment system** for demonstration:
- No real payment gateway integration
- No API keys required
- "Complete Demo Payment" button simulates successful payment
- Perfect for development and demonstrations
- See `PAYMENT_SYSTEM.md` for details

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the SmartSure Insurance Management System.
