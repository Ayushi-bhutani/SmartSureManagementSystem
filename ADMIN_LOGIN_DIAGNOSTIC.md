# 🔍 Admin Login Diagnostic Guide

## Current Issue
Getting "Session expired. Please login again" OR "Unable to fetch user profile" when trying to login as admin.

**Credentials:** `admin@smartsure.com` / `Admin@123456`

---

## 🎯 Enhanced Logging Added

The auth service now has comprehensive logging. When you try to login, you'll see detailed console output:

### Expected Console Output (Successful Login)

```
🔐 Starting login for: admin@smartsure.com
✅ Login response received: { token: "...", refreshToken: "...", role: "Admin" }
📝 Token length: 500
👤 Role from login: Admin
💾 Temporary user stored, fetching full profile...
🔄 Calling getProfile() to fetch full user details...
📞 Calling GET /auth/me endpoint...
🔑 Using token: eyJhbGciOiJodHRwOi8v...
✅ Profile response received: { userId: "...", email: "...", fullName: "Admin User", role: "Admin" }
✅ Normalized user: { firstName: "Admin", lastName: "User", role: "Admin", ... }
👤 User role: Admin
📧 User email: admin@smartsure.com
```

### Error Scenarios

#### Scenario 1: Login Fails (Wrong Credentials)
```
🔐 Starting login for: admin@smartsure.com
🔴 HTTP Error Interceptor caught error: { url: ".../auth/login", status: 401 }
❌ Login flow error: HttpErrorResponse
❌ Error status: 401
```
**Meaning:** Admin user doesn't exist OR password is wrong

#### Scenario 2: Login Succeeds, Profile Fetch Fails
```
🔐 Starting login for: admin@smartsure.com
✅ Login response received: { token: "...", role: "Admin" }
💾 Temporary user stored, fetching full profile...
🔄 Calling getProfile() to fetch full user details...
📞 Calling GET /auth/me endpoint...
❌ GET /auth/me FAILED
❌ Error status: 401
🚨 401 UNAUTHORIZED - Possible causes:
   1. Token is invalid or malformed
   2. Token expired immediately (check backend token expiry)
   3. User does not exist in database
   4. Backend /auth/me endpoint requires different authentication
```
**Meaning:** Login worked but token is invalid for fetching profile

#### Scenario 3: Backend Not Running
```
🔐 Starting login for: admin@smartsure.com
🔴 HTTP Error Interceptor caught error: { status: 0 }
🔴 Network Error - Backend might be down
```
**Meaning:** Cannot connect to backend

---

## 📋 Step-by-Step Diagnostic Process

### Step 1: Open Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Clear console (trash icon)
4. Try to login as admin
5. Read ALL the console output

### Step 2: Identify the Error Pattern

Match your console output to one of these patterns:

#### Pattern A: "🔐 Starting login" → "❌ Login flow error" with status 401
**Problem:** Login endpoint is rejecting credentials
**Solutions:**
- Admin user doesn't exist in database
- Password is incorrect
- Email is incorrect

**Action:** Check database for admin user

#### Pattern B: "✅ Login response" → "❌ GET /auth/me FAILED" with status 401
**Problem:** Token is valid for login but not for profile fetch
**Solutions:**
- Token might be malformed
- Backend /auth/me endpoint has different auth requirements
- User exists for login but not in Users table

**Action:** Check backend logs and token validation

#### Pattern C: "🔴 Network Error"
**Problem:** Cannot connect to backend
**Solutions:**
- Backend is not running
- Wrong API URL in environment.ts
- CORS issue

**Action:** Start backend and verify URL

---

## 🔧 Solutions Based on Error Pattern

### Solution 1: Create Admin User in Database

If you see Pattern A (login fails with 401):

```sql
-- Check if admin exists
SELECT * FROM Users WHERE Email = 'admin@smartsure.com';

-- If no results, admin doesn't exist
-- You need to create the admin user with proper password hash
```

