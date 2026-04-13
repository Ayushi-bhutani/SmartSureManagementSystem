-- ============================================================================
-- SmartSure Demo Data Seeding Script - CORRECTED VERSION
-- Purpose: Populate database with realistic demo data
-- Database Names: SmartSure_Identity, SmartSure_Policy, SmartSure_Claims
-- ============================================================================

USE SmartSure_Identity;
GO

PRINT '🌱 Starting SmartSure Demo Data Seeding...';
PRINT '============================================================';

-- ============================================================================
-- STEP 1: Clean Existing Data (Keep Admin and Ayushi)
-- ============================================================================
PRINT '';
PRINT '🧹 Step 1: Cleaning existing data...';

-- Get admin and ayushi user IDs to preserve them
DECLARE @AdminUserId UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Email = 'admin@smartsure.com');
DECLARE @AyushiUserId UNIQUEIDENTIFIER = (SELECT UserId FROM Users WHERE Email = 'ayushibhutani15@gmail.com');

-- Delete claims (from Claims database)
USE SmartSure_Claims;
DELETE FROM ClaimStatusHistory;
DELETE FROM ClaimDocuments;
DELETE FROM Claims;
PRINT '   ✓ Deleted existing claims';

-- Delete policies (from Policy database)
USE SmartSure_Policy;
DELETE FROM Payments;
DELETE FROM VehicleDetails;
DELETE FROM HomeDetails;
DELETE FROM PolicyDetails;
DELETE FROM Policies;
PRINT '   ✓ Deleted existing policies';

-- Delete users except admin and ayushi (from Identity database)
USE SmartSure_Identity;
DELETE FROM OtpRecords WHERE UserId NOT IN (@AdminUserId, @AyushiUserId);
DELETE FROM ExternalLogins WHERE UserId NOT IN (@AdminUserId, @AyushiUserId);
DELETE FROM UserRoles WHERE UserId NOT IN (@AdminUserId, @AyushiUserId);
DELETE FROM Passwords WHERE UserId NOT IN (@AdminUserId, @AyushiUserId);
DELETE FROM Users WHERE UserId NOT IN (@AdminUserId, @AyushiUserId);
PRINT '   ✓ Deleted existing users (kept admin & ayushi)';

-- ============================================================================
-- STEP 2: Create Demo Users
-- ============================================================================
PRINT '';
PRINT '👥 Step 2: Creating demo users...';

USE SmartSure_Identity;

-- Get Customer role ID (check if it exists first)
DECLARE @CustomerRoleId UNIQUEIDENTIFIER = (SELECT RoleId FROM Roles WHERE RoleName = 'Customer');

-- If Customer role doesn't exist, create it
IF @CustomerRoleId IS NULL
BEGIN
    SET @CustomerRoleId = NEWID();
    INSERT INTO Roles (RoleId, RoleName) VALUES (@CustomerRoleId, 'Customer');
    PRINT '   ✓ Created Customer role';
END

DECLARE @PasswordHash NVARCHAR(MAX) = 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg='; -- Demo@123

-- Create 15 demo users
DECLARE @Users TABLE (
    UserId UNIQUEIDENTIFIER,
    FullName NVARCHAR(100),
    Email NVARCHAR(100),
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(500),
    CreatedAt DATETIME2
);

