# 📊 SmartSure Demo Data Documentation

## Overview

This directory contains scripts to populate your SmartSure database with realistic demo data for presentations and testing.

## Files

### 1. `seed-demo-data.sql`
**Purpose:** SQL script to populate database with demo data  
**Execution Time:** 10-30 seconds  
**What it does:**
- Cleans existing data (preserves admin and ayushi)
- Creates 15 demo customer users
- Creates 30-45 policies across different types
- Creates 12-18 claims with various statuses
- Adds payment records for active policies

**How to run:**
```sql
-- Open in SQL Server Management Studio (SSMS)
-- Connect to your SQL Server instance
-- Execute the script (F5)
```

### 2. `SeedDemoData.cs`
**Purpose:** C# class for programmatic data seeding  
**Use case:** If you want to integrate seeding into your application  
**Note:** Requires configuration of DbContext connection strings

## Data Created

### Users (15)
- All users have password: `Demo@123`
- Realistic Indian names and addresses
- Verified email addresses
- Customer role assigned
- Created dates spread over 6 months

### Policies (30-45)
- **Distribution:**
  - 70% Active
  - 15% Pending
  - 10% Expired
  - 5% Cancelled

- **Types:**
  - Vehicle Insurance (Cars, Bikes, SUVs)
  - Home Insurance (Apartments, Villas, Houses)
  - Health Insurance
  - Life Insurance

- **Details:**
  - Premium: ₹5,000 - ₹50,000
  - IDV: 20-50x premium
  - Nominee information
  - Payment records for active policies
  - Vehicle/Home specific details

### Claims (12-18)
- **Status Distribution:**
  - 20% Submitted
  - 20% Under Review
  - 30% Approved
  - 20% Rejected
  - 10% Closed

- **Types:**
  - Accident
  - Theft
  - Fire
  - Natural Disaster
  - Damage
  - Medical

- **Details:**
  - Claim amount: 2-10x premium
  - Approved amount: 70-100% of claim (for approved claims)
  - Status history
  - Realistic descriptions

## Database Schema

### SmartSureIdentityDb
```
Users
├── UserId (PK)
├── FullName
├── Email
├── PhoneNumber
├── Address
├── IsEmailVerified
└── CreatedAt

Passwords
├── PasswordId (PK)
├── UserId (FK)
├── PasswordHash
└── CreatedAt

UserRoles
├── UserRoleId (PK)
├── UserId (FK)
├── RoleId (FK)
└── AssignedAt
```

### SmartSurePolicyDb
```
Policies
├── PolicyId (PK)
├── UserId (FK)
├── SubtypeId (FK)
├── StartDate
├── EndDate
├── PremiumAmount
├── InsuredDeclaredValue
├── Status
├── ApprovedClaimsCount
└── CreatedAt

VehicleDetails
├── VehicleDetailId (PK)
├── PolicyId (FK)
├── VehicleType
├── Make
├── Model
├── Year
├── RegistrationNumber
└── ...

HomeDetails
├── HomeDetailId (PK)
├── PolicyId (FK)
├── PropertyType
├── Address
├── City
├── State
└── ...

Payments
├── PaymentId (PK)
├── PolicyId (FK)
├── Amount
├── PaymentMethod
├── Status
└── TransactionId
```

### SmartSureClaimsDb
```
Claims
├── ClaimId (PK)
├── PolicyId (FK)
├── UserId (FK)
├── Description
├── Status
├── ClaimAmount
├── ApprovedAmount
├── ClaimType
└── CreatedAt

ClaimStatusHistories
├── StatusHistoryId (PK)
├── ClaimId (FK)
├── Status
├── ChangedBy
├── Remarks
└── ChangedAt
```

## Verification Queries

### Check User Count
```sql
USE SmartSureIdentityDb;
SELECT COUNT(*) as TotalUsers 
FROM Users 
WHERE Email NOT IN ('admin@smartsure.com', 'ayushibhutani15@gmail.com');
-- Expected: 15
```

### Check Policy Distribution
```sql
USE SmartSurePolicyDb;
SELECT 
    Status,
    COUNT(*) as Count,
    CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2)) as Percentage
FROM Policies
GROUP BY Status
ORDER BY Count DESC;
```

