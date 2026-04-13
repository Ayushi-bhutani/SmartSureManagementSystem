# SmartSure Testing Guide for Interview Demo

## 📋 Demo Accounts

### Admin Account
- **Email:** admin@smartsure.com
- **Password:** Admin@123
- **Role:** Administrator

### Customer Accounts (From Seed Data)
Pick any of these for testing:

1. **Rajesh Kumar**
   - Email: rajesh.kumar@example.com
   - Password: Demo@123

2. **Priya Sharma**
   - Email: priya.sharma@example.com
   - Password: Demo@123

3. **Amit Patel**
   - Email: amit.patel@example.com
   - Password: Demo@123

4. **Ayushi Bhutani** (Your original account)
   - Email: ayushibhutani15@gmail.com
   - Password: (Your password)

---

## 🎯 Complete Testing Workflow

### Part 1: Customer Journey (15 minutes)

#### 1.1 Register New Customer
```
1. Go to: http://localhost:4200/auth/register
2. Fill in:
   - Full Name: Test Customer
   - Email: test.customer@example.com
   - Phone: 9876543210
   - Address: 123 Test Street, Mumbai
   - Password: Test@123
   - Confirm Password: Test@123
3. Click "Register"
4. ✅ Verify: Registration success message
```

#### 1.2 Login as Customer
```
1. Go to: http://localhost:4200/auth/login
2. Login with: test.customer@example.com / Test@123
3. ✅ Verify: Redirected to customer dashboard
4. ✅ Verify: See welcome message with customer name
```

#### 1.3 Buy Vehicle Insurance Policy
```
1. Click "Buy Policy" in navbar
2. Select: Vehicle Insurance
3. Fill in Vehicle Details:
   - Registration Number: MH01AB1234
   - Make: Honda
   - Model: City
   - Manufacture Year: 2022
   - Engine Number: ENG123456
   - Chassis Number: CHS789012
   - Seating Capacity: 5
4. Fill in Policy Details:
   - Coverage Amount: 500000
   - Start Date: (Today's date)
   - End Date: (1 year from today)
5. Click "Calculate Premium"
6. ✅ Verify: Premium amount displayed
7. Click "Proceed to Payment"
8. Fill Payment Details:
   - Card Number: 4111111111111111
   - CVV: 123
   - Expiry: 12/25
9. Click "Pay Now"
10. ✅ Verify: Payment success
11. ✅ Verify: Policy created with "Active" status
```

#### 1.4 View My Policies
```
1. Click "My Policies" in navbar
2. ✅ Verify: See the newly created policy
3. Click on the policy to view details
4. ✅ Verify: All policy information displayed correctly
5. ✅ Verify: Can download policy document
```

#### 1.5 Submit a Claim
```
1. Click "My Claims" in navbar
2. Click "Initiate New Claim"
3. Select the policy you just created
4. Fill in Claim Details:
   - Claim Type: Accident
   - Incident Date: (Recent date)
   - Incident Location: Mumbai Highway
   - Description: Minor accident, front bumper damage
   - Claim Amount: 25000
5. Upload documents (optional - use any image/PDF)
6. Click "Submit Claim"
7. ✅ Verify: Claim submitted successfully
8. ✅ Verify: Claim status is "Pending"
```

#### 1.6 View Claim Status
```
1. Go to "My Claims"
2. ✅ Verify: See the submitted claim
3. Click on claim to view details
4. ✅ Verify: Claim details displayed
5. ✅ Verify: Status shows "Pending"
```

---

### Part 2: Admin Journey (15 minutes)

#### 2.1 Login as Admin
```
1. Logout from customer account
2. Go to: http://localhost:4200/auth/login
3. Login with: admin@smartsure.com / Admin@123
4. ✅ Verify: Redirected to admin dashboard
5. ✅ Verify: See admin menu options
```

#### 2.2 View Dashboard Statistics
```
1. On Admin Dashboard
2. ✅ Verify: Total Policies count (should show 43 or more)
3. ✅ Verify: Pending Claims count (should show 5 or more)
4. ✅ Verify: Total Users count (should show 18 or more)
5. ✅ Verify: Total Revenue displayed
6. ✅ Verify: Recent claims table populated
```

#### 2.3 Review and Approve Claim
```
1. Click "Claims" in navbar
2. ✅ Verify: See list of all claims
3. Find the claim you submitted as customer
4. Click "Review" or click on the claim
5. Review claim details:
   - Customer information
   - Policy details
   - Claim amount
   - Description
   - Documents (if uploaded)
6. Click "Approve" button
7. Add admin notes: "Claim verified and approved"
8. Click "Confirm Approval"
9. ✅ Verify: Claim status changed to "Approved"
10. ✅ Verify: Success message displayed
```

#### 2.4 Reject a Claim (Optional)
```
1. Go to Claims list
2. Find a "Pending" claim
3. Click "Review"
4. Click "Reject" button
5. Add rejection reason: "Insufficient documentation"
6. Click "Confirm Rejection"
7. ✅ Verify: Claim status changed to "Rejected"
```

#### 2.5 View Analytics Dashboard
```
1. Click "Analytics" in navbar
2. ✅ Verify: See real-time data:
   - 42 Active Policies (or current count)
   - 17 Total Users (or current count)
   - Claim Approval Rate (calculated from real data)
   - Average Claim Amount
3. ✅ Verify: Charts display:
   - Policies by Type (Vehicle vs Home)
   - Claims by Status (Pending, Approved, Rejected)
   - Revenue Trend
   - User Growth
4. ✅ Verify: Top Insurance Types list
```

#### 2.6 Manage Users
```
1. Click "Manage" → "Users"
2. ✅ Verify: See list of all registered users
3. Click on a user to view details
4. ✅ Verify: User information displayed
5. ✅ Verify: Can see user's policies and claims count
```