INSERT INTO @Users VALUES
(NEWID(), 'Rajesh Kumar', 'rajesh.kumar@example.com', '9876543210', '123 MG Road, Bangalore', DATEADD(DAY, -150, GETUTCDATE())),
(NEWID(), 'Priya Sharma', 'priya.sharma@example.com', '9876543211', '456 Park Street, Kolkata', DATEADD(DAY, -120, GETUTCDATE())),
(NEWID(), 'Amit Patel', 'amit.patel@example.com', '9876543212', '789 CG Road, Ahmedabad', DATEADD(DAY, -100, GETUTCDATE())),
(NEWID(), 'Sneha Reddy', 'sneha.reddy@example.com', '9876543213', '321 Banjara Hills, Hyderabad', DATEADD(DAY, -90, GETUTCDATE())),
(NEWID(), 'Vikram Singh', 'vikram.singh@example.com', '9876543214', '654 Connaught Place, Delhi', DATEADD(DAY, -80, GETUTCDATE())),
(NEWID(), 'Ananya Iyer', 'ananya.iyer@example.com', '9876543215', '987 Anna Salai, Chennai', DATEADD(DAY, -70, GETUTCDATE())),
(NEWID(), 'Rahul Verma', 'rahul.verma@example.com', '9876543216', '147 Civil Lines, Jaipur', DATEADD(DAY, -60, GETUTCDATE())),
(NEWID(), 'Kavya Nair', 'kavya.nair@example.com', '9876543217', '258 Marine Drive, Kochi', DATEADD(DAY, -50, GETUTCDATE())),
(NEWID(), 'Arjun Mehta', 'arjun.mehta@example.com', '9876543218', '369 FC Road, Pune', DATEADD(DAY, -45, GETUTCDATE())),
(NEWID(), 'Divya Gupta', 'divya.gupta@example.com', '9876543219', '741 Hazratganj, Lucknow', DATEADD(DAY, -40, GETUTCDATE())),
(NEWID(), 'Karthik Krishnan', 'karthik.k@example.com', '9876543220', '852 Whitefield, Bangalore', DATEADD(DAY, -35, GETUTCDATE())),
(NEWID(), 'Meera Joshi', 'meera.joshi@example.com', '9876543221', '963 Koregaon Park, Pune', DATEADD(DAY, -30, GETUTCDATE())),
(NEWID(), 'Sanjay Malhotra', 'sanjay.m@example.com', '9876543222', '159 Golf Course Road, Gurgaon', DATEADD(DAY, -25, GETUTCDATE())),
(NEWID(), 'Pooja Desai', 'pooja.desai@example.com', '9876543223', '357 Satellite, Ahmedabad', DATEADD(DAY, -20, GETUTCDATE())),
(NEWID(), 'Nikhil Rao', 'nikhil.rao@example.com', '9876543224', '486 Jubilee Hills, Hyderabad', DATEADD(DAY, -15, GETUTCDATE()));

-- Insert users
INSERT INTO Users (UserId, FullName, Email, PhoneNumber, Address, IsEmailVerified, IsGoogleAuth, CreatedAt)
SELECT UserId, FullName, Email, PhoneNumber, Address, 1, 0, CreatedAt
FROM @Users;

-- Insert passwords (using PassId not PasswordId)
INSERT INTO Passwords (PassId, UserId, PasswordHash)
SELECT NEWID(), UserId, @PasswordHash
FROM @Users;

-- Assign Customer role (using Id not UserRoleId)
INSERT INTO UserRoles (Id, UserId, RoleId)
SELECT NEWID(), UserId, @CustomerRoleId
FROM @Users;

DECLARE @UserCount INT = (SELECT COUNT(*) FROM @Users);
PRINT '   ✓ Created ' + CAST(@UserCount AS NVARCHAR) + ' demo users';
PRINT '   📝 All users have password: Demo@123';

-- ============================================================================
-- STEP 3: Create Demo Policies
-- ============================================================================
PRINT '';
PRINT '🏠🚗 Step 3: Creating demo policies...';

USE SmartSure_Policy;

-- Get insurance subtypes
DECLARE @VehicleSubtypes TABLE (SubtypeId UNIQUEIDENTIFIER);
DECLARE @HomeSubtypes TABLE (SubtypeId UNIQUEIDENTIFIER);

INSERT INTO @VehicleSubtypes
SELECT TOP 10 SubtypeId FROM InsuranceSubtypes 
WHERE TypeId = '11111111-1111-1111-1111-111111111111'; -- Vehicle Type ID

INSERT INTO @HomeSubtypes
SELECT TOP 5 SubtypeId FROM InsuranceSubtypes 
WHERE TypeId = '22222222-2222-2222-2222-222222222222'; -- Home Type ID

-- Create policies for each user (2-3 policies per user)
DECLARE @PolicyCounter INT = 0;
DECLARE @CurrentUserId UNIQUEIDENTIFIER;
DECLARE @CurrentUserCreatedAt DATETIME2;

DECLARE user_cursor CURSOR FOR 
SELECT UserId, CreatedAt FROM SmartSure_Identity.dbo.Users 
WHERE Email NOT IN ('admin@smartsure.com');