### Check Claim Statistics
```sql
USE SmartSureClaimsDb;
SELECT 
    Status,
    COUNT(*) as Count,
    AVG(ClaimAmount) as AvgAmount,
    SUM(CASE WHEN ApprovedAmount IS NOT NULL THEN ApprovedAmount ELSE 0 END) as TotalApproved
FROM Claims
GROUP BY Status
ORDER BY Count DESC;
```

### Check Revenue
```sql
USE SmartSurePolicyDb;
SELECT 
    SUM(PremiumAmount) as TotalRevenue,
    AVG(PremiumAmount) as AvgPremium,
    COUNT(*) as TotalPolicies
FROM Policies
WHERE Status = 'Active';
```

### Check User Activity
```sql
USE SmartSureIdentityDb;
SELECT 
    u.FullName,
    u.Email,
    (SELECT COUNT(*) FROM SmartSurePolicyDb.dbo.Policies WHERE UserId = u.UserId) as PolicyCount,
    (SELECT COUNT(*) FROM SmartSureClaimsDb.dbo.Claims WHERE UserId = u.UserId) as ClaimCount
FROM Users u
WHERE u.Email NOT IN ('admin@smartsure.com')
ORDER BY PolicyCount DESC;
```

## Clean Up

To remove all demo data and start fresh:

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
DELETE FROM ExternalLogins WHERE UserId NOT IN (@AdminId, @AyushiId);
DELETE FROM UserRoles WHERE UserId NOT IN (@AdminId, @AyushiId);
DELETE FROM Passwords WHERE UserId NOT IN (@AdminId, @AyushiId);
DELETE FROM Users WHERE UserId NOT IN (@AdminId, @AyushiId);
```

## Customization

### Add More Users
Edit the `@Users` table variable in the SQL script:
```sql
INSERT INTO @Users VALUES
(NEWID(), 'Your Name', 'your.email@example.com', '9876543225', 'Your Address', DATEADD(DAY, -10, GETUTCDATE()));
```

### Adjust Policy Distribution
Modify the status probability in the script:
```sql
-- Current: 70% Active, 15% Pending, 10% Expired, 5% Cancelled
-- Change the CASE statement to adjust distribution
SET @Status = CASE 
    WHEN @StatusRand < 7 THEN 'Active'  -- Change 7 to adjust Active %
    WHEN @StatusRand < 8 THEN 'Pending' -- Change 8 to adjust Pending %
    ...
END;
```

### Change Claim Distribution
Modify the claim creation percentage:
```sql
-- Current: 40% of active policies have claims
-- Change TOP 40 PERCENT to adjust
SELECT TOP 40 PERCENT PolicyId, UserId, StartDate, PremiumAmount 
FROM SmartSurePolicyDb.dbo.Policies 
WHERE Status = 'Active'
```

## Best Practices

1. **Always backup** your database before running seeding scripts
2. **Test in development** environment first
3. **Verify data** after seeding using verification queries
4. **Document changes** if you customize the script
5. **Keep admin account** safe - never delete it

## Troubleshooting

### Issue: Foreign Key Constraint Error
**Cause:** Insurance types/subtypes don't exist  
**Solution:** Seed insurance types first through admin panel

### Issue: Role Not Found
**Cause:** Customer role doesn't exist  
**Solution:** Run Identity service once to initialize roles

### Issue: Duplicate Email
**Cause:** Users already exist with same emails  
**Solution:** Run clean up script first, then seed again

### Issue: Script Timeout
**Cause:** Large dataset or slow server  
**Solution:** Increase query timeout in SSMS (Tools → Options → Query Execution)

## Performance Notes

- Script uses transactions for data integrity
- Indexes are maintained automatically
- Execution time scales linearly with data size
- Recommended to run during off-peak hours in production

## Security Notes

- All passwords are hashed using SHA256
- Demo password is intentionally simple: `Demo@123`
- In production, enforce strong password policies
- Never commit real user data to version control

## Support

For issues or questions:
1. Check the main documentation: `DEMO_DATA_SETUP_GUIDE.md`
2. Review verification queries above
3. Check backend service logs
4. Verify database connections

---

**Last Updated:** 2026-04-13  
**Version:** 1.0  
**Compatibility:** SmartSure v1.0+
