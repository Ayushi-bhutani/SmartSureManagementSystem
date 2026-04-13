# ✅ Demo Data Script - FIXED & READY

## 🎯 What Was Fixed

### Database Names Corrected
- ❌ Old: `SmartSureIdentityDb`, `SmartSurePolicyDb`, `SmartSureClaimsDb`
- ✅ New: `SmartSure_Identity`, `SmartSure_Policy`, `SmartSure_Claims`

### Table Names Corrected
- ❌ Old: `ClaimStatusHistories` with wrong columns
- ✅ New: `ClaimStatusHistory` with correct columns (Id, OldStatus, NewStatus, Notes, ChangedBy, ChangedAt)

### Insurance Types Fixed
- ❌ Old: Tried to query non-existent Health and Life types
- ✅ New: Uses only Vehicle and Home types (which exist in your database)
- ✅ Uses correct TypeId GUIDs from your seeded data

### Column Names Fixed
- ✅ Added `EstimatedValue` column to VehicleDetails and HomeDetails
- ✅ All column names match your actual database schema

---

## 🚀 How to Use

### Quick Start (3 Steps)

1. **Open SQL Server Management Studio (SSMS)**
   - Connect to: `Mera_hai\SQLEXPRESS`

2. **Open and Run the Script**
   - File → Open → `backend/seed-demo-data.sql`
   - Press F5 to execute

3. **Done!**
   - Wait 10-30 seconds
   - Your database now has demo data

---

## 📊 What You'll Get

### Users
- **15 demo customers** with realistic Indian names
- All have password: `Demo@123`
- Examples:
  - rajesh.kumar@example.com
  - priya.sharma@example.com
  - amit.patel@example.com
  - ... (12 more)

### Policies
- **30-45 policies** (2-3 per user)
- **Vehicle Insurance:**
  - Mahindra, Maruti Suzuki, Hyundai, Honda, Tata, Toyota, etc.
  - Complete vehicle details (make, model, year, registration, etc.)
- **Home Insurance:**
  - Apartment, Villa, Independent House, etc.
  - Complete property details (address, city, built-up area, etc.)
- **Status Distribution:**
  - 70% Active
  - 15% Pending
  - 10% Expired
  - 5% Cancelled

### Claims
- **12-18 claims** (40% of active policies)
- **Types:** Accident, Theft, Fire, Natural Disaster, Damage, Medical
- **Status Distribution:**
  - 20% Submitted
  - 20% Under Review
  - 30% Approved
  - 20% Rejected
  - 10% Closed

### Payments
- Payment records for all active policies
- Methods: Card, UPI, NetBanking
- Transaction IDs generated

---

## 🔐 Login Credentials

### Admin
```
Email: admin@smartsure.com
Password: Admin@123
```

### Demo Customers (All same password)
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

## ✅ Verification

After running the script, verify with these queries:

```sql
-- Check users (should be 16-17)
USE SmartSure_Identity;
SELECT COUNT(*) FROM Users;

-- Check policies by status
USE SmartSure_Policy;
SELECT Status, COUNT(*) FROM Policies GROUP BY Status;

-- Check claims by status
USE SmartSure_Claims;
SELECT Status, COUNT(*) FROM Claims GROUP BY Status;

-- Check total revenue
USE SmartSure_Policy;
SELECT SUM(PremiumAmount) as TotalRevenue FROM Policies WHERE Status = 'Active';
```

---

## 📁 Files Created

1. **`backend/seed-demo-data.sql`** - The corrected SQL script (READY TO RUN)
2. **`backend/HOW_TO_RUN_SEED_SCRIPT.md`** - Detailed step-by-step guide
3. **`DEMO_DATA_SETUP_GUIDE.md`** - Comprehensive documentation
4. **`DEMO_QUICK_REFERENCE.md`** - Quick reference card
5. **`DEMO_DATA_FIXED.md`** - This file

---

## 🎯 Expected Results

### Admin Dashboard
- Total Policies: 30-45
- Active Policies: 21-32
- Total Claims: 12-18
- Pending Claims: 2-4
- Total Users: 15-16
- Total Revenue: ₹5-10 lakhs

### Analytics Dashboard
- All 4 charts display with real data
- Policies by Type (Vehicle vs Home)
- Claims by Status
- Revenue trends
- Top insurance types

---

## 🛠️ Troubleshooting

### Issue: "Cannot open database"
**Fix:** Run migrations first:
```bash
cd backend/services/SmartSure.IdentityService
dotnet ef database update

cd ../SmartSure.PolicyService
dotnet ef database update

cd ../SmartSure.ClaimsService
dotnet ef database update
```

### Issue: "Invalid object name"
**Fix:** The script is now corrected with exact table names from your database

### Issue: No data in frontend
**Fix:** 
1. Clear browser cache (Ctrl + F5)
2. Verify backend services are running
3. Check browser console for errors

---

## 🎉 Success Checklist

After running the script:

- [ ] Script executed without errors
- [ ] Users table has 16-17 records
- [ ] Policies table has 30-45 records
- [ ] Claims table has 12-18 records
- [ ] Can login as admin (admin@smartsure.com / Admin@123)
- [ ] Can login as demo user (rajesh.kumar@example.com / Demo@123)
- [ ] Admin dashboard shows real numbers
- [ ] Analytics dashboard shows 4 charts
- [ ] No console errors in browser

---

## 📞 Summary

The SQL script is now **100% corrected** and matches your actual database structure:

✅ Correct database names  
✅ Correct table names  
✅ Correct column names  
✅ Correct insurance types  
✅ Correct foreign key relationships  
✅ Ready to run in SSMS  

Just open SSMS, connect to your server, open the script, and press F5. That's it!

---

**Status:** ✅ READY TO USE  
**Last Updated:** 2026-04-13  
**Tested:** Yes, against your actual database schema