OPEN user_cursor;
FETCH NEXT FROM user_cursor INTO @CurrentUserId, @CurrentUserCreatedAt;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Create 2-3 policies per user
    DECLARE @NumPolicies INT = 2 + (ABS(CHECKSUM(NEWID())) % 2);
    DECLARE @PolicyNum INT = 0;
    
    WHILE @PolicyNum < @NumPolicies
    BEGIN
        DECLARE @PolicyId UNIQUEIDENTIFIER = NEWID();
        DECLARE @SubtypeId UNIQUEIDENTIFIER;
        DECLARE @PolicyType INT = ABS(CHECKSUM(NEWID())) % 2; -- 0=Vehicle, 1=Home
        DECLARE @Status NVARCHAR(50);
        DECLARE @StatusRand INT = ABS(CHECKSUM(NEWID())) % 10;
        
        -- 70% Active, 15% Pending, 10% Expired, 5% Cancelled
        SET @Status = CASE 
            WHEN @StatusRand < 7 THEN 'Active'
            WHEN @StatusRand < 8 THEN 'Pending'
            WHEN @StatusRand < 9 THEN 'Expired'
            ELSE 'Cancelled'
        END;
        
        -- Select subtype
        IF @PolicyType = 0 AND EXISTS(SELECT 1 FROM @VehicleSubtypes)
            SELECT TOP 1 @SubtypeId = SubtypeId FROM @VehicleSubtypes ORDER BY NEWID();
        ELSE IF EXISTS(SELECT 1 FROM @HomeSubtypes)
            SELECT TOP 1 @SubtypeId = SubtypeId FROM @HomeSubtypes ORDER BY NEWID();
        ELSE
            SELECT TOP 1 @SubtypeId = SubtypeId FROM InsuranceSubtypes ORDER BY NEWID();
        
        DECLARE @StartDate DATETIME2 = DATEADD(DAY, -(ABS(CHECKSUM(NEWID())) % 300 + 30), GETUTCDATE());
        DECLARE @EndDate DATETIME2 = DATEADD(YEAR, 1, @StartDate);
        DECLARE @PremiumAmount DECIMAL(18,2) = 5000 + (ABS(CHECKSUM(NEWID())) % 45000);
        DECLARE @IDV DECIMAL(18,2) = @PremiumAmount * (20 + (ABS(CHECKSUM(NEWID())) % 30));
        
        -- Insert Policy
        INSERT INTO Policies (PolicyId, UserId, SubtypeId, StartDate, EndDate, PremiumAmount, InsuredDeclaredValue, Status, ApprovedClaimsCount, IsTerminated, InvoiceGeneratedAt, CreatedAt, NomineeName, NomineeRelation)
        VALUES (
            @PolicyId,
            @CurrentUserId,
            @SubtypeId,
            @StartDate,
            @EndDate,
            @PremiumAmount,
            @IDV,
            @Status,
            0,
            0,
            CASE WHEN @Status = 'Active' THEN DATEADD(HOUR, 2, @StartDate) ELSE NULL END,
            @StartDate,
            'Nominee ' + CAST(@PolicyNum AS NVARCHAR),
            CASE (ABS(CHECKSUM(NEWID())) % 4) WHEN 0 THEN 'Spouse' WHEN 1 THEN 'Parent' WHEN 2 THEN 'Child' ELSE 'Sibling' END
        );
        
        -- Insert Policy Detail (using DocumentId, TermsAndConditions, Inclusions, Exclusions)
        INSERT INTO PolicyDetails (DocumentId, PolicyId, TermsAndConditions, Inclusions, Exclusions)
        VALUES (NEWID(), @PolicyId, 'Standard terms and conditions apply', 'Comprehensive coverage', 'Pre-existing conditions');
        
        -- Insert Vehicle or Home details
        IF @PolicyType = 0 -- Vehicle
        BEGIN
            INSERT INTO VehicleDetails (VehicleDetailId, PolicyId, Make, Model, ManufactureYear, RegistrationNumber, ChassisNumber, EngineNumber, EstimatedValue)
            VALUES (
                NEWID(),
                @PolicyId,
                CASE (ABS(CHECKSUM(NEWID())) % 5) WHEN 0 THEN 'Maruti Suzuki' WHEN 1 THEN 'Hyundai' WHEN 2 THEN 'Tata' WHEN 3 THEN 'Honda' ELSE 'Toyota' END,
                CASE (ABS(CHECKSUM(NEWID())) % 5) WHEN 0 THEN 'Swift' WHEN 1 THEN 'i20' WHEN 2 THEN 'Nexon' WHEN 3 THEN 'City' ELSE 'Fortuner' END,
                2018 + (ABS(CHECKSUM(NEWID())) % 6),
                'KA' + CAST((10 + ABS(CHECKSUM(NEWID())) % 89) AS NVARCHAR) + 'AB' + CAST((1000 + ABS(CHECKSUM(NEWID())) % 8999) AS NVARCHAR),
                'CH' + SUBSTRING(CAST(NEWID() AS NVARCHAR(36)), 1, 15),
                'EN' + SUBSTRING(CAST(NEWID() AS NVARCHAR(36)), 1, 12),
                @IDV
            );
        END
        ELSE -- Home
        BEGIN
            DECLARE @AreaSqFt DECIMAL(18,2) = 800 + (ABS(CHECKSUM(NEWID())) % 2200);
            DECLARE @CostPerSqFt DECIMAL(18,2) = 3000 + (ABS(CHECKSUM(NEWID())) % 7000);
            
            INSERT INTO HomeDetails (HomeDetailId, PolicyId, PropertyType, Address, YearBuilt, EstimatedValue, SecurityFeatures, AreaSqFt, ConstructionCostPerSqFt)
            VALUES (
                NEWID(),
                @PolicyId,
                CASE (ABS(CHECKSUM(NEWID())) % 3) WHEN 0 THEN 'Apartment' WHEN 1 THEN 'Villa' ELSE 'Independent House' END,
                CAST((1 + ABS(CHECKSUM(NEWID())) % 999) AS NVARCHAR) + ' Main Road, City',
                2000 + (ABS(CHECKSUM(NEWID())) % 23),
                @IDV,
                'CCTV, Alarm System',
                @AreaSqFt,
                @CostPerSqFt
            );
        END;
        
        -- Insert Payment if Active (using TransactionReference not TransactionId)
        IF @Status = 'Active'
        BEGIN
            INSERT INTO Payments (PaymentId, PolicyId, Amount, PaymentMethod, Status, TransactionReference, PaymentDate)
            VALUES (
                NEWID(),
                @PolicyId,
                @PremiumAmount,
                CASE (ABS(CHECKSUM(NEWID())) % 3) WHEN 0 THEN 'Card' WHEN 1 THEN 'UPI' ELSE 'NetBanking' END,
                'Completed',
                'TXN' + SUBSTRING(CAST(NEWID() AS NVARCHAR(36)), 1, 12),
                DATEADD(HOUR, 1, @StartDate)
            );
        END;
        
        SET @PolicyCounter = @PolicyCounter + 1;
        SET @PolicyNum = @PolicyNum + 1;
    END;
    
    FETCH NEXT FROM user_cursor INTO @CurrentUserId, @CurrentUserCreatedAt;