**Option A: Use existing customer as admin**
```sql
-- Convert your working customer account to admin
UPDATE Users 
SET Role = 'Admin' 
WHERE Email = 'ayushibhutani15@gmail.com';
```

Then login with: `ayushibhutani15@gmail.com` / (your customer password)

**Option B: Create new admin user**

You need to hash the password first. Run this in your backend:

```csharp
// In a test controller or console app
var hashedPassword = BCrypt.Net.BCrypt.HashPassword("Admin@123456");
Console.WriteLine(hashedPassword);
```

Then insert into database:
```sql
INSERT INTO Users (UserId, Email, PasswordHash, FirstName, LastName, Role, PhoneNumber, IsEmailVerified, CreatedAt, UpdatedAt)
VALUES (
    NEWID(),
    'admin@smartsure.com',
    'YOUR_HASHED_PASSWORD_HERE',
    'Admin',
    'User',
    'Admin',
    '1234567890',
    1,
    GETDATE(),
    GETDATE()
);
```

### Solution 2: Check Backend Token Generation

If you see Pattern B (login succeeds but profile fails):

1. Check backend logs when you try to login
2. Look for token generation logs
3. Verify token expiry time is not 0 or negative
4. Check if /auth/me endpoint is working:

```bash
# Test the endpoint directly
curl -X GET http://localhost:5057/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Solution 3: Start Backend

If you see Pattern C (network error):

```bash
# Navigate to backend directory
cd SmartSure-Insurance-Management-System-main/backend

# Check if services are running
# If using Docker:
docker-compose ps

# If not running:
docker-compose up -d

# If using dotnet directly:
cd services/SmartSure.IdentityService
dotnet run
```

Verify backend is accessible:
```bash
curl http://localhost:5057/health
```

---

## 🎯 Quick Test: Use Customer Account as Admin

The fastest way to test admin functionality:

1. **Update database:**
```sql
UPDATE Users 
SET Role = 'Admin' 
WHERE Email = 'ayushibhutani15@gmail.com';
```

2. **Logout from frontend** (if logged in)

3. **Login with customer credentials:**
   - Email: `ayushibhutani15@gmail.com`
   - Password: (your customer password)

4. **You should now see admin dashboard**

This confirms:
- ✅ Login flow works
- ✅ Token generation works
- ✅ Profile fetch works
- ✅ Role-based routing works

If this works, the issue is specifically with the `admin@smartsure.com` account not existing or having wrong password.

---

## 📊 What to Share for Further Help

If still not working, share this info:

1. **Complete console output** (copy all logs from browser console)

2. **Network tab details:**
   - Open DevTools → Network tab
   - Try to login
   - Look for failed requests (red)
   - Click on them and share:
     - Request URL
     - Request Headers
     - Response Status
     - Response Body

3. **Database query result:**
```sql
SELECT UserId, Email, Role, IsEmailVerified, CreatedAt 
FROM Users 
WHERE Email IN ('admin@smartsure.com', 'ayushibhutani15@gmail.com');
```

4. **Backend logs** (if accessible)

5. **Environment configuration:**
```typescript
// From frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'YOUR_API_URL_HERE'
};
```

---

## ✅ Success Checklist

You'll know it's working when you see:

- [ ] Console shows: `🔐 Starting login for: admin@smartsure.com`
- [ ] Console shows: `✅ Login response received`
- [ ] Console shows: `👤 Role from login: Admin`
- [ ] Console shows: `✅ Profile response received`
- [ ] Console shows: `👤 User role: Admin`
- [ ] Browser navigates to `/admin/dashboard`
- [ ] No error toasts appear
- [ ] Admin navbar shows: Dashboard | Analytics | Policies | Claims | Manage

---

## 🚀 Next Steps

1. **Try to login as admin**
2. **Open browser console (F12)**
3. **Read the console output carefully**
4. **Match it to one of the patterns above**
5. **Apply the corresponding solution**
6. **Share console output if still stuck**

The enhanced logging will tell us exactly where the problem is!
