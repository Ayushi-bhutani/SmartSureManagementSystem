# Quick Demo Data Reference

## 🔑 Login Credentials

### Admin
```
Email: admin@smartsure.com
Password: Admin@123
```

### Test Customers (All have password: Demo@123)
```
1. rajesh.kumar@example.com
2. priya.sharma@example.com
3. amit.patel@example.com
4. sneha.reddy@example.com
5. vikram.singh@example.com
```

---

## 📊 Current Database State

### Users: 17
- 1 Admin
- 16 Customers

### Policies: 42
- 31 Vehicle Insurance
- 11 Home Insurance

### Claims: 10
- 2 Submitted (Ready for admin review ✅)
- 1 Under Review (Ready for admin action ✅)
- 2 Approved
- 4 Rejected
- 1 Closed

---

## 🎯 Quick Test Scenarios

### Scenario 1: Customer Buys Policy (5 min)
```
1. Login: test.customer@example.com / Test@123 (or register new)
2. Buy Policy → Vehicle Insurance
3. Vehicle Details:
   - Reg: MH01XY9999
   - Make: Maruti
   - Model: Swift
   - Year: 2023
4. Coverage: 300000
5. Pay with: 4111111111111111 / 123 / 12/25
6. ✅ Policy created!
```

### Scenario 2: Customer Submits Claim (3 min)
```
1. Login as customer (who has a policy)
2. My Claims → Initiate Claim
3. Select any Active policy
4. Claim Details:
   - Type: Accident
   - Date: Today
   - Location: Mumbai
   - Description: Minor damage
   - Amount: 15000
5. ✅ Claim submitted!
```

### Scenario 3: Admin Reviews Claim (2 min)
```
1. Login: admin@smartsure.com / Admin@123
2. Claims → Find "Submitted" or "UnderReview" claim
3. Click Review
4. Approve with note: "Verified and approved"
5. ✅ Claim approved!
```

### Scenario 4: Verify Real-Time Analytics (1 min)
```
1. Admin Dashboard → Note policy count
2. Customer buys new policy
3. Admin Dashboard → Refresh
4. ✅ Count increased!
```

---

## 🎬 30-Second Demo Flow

**"Let me show you the complete workflow:"**

1. **Customer Side** (15 sec)
   - Login as customer
   - "Buy a vehicle insurance policy"
   - Quick form fill → Payment → Done
   - "Submit a claim for this policy"

2. **Admin Side** (15 sec)
   - Login as admin
   - "Dashboard shows real-time data from database"
   - "Review and approve the claim"
   - "Analytics updates automatically"

**"The system uses microservices, RabbitMQ for events, and real-time database queries."**

---

## 💡 Interview Talking Points

### When showing Customer Dashboard:
- "JWT authentication with role-based access"
- "Customers can only see their own policies and claims"
- "Real-time premium calculation based on coverage"

### When showing Admin Dashboard:
- "All numbers are from SQL Server, not hardcoded"
- "Dashboard queries 3 separate databases (Identity, Policy, Claims)"
- "Microservices architecture with separate concerns"

### When approving a claim:
- "Admin actions trigger events via RabbitMQ"
- "Customer sees status update immediately"
- "Audit logs track all admin actions"

### When showing Analytics:
- "Charts use Chart.js with real data"
- "Data updates when new policies/claims are added"
- "Can demonstrate by adding a policy and refreshing"

---

## 🔧 Quick Fixes

### If you need more pending claims:
Login as any customer and submit a new claim - it will be in "Submitted" status.

### If analytics shows zeros:
Check AdminService is running on port 5002.

### If login fails:
Clear browser cache (Ctrl + Shift + Delete) and try again.

---

## 📱 Demo Checklist

Before starting demo:
- [ ] All services running
- [ ] Login as admin works
- [ ] Login as customer works  
- [ ] Dashboard shows real numbers (not zeros)
- [ ] At least 1-2 claims in "Submitted" status
- [ ] Browser cache cleared
- [ ] Close unnecessary tabs
- [ ] Have this reference open in another tab

---

## 🎯 Key Features to Highlight

1. ✅ **Full-stack application** - Angular + .NET Core
2. ✅ **Microservices architecture** - 4 separate services
3. ✅ **Real database integration** - SQL Server with 3 databases
4. ✅ **Event-driven** - RabbitMQ for service communication
5. ✅ **Role-based access** - Admin vs Customer features
6. ✅ **Real-time updates** - Dashboard reflects live data
7. ✅ **Complete workflow** - Registration → Policy → Claim → Approval
8. ✅ **Production patterns** - Error handling, validation, security

---

## 🚀 Impressive Demo Moments

1. **Show the architecture**: "4 microservices, each with its own database"
2. **Real-time update**: Buy policy → Refresh admin dashboard → Count increases
3. **End-to-end flow**: Customer submits claim → Admin approves → Customer sees update
4. **Analytics**: "All charts show real data from the database, not mock data"
5. **Code quality**: "Proper error handling, TypeScript types, async/await patterns"

Good luck! 🎉