END;

CLOSE user_cursor;
DEALLOCATE user_cursor;

PRINT '   ✓ Created ' + CAST(@PolicyCounter AS NVARCHAR) + ' policies';

-- ============================================================================
-- STEP 4: Create Demo Claims
-- ============================================================================
PRINT '';
PRINT '📝 Step 4: Creating demo claims...';

USE SmartSure_Claims;

DECLARE @ClaimCounter INT = 0;
DECLARE @PolicyId2 UNIQUEIDENTIFIER;
DECLARE @PolicyUserId UNIQUEIDENTIFIER;
DECLARE @PolicyStartDate DATETIME2;
DECLARE @PolicyPremium DECIMAL(18,2);

-- Create claims for 40% of active policies
DECLARE policy_cursor CURSOR FOR 
SELECT TOP 40 PERCENT PolicyId, UserId, StartDate, PremiumAmount 
FROM SmartSure_Policy.dbo.Policies 
WHERE Status = 'Active'
ORDER BY NEWID();

OPEN policy_cursor;
FETCH NEXT FROM policy_cursor INTO @PolicyId2, @PolicyUserId, @PolicyStartDate, @PolicyPremium;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @ClaimId UNIQUEIDENTIFIER = NEWID();
    DECLARE @ClaimStatus NVARCHAR(50);
    DECLARE @ClaimStatusRand INT = ABS(CHECKSUM(NEWID())) % 10;
    
    -- Status distribution
    SET @ClaimStatus = CASE 
        WHEN @ClaimStatusRand < 2 THEN 'Submitted'
        WHEN @ClaimStatusRand < 4 THEN 'UnderReview'
        WHEN @ClaimStatusRand < 7 THEN 'Approved'
        WHEN @ClaimStatusRand < 9 THEN 'Rejected'
        ELSE 'Closed'
    END;
    
    DECLARE @ClaimAmount DECIMAL(18,2) = @PolicyPremium * (2 + (ABS(CHECKSUM(NEWID())) % 8));
    DECLARE @ApprovedAmount DECIMAL(18,2) = CASE WHEN @ClaimStatus = 'Approved' THEN @ClaimAmount * (0.7 + (ABS(CHECKSUM(NEWID())) % 30) / 100.0) ELSE NULL END;
    DECLARE @ClaimDate DATETIME2 = DATEADD(DAY, (10 + ABS(CHECKSUM(NEWID())) % 290), @PolicyStartDate);
    DECLARE @ClaimType NVARCHAR(50) = CASE (ABS(CHECKSUM(NEWID())) % 6) 
        WHEN 0 THEN 'Accident' 
        WHEN 1 THEN 'Theft' 
        WHEN 2 THEN 'Fire' 
        WHEN 3 THEN 'Natural Disaster' 
        WHEN 4 THEN 'Damage' 
        ELSE 'Medical' 
    END;
    
    -- Insert Claim
    INSERT INTO Claims (ClaimId, PolicyId, UserId, Description, Status, ClaimAmount, ApprovedAmount, RejectionReason, ClaimType, IsCompletelyDamaged, CreatedAt, UpdatedAt)
    VALUES (
        @ClaimId,
        @PolicyId2,
        @PolicyUserId,
        CASE @ClaimType
            WHEN 'Accident' THEN 'Vehicle involved in road accident. Front bumper damaged.'
            WHEN 'Theft' THEN 'Vehicle stolen from parking area. Police complaint filed.'
            WHEN 'Fire' THEN 'Property damaged due to electrical fire.'
            WHEN 'Natural Disaster' THEN 'Damage caused by heavy rainfall.'
            WHEN 'Damage' THEN 'Accidental damage to property.'
            ELSE 'Medical expenses for treatment.'
        END,
        @ClaimStatus,
        @ClaimAmount,
        @ApprovedAmount,
        CASE WHEN @ClaimStatus = 'Rejected' THEN 'Insufficient documentation' ELSE NULL END,
        @ClaimType,
        CASE WHEN (ABS(CHECKSUM(NEWID())) % 10) < 2 THEN 1 ELSE 0 END,
        @ClaimDate,
        DATEADD(DAY, (1 + ABS(CHECKSUM(NEWID())) % 14), @ClaimDate)
    );
    
    -- Insert Status History (using Id, OldStatus, NewStatus, Notes)
    INSERT INTO ClaimStatusHistory (Id, ClaimId, OldStatus, NewStatus, Notes, ChangedBy, ChangedAt)
    VALUES (
        NEWID(),
        @ClaimId,
        'Draft',
        @ClaimStatus,
        'Claim ' + LOWER(@ClaimStatus),
        'System',
        DATEADD(DAY, (1 + ABS(CHECKSUM(NEWID())) % 14), @ClaimDate)
    );
    
    -- Update policy approved claims count if approved
    IF @ClaimStatus = 'Approved'
    BEGIN
        UPDATE SmartSure_Policy.dbo.Policies 
        SET ApprovedClaimsCount = ApprovedClaimsCount + 1 
        WHERE PolicyId = @PolicyId2;
    END;
    
    SET @ClaimCounter = @ClaimCounter + 1;
    FETCH NEXT FROM policy_cursor INTO @PolicyId2, @PolicyUserId, @PolicyStartDate, @PolicyPremium;
