# 🎯 SmartSure Demo Quick Reference Card

## 🚀 Quick Setup (3 Steps)

### 1. Run SQL Script
```bash
# Open SSMS and execute:
backend/seed-demo-data.sql
```

### 2. Start Backend Services
```bash
# Terminal 1 - Identity Service
cd backend/services/SmartSure.IdentityService
dotnet run

# Terminal 2 - Policy Service
cd backend/services/SmartSure.PolicyService
dotnet run

# Terminal 3 - Claims Service
cd backend/services/SmartSure.ClaimsService
dotnet run

# Terminal 4 - Admin Service
cd backend/services/SmartSure.AdminService
dotnet run

# Terminal 5 - Gateway
cd backend/gateway/SmartSure.Gateway
dotnet run
```

### 3. Start Frontend
```bash
cd frontend
npm start
# or
ng serve
```

---

## 🔐 Login Credentials

### Admin
```
Email: admin@smartsure.com
Password: Admin@123
```

### Demo Customers (All use same password)
```
Password: Demo@123

Emails:
- rajesh.kumar@example.com
- priya.sharma@example.com
- amit.patel@example.com
- sneha.reddy@example.com
- vikram.singh@example.com
- ananya.iyer@example.com
- rahul.verma@example.com
- kavya.nair@example.com
- arjun.mehta@example.com
- divya.gupta@example.com
- karthik.k@example.com
- meera.joshi@example.com
- sanjay.m@example.com
- pooja.desai@example.com
- nikhil.rao@example.com
```

---

## 📊 Expected Data After Seeding

| Metric | Value |
|--------|-------|
| Total Users | 15-16 |
| Total Policies | 30-45 |
| Active Policies | 21-32 |
| Total Claims | 12-18 |
| Approved Claims | 4-6 |
| Premium Revenue | ₹5-10 lakhs |

---

## 🎯 Interview Demo Flow

### 1. Admin Dashboard (2 min)
- Login as admin
- Show statistics cards with real numbers
- Highlight quick actions
- Show recent claims table

### 2. Analytics Dashboard (3 min)
- Navigate to Analytics
- Show 4 charts with real data:
  - Policies by Type (Doughnut)
  - Claims by Status (Pie)
  - Revenue Trend (Line)
  - Top Insurance Types (Bar)
- Explain key metrics

### 3. User Management (2 min)
- Navigate to Manage Users
- Show list of 15+ users
- Demonstrate search/filter
- Show user details

### 4. Policy Management (3 min)
- Navigate to Policies
- Show diverse policy types
- Filter by status
- Show policy details with vehicle/home info

### 5. Claims Processing (3 min)
- Navigate to Claims
- Show claims in different statuses
- Open a claim for review
- Demonstrate approval workflow

### 6. Customer Portal (2 min)
- Logout from admin
- Login as demo customer
- Show customer dashboard
- Show policies and claims

---

## 🔍 Quick Verification

### Check Data in Database
```sql
-- Users
USE SmartSureIdentityDb;
SELECT COUNT(*) FROM Users; -- Should be 16-17

-- Policies
USE SmartSurePolicyDb;
SELECT Status, COUNT(*) FROM Policies GROUP BY Status;

-- Claims
USE SmartSureClaimsDb;
SELECT Status, COUNT(*) FROM Claims GROUP BY Status;
```

### Check Frontend
1. Open `http://localhost:4200`
2. Login as admin
3. Check Admin Dashboard shows numbers > 0
4. Check Analytics shows 4 charts
5. No console errors (F12)

---

## 🛠️ Troubleshooting

### Issue: "Session Expired" on Admin Login
**Fix:** Clear browser cache (Ctrl + F5) and try again

### Issue: Analytics shows "No data"
**Fix:** 
1. Verify SQL script ran successfully
2. Check backend services are running
3. Clear browser cache

### Issue: Charts not rendering
**Fix:**
1. Check browser console for errors
2. Verify Chart.js is loaded
3. Hard refresh (Ctrl + F5)

### Issue: Backend connection error
**Fix:**
1. Verify all 5 backend services are running
2. Check ports: 5001, 5002, 5003, 5004, 5000
3. Check SQL Server is running

---

## 📱 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Gateway | http://localhost:5000 |
| Identity Service | http://localhost:5001 |
| Policy Service | http://localhost:5002 |
| Claims Service | http://localhost:5003 |
| Admin Service | http://localhost:5004 |

---

## 🎨 Key Features to Highlight

### Technical Stack
- ✅ Microservices Architecture (.NET 8)
- ✅ Angular 18 Frontend
- ✅ SQL Server Database
- ✅ JWT Authentication
- ✅ API Gateway (Ocelot)
- ✅ Real-time Analytics
- ✅ Responsive Design (Material UI)

### Business Features
- ✅ Multi-type Insurance (Vehicle, Home, Health, Life)
- ✅ Claims Management Workflow
- ✅ User Management
- ✅ Payment Integration
- ✅ Analytics Dashboard
- ✅ Role-based Access Control
- ✅ Document Management
- ✅ Audit Logging

### Security Features
- ✅ JWT Token Authentication
- ✅ Role-based Authorization
- ✅ Password Hashing
- ✅ Secure API Communication
- ✅ CORS Configuration
- ✅ Input Validation

---

## 💡 Interview Tips

### When Showing Admin Dashboard
- "As you can see, we have **30+ active policies** across different insurance types"
- "The system is currently managing **15+ customers** with real-time data"
- "Our claim approval rate is around **30-40%** with proper review workflow"

### When Showing Analytics
- "These charts are dynamically generated from real database data"
- "We can see the distribution of policies across **4 major insurance types**"
- "The revenue trend shows consistent growth over the past months"

### When Showing Claims
- "Claims go through a proper workflow: Submitted → Under Review → Approved/Rejected"
- "Each claim has complete audit trail with status history"
- "Admins can review claims with all supporting documents"

### When Asked About Scalability
- "The microservices architecture allows independent scaling of services"
- "Each service has its own database for data isolation"
- "API Gateway handles load balancing and routing"

### When Asked About Security
- "JWT tokens with role-based access control"
- "Passwords are hashed using SHA256"
- "All API endpoints are protected with authentication"

---

## ✅ Pre-Interview Checklist

- [ ] SQL script executed successfully
- [ ] All 5 backend services running
- [ ] Frontend running on port 4200
- [ ] Admin login works
- [ ] Customer login works
- [ ] Admin dashboard shows real data
- [ ] Analytics dashboard shows 4 charts
- [ ] No console errors
- [ ] All pages load without errors
- [ ] Database has 15+ users, 30+ policies, 12+ claims

---

## 🎉 You're Ready!

**Remember:**
- Be confident about the architecture
- Explain the business logic clearly
- Highlight the real-time data
- Show the complete workflow
- Mention scalability and security

**Good luck! 🚀**
