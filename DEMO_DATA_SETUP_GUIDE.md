# 🎯 SmartSure Demo Data Setup Guide

## Overview
This guide will help you populate your SmartSure database with realistic demo data for an impressive interview presentation. The data includes:

- **15 realistic customer users** with Indian names and addresses
- **30-45 diverse policies** across Vehicle, Home, Health, and Life insurance
- **12-18 claims** with various statuses (Submitted, Under Review, Approved, Rejected)
- **Real payment records** for active policies
- **Comprehensive analytics data** for impressive dashboard visualization

---

## 🚀 Quick Start (Recommended)

### Option 1: Run SQL Script (Fastest)

1. **Open SQL Server Management Studio (SSMS)**

2. **Connect to your SQL Server instance**

3. **Open the SQL script:**
   ```
   backend/seed-demo-data.sql
   ```

4. **Execute the script** (F5 or click Execute)

5. **Wait for completion** (should take 10-30 seconds)

6. **Verify the output** - you should see:
   ```
   ✅ Demo data seeding completed successfully!
   📊 Summary:
      - Users: 15
      - Policies: 30-45
      - Claims: 12-18
   ```

---

## 📋 What Gets Created

### 👥 Demo Users (15 users)

All users have the same password: `Demo@123`

| Name | Email | Location |
|------|-------|----------|
| Rajesh Kumar | rajesh.kumar@example.com | Bangalore, Karnataka |
| Priya Sharma | priya.sharma@example.com | Kolkata, West Bengal |
| Amit Patel | amit.patel@example.com | Ahmedabad, Gujarat |
| Sneha Reddy | sneha.reddy@example.com | Hyderabad, Telangana |
| Vikram Singh | vikram.singh@example.com | New Delhi |
| Ananya Iyer | ananya.iyer@example.com | Chennai, Tamil Nadu |
| Rahul Verma | rahul.verma@example.com | Jaipur, Rajasthan |
| Kavya Nair | kavya.nair@example.com | Kochi, Kerala |
| Arjun Mehta | arjun.mehta@example.com | Pune, Maharashtra |
| Divya Gupta | divya.gupta@example.com | Lucknow, Uttar Pradesh |
| Karthik Krishnan | karthik.k@example.com | Bangalore, Karnataka |
| Meera Joshi | meera.joshi@example.com | Pune, Maharashtra |
| Sanjay Malhotra | sanjay.m@example.com | Gurgaon, Haryana |
| Pooja Desai | pooja.desai@example.com | Ahmedabad, Gujarat |
| Nikhil Rao | nikhil.rao@example.com | Hyderabad, Telangana |

### 🏠🚗 Policies (2-3 per user)

**Distribution:**
- 70% Active policies
- 15% Pending policies
- 10% Expired policies
- 5% Cancelled policies

**Types:**
- Vehicle Insurance (Cars, Bikes, SUVs)
- Home Insurance (Apartments, Villas, Houses)
- Health Insurance
- Life Insurance

**Premium Range:** ₹5,000 - ₹50,000 per policy

### 📝 Claims (40% of active policies)

**Status Distribution:**
- 20% Submitted
- 20% Under Review
- 30% Approved
- 20% Rejected
- 10% Closed

**Claim Types:**
- Accident
- Theft
- Fire
- Natural Disaster
- Damage
- Medical

---

## 🎨 Analytics Dashboard Impact

After seeding, your admin analytics dashboard will show:

### Key Metrics
- **Total Policies:** 30-45 policies
- **Active Policies:** ~25-30 policies
- **Total Claims:** 12-18 claims
- **Pending Claims:** 2-4 claims
- **Claim Approval Rate:** ~30-40%
- **Total Revenue:** ₹5-10 lakhs

### Charts & Visualizations
- **Policy Distribution by Type:** Pie chart with 4 segments
- **Claims by Status:** Doughnut chart with 5 segments
- **Monthly Revenue Trend:** Line chart with 6 months data
- **Top Insurance Types:** Bar chart with policy counts

---

## 🔍 Verification Steps

### 1. Check Users
```sql
USE SmartSureIdentityDb;
SELECT COUNT(*) as TotalUsers FROM Users WHERE Email NOT IN ('admin@smartsure.com');
-- Should return: 15 (or 16 if ayushi exists)
```

### 2. Check Policies
```sql
USE SmartSurePolicyDb;
SELECT Status, COUNT(*) as Count 
FROM Policies 
GROUP BY Status;
-- Should show: Active, Pending, Expired, Cancelled
```

### 3. Check Claims
```sql
USE SmartSureClaimsDb;
SELECT Status, COUNT(*) as Count 
FROM Claims 
GROUP BY Status;
-- Should show: Submitted, UnderReview, Approved, Rejected, Closed
```

### 4. Test Login
1. Go to `http://localhost:4200/auth/login`
2. Login with any demo user:
   - Email: `rajesh.kumar@example.com`
   - Password: `Demo@123`
3. Verify you see policies and claims in the dashboard

### 5. Test Admin Dashboard
1. Login as admin:
   - Email: `admin@smartsure.com`
   - Password: `Admin@123`
2. Go to Admin Dashboard
3. Verify statistics show real numbers
4. Go to Analytics Dashboard
5. Verify all 4 charts display with real data

---

## 🛠️ Troubleshooting