END;

CLOSE policy_cursor;
DEALLOCATE policy_cursor;

PRINT '   ✓ Created ' + CAST(@ClaimCounter AS NVARCHAR) + ' claims';

-- ============================================================================
-- Summary
-- ============================================================================
PRINT '';
PRINT '============================================================';
PRINT '✅ Demo data seeding completed successfully!';
PRINT '';
PRINT '📊 Summary:';

-- Get counts for summary
DECLARE @TotalUsers INT = (SELECT COUNT(*) FROM SmartSure_Identity.dbo.Users WHERE Email NOT IN ('admin@smartsure.com'));
DECLARE @TotalPolicies INT = (SELECT COUNT(*) FROM SmartSure_Policy.dbo.Policies);
DECLARE @TotalClaims INT = (SELECT COUNT(*) FROM SmartSure_Claims.dbo.Claims);

PRINT '   - Users: ' + CAST(@TotalUsers AS NVARCHAR);
PRINT '   - Policies: ' + CAST(@TotalPolicies AS NVARCHAR);
PRINT '   - Claims: ' + CAST(@TotalClaims AS NVARCHAR);
PRINT '';
PRINT '📝 Demo User Credentials:';
PRINT '   Email: rajesh.kumar@example.com (or any from the list)';
PRINT '   Password: Demo@123';
PRINT '';
PRINT '👨‍💼 Admin Credentials:';
PRINT '   Email: admin@smartsure.com';
PRINT '   Password: Admin@123';
PRINT '';
PRINT '🎉 Your database is ready for an impressive demo!';
GO
