# 🚀 How to Run the Demo Data Seed Script

## Quick Answer
**Run the SQL script in SQL Server Management Studio (SSMS)**

---

## Step-by-Step Instructions

### 1. Open SQL Server Management Studio (SSMS)
- Find SSMS in your Start Menu
- Or search for "SQL Server Management Studio"

### 2. Connect to Your SQL Server
- Server name: `Mera_hai\SQLEXPRESS` (from your appsettings.json)
- Authentication: Windows Authentication
- Click "Connect"

### 3. Open the SQL Script
- In SSMS, go to: **File → Open → File**
- Navigate to: `SmartSure-Insurance-Management-System-main/backend/seed-demo-data.sql`
- Click "Open"

### 4. Execute the Script
- Press **F5** or click the "Execute" button (green play icon)
- Wait for completion (10-30 seconds)

### 5. Verify Success
You should see output like:
```
🌱 Starting SmartSure Demo Data Seeding...
============================================================

🧹 Step 1: Cleaning existing data...
   ✓ Deleted existing claims
   ✓ Deleted existing policies
   ✓ Deleted existing users (kept admin & ayushi)

👥 Step 2: Creating demo users...
   ✓ Created 15 demo users
   📝 All users have password: Demo@123

🏠🚗 Step 3: Creating demo policies...
   ✓ Created 30-45 policies

📝 Step 4: Creating demo claims...
   ✓ Created 12-18 claims

============================================================
✅ Demo data seeding completed successfully!

📊 Summary:
   - Users: 15-16
   - Policies: 30-45
   - Claims: 12-18

📝 Demo User Credentials:
   Email: Any user from rajesh.kumar@example.com to nikhil.rao@example.com
   Password: Demo@123

👨‍💼 Admin Credentials:
   Email: admin@smartsure.com
   Password: Admin@123

🎉 Your database is ready for an impressive demo!
```

---

## What This Script Does

### ✅ Preserves
- Admin account (admin@smartsure.com)
- Your existing customer account (ayushibhutani15@gmail.com)

### 🗑️ Deletes
- All other existing users
- All existing policies
- All existing claims

### ➕ Creates
- **15 new demo users** with realistic Indian names and addresses
- **30-45 policies** (2-3 per user) across Vehicle and Home insurance
- **12-18 claims** with various statuses (Submitted, Under Review, Approved, Rejected, Closed)
- **Payment records** for all active policies
- **Vehicle/Home details** for respective policies

---

## Database Names

The script works with these three databases:
- `SmartSure_Identity` - User accounts and authentication
- `SmartSure_Policy` - Policies, payments, vehicle/home details
- `SmartSure_Claims` - Claims and claim history

---

## After Running the Script

### Test the Data

1. **Login as Admin:**
   - Go to: http://localhost:4200/auth/login
   - Email: `admin@smartsure.com`
   - Password: `Admin@123`
   - You should see real statistics in the admin dashboard

2. **Login as Demo Customer:**
   - Email: `rajesh.kumar@example.com` (or any from the list)
   - Password: `Demo@123`
   - You should see policies and claims

3. **Check Analytics Dashboard:**
   - Login as admin
   - Navigate to Analytics
   - All 4 charts should display with real data

---

## Troubleshooting

### Error: "Cannot open database"
**Solution:** Make sure all three databases exist. Run migrations first:
```bash
cd backend/services/SmartSure.IdentityService
dotnet ef database update

cd ../SmartSure.PolicyService
dotnet ef database update

cd ../SmartSure.ClaimsService
dotnet ef database update
```

### Error: "Invalid object name"
**Solution:** The table names might be different. Check your actual database tables in SSMS:
- Expand Databases → SmartSure_Identity → Tables
- Expand Databases → SmartSure_Policy → Tables
- Expand Databases → SmartSure_Claims → Tables

### Error: "Cannot insert duplicate key"
**Solution:** Some users already exist. Either:
1. Delete existing users manually first, or
2. Change the email addresses in the script

### Script runs but no data appears
**Solution:**
1. Check for error messages in the SSMS output
2. Verify the databases are correct
3. Make sure you're connected to the right SQL Server instance

---

## Verification Queries

After running the script, verify the data:

```sql
-- Check users
USE SmartSure_Identity;
SELECT COUNT(*) as TotalUsers FROM Users;
-- Should return: 16-17 (admin + ayushi + 15 demo users)

-- Check policies
USE SmartSure_Policy;
SELECT Status, COUNT(*) as Count FROM Policies GROUP BY Status;
-- Should show: Active, Pending, Expired, Cancelled

-- Check claims
USE SmartSure_Claims;
SELECT Status, COUNT(*) as Count FROM Claims GROUP BY Status;
-- Should show: Submitted, UnderReview, Approved, Rejected, Closed
```

---

## Need to Start Fresh?

To remove all demo data and run the script again:

The script automatically cleans existing data before creating new data, so you can just run it again!

---

## Important Notes

1. **Backup First:** If you have important data, backup your databases before running
2. **Admin Preserved:** Your admin account will NOT be deleted
3. **Ayushi Preserved:** The ayushibhutani15@gmail.com account will NOT be deleted
4. **Password:** All demo users have the same password: `Demo@123`
5. **Real Data:** This creates actual database records, not mock data

---

## Summary

1. Open SSMS
2. Connect to `Mera_hai\SQLEXPRESS`
3. Open `seed-demo-data.sql`
4. Press F5
5. Wait for success message
6. Test by logging in

That's it! Your database now has impressive demo data for your interview presentation. 🎉