### Issue: Script fails with "Database not found"
**Solution:** Make sure all three databases exist:
- `SmartSureIdentityDb`
- `SmartSurePolicyDb`
- `SmartSureClaimsDb`

Run migrations first:
```bash
cd backend/services/SmartSure.IdentityService
dotnet ef database update

cd ../SmartSure.PolicyService
dotnet ef database update

cd ../SmartSure.ClaimsService
dotnet ef database update
```

### Issue: "Customer role not found"
**Solution:** Make sure the Identity service has been initialized with roles:
```sql
USE SmartSureIdentityDb;
SELECT * FROM Roles;
-- Should show: Admin, Customer
```

If roles don't exist, run the Identity service once to initialize them.

### Issue: No insurance types/subtypes
**Solution:** Make sure insurance types are seeded:
```sql
USE SmartSurePolicyDb;
SELECT * FROM InsuranceTypes;
SELECT * FROM InsuranceSubtypes;
```

If empty, you need to seed insurance types first through the admin panel or API.

### Issue: Analytics dashboard shows "No data"
**Solution:** 
1. Clear browser cache (Ctrl + F5)
2. Logout and login again as admin
3. Check browser console for API errors
4. Verify backend services are running

---

## 🎯 Interview Presentation Tips

### 1. Start with Admin Dashboard
- Show impressive statistics with real numbers
- Highlight the analytics dashboard with charts
- Demonstrate filtering and search capabilities

### 2. Show User Management
- Display the list of 15+ users
- Show user details and activity
- Demonstrate user search and filtering

### 3. Demonstrate Policy Management
- Show diverse policy types
- Filter by status (Active, Pending, etc.)
- Show policy details with vehicle/home information

### 4. Showcase Claims Processing
- Show claims in different statuses
- Demonstrate claim review workflow
- Show claim approval/rejection process

### 5. Highlight Analytics
- Point out the visual charts
- Explain the metrics and KPIs
- Show trend analysis over time

---

## 📊 Data Statistics

After seeding, you'll have approximately:

| Metric | Count | Notes |
|--------|-------|-------|
| Total Users | 15-16 | Excluding admin |
| Total Policies | 30-45 | 2-3 per user |
| Active Policies | 21-32 | ~70% of total |
| Total Claims | 12-18 | ~40% of active policies |
| Approved Claims | 4-6 | ~30% of claims |
| Total Premium Revenue | ₹5-10 lakhs | Sum of all active policies |
| Vehicle Policies | 8-15 | ~30% of policies |
| Home Policies | 8-15 | ~30% of policies |
| Health Policies | 7-10 | ~20% of policies |
| Life Policies | 7-10 | ~20% of policies |

---

## 🔐 Login Credentials Summary

### Admin Account
- **Email:** admin@smartsure.com
- **Password:** Admin@123
- **Role:** Admin
- **Access:** Full system access

### Demo Customer Accounts
- **Email:** Any from the list above (e.g., rajesh.kumar@example.com)
- **Password:** Demo@123
- **Role:** Customer
- **Access:** Customer portal only

### Original Customer (Preserved)
- **Email:** ayushibhutani15@gmail.com
- **Password:** (Your original password)
- **Role:** Customer
- **Note:** This account is preserved with all its data

---

## 🧹 Clean Up (If Needed)

If you want to remove demo data and start fresh:

```sql
-- WARNING: This will delete all demo data!

USE SmartSureClaimsDb;
DELETE FROM ClaimStatusHistories;
DELETE FROM ClaimDocuments;
DELETE FROM Claims;

USE SmartSurePolicyDb;
DELETE FROM Payments;
DELETE FROM VehicleDetails;
DELETE FROM HomeDetails;
DELETE FROM PolicyDetails;
DELETE FROM Policies;

USE SmartSureIdentityDb;
DECLARE @AdminId UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Email = 'admin@smartsure.com');
DECLARE @AyushiId UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Email = 'ayushibhutani15@gmail.com');

DELETE FROM OtpRecords WHERE UserId NOT IN (@AdminId, @AyushiId);
DELETE FROM UserRoles WHERE UserId NOT IN (@AdminId, @AyushiId);
DELETE FROM Passwords WHERE UserId NOT IN (@AdminId, @AyushiId);
DELETE FROM Users WHERE UserId NOT IN (@AdminId, @AyushiId);
```

---

## ✅ Success Checklist

Before your interview, verify:

- [ ] All 15 demo users can login with `Demo@123`
- [ ] Admin dashboard shows real statistics (not zeros)
- [ ] Analytics dashboard displays all 4 charts
- [ ] Policy list shows 30+ policies with various statuses
- [ ] Claims list shows 12+ claims with different statuses
- [ ] User management shows 15+ users
- [ ] All charts and graphs render without errors
- [ ] No console errors in browser DevTools
- [ ] Backend services are running without errors
- [ ] Database queries execute successfully

---

## 🎉 You're Ready!

Your SmartSure system is now populated with realistic demo data that will impress interviewers. The analytics dashboard will show meaningful insights, and you can demonstrate the full functionality of the system with real-looking data.

**Good luck with your interview! 🚀**

---

## 📞 Need Help?

If you encounter any issues:

1. Check the console logs in browser DevTools (F12)
2. Check backend service logs
3. Verify all services are running
4. Ensure database connections are working
5. Try clearing browser cache and restarting services

Remember: The demo data is designed to showcase the system's capabilities. Feel free to customize the script to add more data or adjust the distribution based on your presentation needs.
