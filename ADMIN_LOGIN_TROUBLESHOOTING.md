# 🔧 Admin Login Troubleshooting Guide

**Issue:** Getting "Session expired. Please login again" when trying to login as admin

**Credentials Attempted:**
- Email: `admin@smartsure.com`
- Password: `Admin@123456`

---

## 🔍 Diagnosis Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login as admin
4. Look for these log messages:

**Expected logs:**
```
Login response: { token: "...", refreshToken: "...", role: "Admin" }
Profile response: { userId: "...", email: "...", fullName: "...", role: "..." }
Normalized user: { firstName: "...", lastName: "...", role: "Admin", ... }
User role: Admin
```

**If you see error logs:**
```
Error fetching profile: {...}
Error status: 401 or 404 or 500
Error message: ...
```

This tells us what's failing.

---

## 🚨 Common Issues & Solutions

### Issue 1: Admin User Doesn't Exist in Database

**Symptoms:**
- Login returns 401 Unauthorized
- OR Login succeeds but `/me` endpoint returns 404

**Solution:** Create admin user in database

**Option A: Using SQL Server Management Studio**
```sql
-- Check if admin user exists
SELECT * FROM Users WHERE Email = 'admin@smartsure.com';

-- If not exists, create admin user
INSERT INTO Users (UserId, Email, PasswordHash, FirstName, LastName, Role, PhoneNumber, IsEmailVerified, CreatedAt, UpdatedAt)
VALUES (
    NEWID(),
    'admin@smartsure.com',
    'HASHED_PASSWORD_HERE', -- You need to hash 'Admin@123456' using your backend's hash method
    'Admin',
    'User',
    'Admin',
    '1234567890',
    1,
    GETDATE(),
    GETDATE()
);
```

**Option B: Using Backend Registration**
1. Register a new user through the UI
2. Manually update the Role in database:
```sql
UPDATE Users 
SET Role = 'Admin' 
WHERE Email = 'your-email@example.com';
```

---

### Issue 2: Backend Not Running

**Symptoms:**
- Console shows network errors
- "ERR_CONNECTION_REFUSED"
- "Failed to fetch"

**Solution:** Start your backend services

```bash
# Navigate to backend directory
cd SmartSure-Insurance-Management-System-main/backend

# Start services (adjust based on your setup)
# Option 1: Using Docker
docker-compose up

# Option 2: Using dotnet
cd services/SmartSure.IdentityService
dotnet run
```

---

### Issue 3: Wrong API URL

**Symptoms:**
- 404 errors in console
- Requests going to wrong URL

**Solution:** Check environment.ts

File: `frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'  // ← Verify this matches your backend
};
```

**Common backend URLs:**
- `http://localhost:5000/api`
- `http://localhost:5001/api`
- `http://localhost:7000/api`
- `https://localhost:7001/api`

---

### Issue 4: CORS Issues

**Symptoms:**
- Console shows CORS errors
- "Access-Control-Allow-Origin" errors

**Solution:** Configure CORS in backend

Check your backend's `Program.cs` or `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ...

app.UseCors("AllowFrontend");
```

---

### Issue 5: Token/Role Issue

**Symptoms:**
- Login succeeds
- But immediately redirected to login
- Console shows role as undefined or null

**Solution:** Check login response

The backend should return:
```json
{
  "token": "eyJ...",
  "refreshToken": "...",
  "role": "Admin"  // ← This must be present
}
```

If role is missing, update your backend login endpoint to include it.

---

## 🔧 Quick Fixes

### Fix 1: Use Existing Customer Account as Admin

If you have a working customer account, convert it to admin:

1. Login to your database
2. Run:
```sql
UPDATE Users 
SET Role = 'Admin' 
WHERE Email = 'ayushibhutani15@gmail.com';  -- Your working customer email
```
3. Logout from frontend
4. Login again with same credentials
5. You'll now have admin access

---

### Fix 2: Check Backend Logs

Look at your backend console/logs for errors when you try to login:

**Common backend errors:**
- "User not found"
- "Invalid password"
- "Database connection failed"
- "JWT token generation failed"

---

### Fix 3: Verify Password Hash

The password in database must be hashed correctly:

```sql
-- Check password hash
SELECT Email, PasswordHash FROM Users WHERE Email = 'admin@smartsure.com';
```

The hash should look like:
- BCrypt: `$2a$10$...` (60 characters)
- SHA256: Long hex string
- PBKDF2: Base64 string

If it's plain text, that's the problem!

---

## 📝 Testing Checklist

After trying fixes, test in this order:

1. **Backend Health Check**
   ```
   http://localhost:5000/health
   ```
   Should return 200 OK

2. **Login Endpoint**
   ```
   POST http://localhost:5000/api/auth/login
   Body: { "email": "admin@smartsure.com", "password": "Admin@123456" }
   ```
   Should return token and role

3. **Profile Endpoint**
   ```
   GET http://localhost:5000/api/auth/me
   Headers: Authorization: Bearer YOUR_TOKEN
   ```
   Should return user profile with role

4. **Frontend Login**
   - Try logging in through UI
   - Check console for errors
   - Verify navigation to /admin/dashboard

---

## 🎯 Next Steps

### If Login Still Fails:

1. **Share Console Output**
   - Open DevTools (F12)
   - Go to Console tab
   - Try to login
   - Copy ALL error messages
   - Share them for debugging

2. **Check Network Tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Try to login
   - Look for failed requests (red)
   - Click on them to see details
   - Share the response

3. **Verify Database**
   ```sql
   -- Check if admin exists
   SELECT UserId, Email, Role, IsEmailVerified 
   FROM Users 
   WHERE Email = 'admin@smartsure.com';
   ```

---

## ✅ Success Indicators

You'll know it's working when:

1. **Console shows:**
   ```
   Login response: { token: "...", role: "Admin" }
   Profile response: { fullName: "Admin User", role: "Admin" }
   User role: Admin
   ```

2. **Navigation:**
   - Redirects to `/admin/dashboard`
   - Navbar shows: Dashboard | Analytics | Policies | Claims | Manage

3. **No Errors:**
   - No "Session expired" message
   - No 401 errors in console
   - No network failures

---

## 🆘 Still Need Help?

If none of these solutions work, provide:

1. **Console output** (all logs and errors)
2. **Network tab** (failed requests)
3. **Backend logs** (if accessible)
4. **Database query result:**
   ```sql
   SELECT * FROM Users WHERE Email = 'admin@smartsure.com';
   ```

This will help diagnose the exact issue!
