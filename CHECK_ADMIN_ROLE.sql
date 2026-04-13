-- ============================================
-- Check Admin User Role in Database
-- ============================================

-- Check if admin@smartsure.com exists and what role it has
SELECT 
    UserId,
    Email,
    Role,
    FirstName,
    LastName,
    IsEmailVerified,
    CreatedAt,
    UpdatedAt
FROM Users 
WHERE Email = 'admin@smartsure.com';

-- If the above returns NO ROWS, the user doesn't exist
-- If it returns a row with Role = 'Customer', you need to update it

-- ============================================
-- FIX: Update admin@smartsure.com to Admin role
-- ============================================

-- Run this to make admin@smartsure.com an admin
UPDATE Users 
SET Role = 'Admin',
    UpdatedAt = GETDATE()
WHERE Email = 'admin@smartsure.com';

-- Verify the update
SELECT 
    UserId,
    Email,
    Role,
    FirstName,
    LastName
FROM Users 
WHERE Email = 'admin@smartsure.com';

-- ============================================
-- Check all admin users
-- ============================================

SELECT 
    UserId,
    Email,
    Role,
    FirstName,
    LastName,
    IsEmailVerified
FROM Users 
WHERE Role = 'Admin';

-- ============================================
-- Alternative: Check ayushibhutani15@gmail.com
-- ============================================

SELECT 
    UserId,
    Email,
    Role,
    FirstName,
    LastName
FROM Users 
WHERE Email = 'ayushibhutani15@gmail.com';

-- If you want to make ayushibhutani15@gmail.com an admin instead:
-- UPDATE Users SET Role = 'Admin' WHERE Email = 'ayushibhutani15@gmail.com';