#### 2.7 Manage Policies
```
1. Click "Policies" in navbar
2. ✅ Verify: See all policies from all customers
3. Use filters:
   - Filter by Status: Active
   - Filter by Type: Vehicle
4. ✅ Verify: Filtered results displayed
5. Click on a policy to view details
6. ✅ Verify: Full policy information shown
```

#### 2.8 Generate Reports
```
1. Click "Manage" → "Reports"
2. Click "Generate New Report"
3. Select Report Type: "Claims Report"
4. Set Date Range: Last 30 days
5. Click "Generate"
6. ✅ Verify: Report generated successfully
7. ✅ Verify: Can view report details
8. ✅ Verify: Can download report as PDF
```

#### 2.9 View Audit Logs
```
1. Click "Manage" → "Audit Logs"
2. ✅ Verify: See system activity logs
3. ✅ Verify: Logs show:
   - User registrations
   - Policy creations
   - Claim submissions
   - Admin actions (approvals/rejections)
4. Use filters to search specific actions
```

---

### Part 3: Verify Real-Time Updates (5 minutes)

#### 3.1 Test Dashboard Updates
```
1. Note current statistics on admin dashboard
2. Open new browser window (incognito)
3. Login as customer (test.customer@example.com)
4. Buy another policy
5. Go back to admin window
6. Refresh admin dashboard
7. ✅ Verify: Policy count increased by 1
8. ✅ Verify: Revenue increased
```

#### 3.2 Test Claim Workflow
```
1. As customer: Submit new claim
2. Switch to admin window
3. Refresh claims page
4. ✅ Verify: New claim appears in pending list
5. Approve the claim
6. Switch to customer window
7. Refresh "My Claims" page
8. ✅ Verify: Claim status updated to "Approved"
```

---

## 🎬 Interview Demo Script (10 minutes)

### Opening (1 min)
"I've built SmartSure, a full-stack insurance management system using Angular, .NET Core microservices, and SQL Server. Let me walk you through the key features."

### Customer Flow (4 min)
1. **Registration & Login** (30 sec)
   - "Users can register and login securely with JWT authentication"
   - Show registration → login

2. **Buy Policy** (2 min)
   - "Customers can purchase insurance policies with real-time premium calculation"
   - Select Vehicle Insurance → Fill details → Calculate premium → Payment
   - "Payment integration with validation"

3. **Submit Claim** (1.5 min)
   - "Customers can submit claims against their policies"
   - Go to My Claims → Initiate Claim → Fill details → Submit
   - "Claims are tracked with status updates"

### Admin Flow (4 min)
1. **Dashboard** (1 min)
   - Login as admin
   - "Admin dashboard shows real-time analytics from the database"
   - Point out: Total policies, pending claims, revenue
   - "All data is fetched from SQL Server, not hardcoded"

2. **Claim Management** (2 min)
   - Go to Claims
   - "Admin can review and approve/reject claims"
   - Click on pending claim → Review details → Approve
   - "Status updates in real-time across the system"

3. **Analytics** (1 min)
   - Go to Analytics Dashboard
   - "Real-time charts and metrics"
   - "Data updates automatically when new policies/claims are added"
   - Show: Policies by type, Claims by status, Revenue trend

### Technical Highlights (1 min)
- "Microservices architecture with separate services for Identity, Policy, Claims, and Admin"
- "RabbitMQ for event-driven communication between services"
- "Angular with Material Design for responsive UI"
- "SQL Server with Entity Framework Core"
- "JWT authentication with role-based access control"

---

## 📊 Current Database State

After running the seed script, you have:

### Users: 17 total
- 1 Admin (admin@smartsure.com)
- 1 Your account (ayushibhutani15@gmail.com)
- 15 Demo users (rajesh.kumar@example.com, etc.)

### Policies: 42 total
- 31 Vehicle Insurance policies
- 11 Home Insurance policies
- Mix of Active, Pending, and Expired statuses

### Claims: 12 total
- 4 Pending (ready for admin review)
- 5 Approved
- 3 Rejected

---

## 🐛 Troubleshooting

### If claims don't show up:
```sql
-- Run in SQL Server Management Studio
USE SmartSure_Claims;
SELECT * FROM Claims;
```

### If policies don't show up:
```sql
USE SmartSure_Policy;
SELECT * FROM Policies;
```

### If analytics shows zeros:
1. Check AdminService is running (port 5002)
2. Check browser console for API errors
3. Verify DashboardController is querying databases

### Clear notifications:
```javascript
// In browser console (F12)
localStorage.removeItem('smartsure_notifications');
location.reload();
```

---

## ✅ Pre-Demo Checklist

- [ ] All backend services running (Identity, Policy, Claims, Admin, Gateway)
- [ ] RabbitMQ running
- [ ] SQL Server running with all 3 databases
- [ ] Frontend running (ng serve)
- [ ] Seed data loaded (17 users, 42 policies, 12 claims)
- [ ] Test login with admin account
- [ ] Test login with customer account
- [ ] Verify analytics dashboard shows real data
- [ ] Clear browser cache (Ctrl + F5)
- [ ] Close unnecessary browser tabs
- [ ] Have SQL Server Management Studio ready (optional)

---

## 🎯 Key Points to Emphasize

1. **Real Data Integration**: "All numbers you see are from the actual database, not mock data"
2. **Microservices**: "Each service has its own database and communicates via RabbitMQ"
3. **Role-Based Access**: "Different features for admin vs customer"
4. **Real-Time Updates**: "When I approve a claim, the customer sees it immediately"
5. **Production-Ready**: "Proper error handling, validation, and security"

Good luck with your interview! 🚀
