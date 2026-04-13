# 🔧 Admin Dashboard Not Showing - FIX

## Problem Identified ✅

You're seeing the customer dashboard even though you're logged in as admin because:

1. You updated the role in the **database** to "Admin"
2. But the user object in **localStorage** still has role: "Customer"
3. The frontend checks localStorage, not the database
4. So `authService.isAdmin()` returns `false`
5. The admin guard redirects you to `/customer/dashboard`

## The Solution

You need to **logout and login again** so the frontend fetches the updated role from the backend.

### Step 1: Logout

Click on your profile menu (top right) → Logout

OR

Open browser console (F12) and run:
```javascript
localStorage.clear();
window.location.href = '/auth/login';
```

### Step 2: Login Again

Login with your credentials:
- Email: `ayushibhutani15@gmail.com`
- Password: (your password)

### Step 3: Verify

After login, you should:
- See the admin navbar with: Dashboard | Analytics | Policies | Claims | Manage
- Be redirected to `/admin/dashboard`
- See the admin dashboard with statistics cards

---

## Quick Fix (Temporary)

If you don't want to logout, you can manually fix localStorage:

### Option A: Use Debug Tool

1. Open: `http://localhost:4200/debug-admin-role.html`
2. Click "🔧 Fix Admin Role" button
3. Refresh the page
4. Navigate to `/admin/dashboard`

### Option B: Browser Console

1. Press F12 to open console
2. Run this code:

```javascript
// Get current user
let user = JSON.parse(localStorage.getItem('user'));

// Update role
user.role = 'Admin';

// Save back
localStorage.setItem('user', JSON.stringify(user));

// Reload page
window.location.reload();
```

3. Then navigate to: `http://localhost:4200/admin/dashboard`

---

## Why This Happened

### The Flow:

1. **Initial Login (as Customer)**
   - Backend returns: `{ role: "Customer" }`
   - Frontend stores in localStorage: `{ role: "Customer" }`

2. **You Updated Database**
   - SQL: `UPDATE Users SET Role = 'Admin' WHERE Email = '...'`
   - Database now has: `Role = "Admin"`

3. **Frontend Still Uses Old Data**
   - Frontend reads from localStorage: `{ role: "Customer" }`
   - Never fetches from backend again until you logout/login

4. **Guards Block Admin Access**
   - `adminGuard` checks: `user.role === 'Admin'` → FALSE
   - Redirects to `/customer/dashboard`

### The Fix:

Logout → Login → Backend returns new role → localStorage updated → Admin access granted

---

## Verify It's Working

After logout and login, check:

### 1. Browser Console (F12)

Run:
```javascript
JSON.parse(localStorage.getItem('user')).role
```

Should output: `"Admin"`

### 2. Navbar

Should show:
- Dashboard
- Analytics ← This should be visible now!
- Policies
- Claims
- Manage (dropdown)

### 3. URL

After login, should redirect to:
```
http://localhost:4200/admin/dashboard
```

### 4. Dashboard Content

Should show:
- "Admin Dashboard" title (not "Welcome back, ...")
- Statistics cards with icons
- Quick Actions buttons
- Recent Claims table

---

## If Still Not Working

### Check 1: Verify Database Role

Run this SQL:
```sql
SELECT UserId, Email, Role, IsEmailVerified 
FROM Users 
WHERE Email = 'ayushibhutani15@gmail.com';
```

Should show: `Role = Admin`

### Check 2: Verify Backend Response

1. Login
2. Open Network tab in DevTools
3. Look for request to `/auth/me`
4. Check response - should have: `"role": "Admin"`

### Check 3: Verify localStorage

Open console and run:
```javascript
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Role:', JSON.parse(localStorage.getItem('user')).role);
```

Should show: `Role: Admin`

### Check 4: Verify Auth Service

Open console and run:
```javascript
// This won't work directly, but you can check in the app
// The navbar component uses authService.isAdmin()
```

---

## Common Mistakes

### ❌ Mistake 1: Not Logging Out

Updating the database doesn't automatically update localStorage. You MUST logout and login again.

### ❌ Mistake 2: Clearing Only Cookies

You need to clear localStorage, not just cookies.

### ❌ Mistake 3: Wrong Email

Make sure you're logging in with the email you updated in the database.

### ❌ Mistake 4: Backend Not Running

If backend is down, the `/auth/me` call fails and role isn't fetched.

---

## Analytics Not Showing

The Analytics menu item should appear in the admin navbar after you fix the role issue.

If it's still not showing:

1. Check navbar component is using `authService.isAdmin()`
2. Verify the route exists in `app.routes.ts`
3. Check browser console for errors

The navbar code shows:
```typescript
<ng-container *ngIf="authService.isAdmin()">
  <button mat-button routerLink="/admin/analytics" routerLinkActive="active">
    <mat-icon>analytics</mat-icon>
    Analytics
  </button>
</ng-container>
```

This will only show when `isAdmin()` returns `true`.

---

## Summary

**The Fix:**
1. Logout from the application
2. Login again with your credentials
3. The backend will return the updated role
4. localStorage will be updated
5. Admin dashboard and navbar will appear

**Why:**
- Database was updated ✅
- localStorage was NOT updated ❌
- Frontend uses localStorage for role checks
- Logout/Login syncs localStorage with database

**Result:**
- Admin navbar with Analytics
- Admin dashboard at `/admin/dashboard`
- Full admin functionality

---

## Need Help?

If this doesn't work, share:

1. Output of: `SELECT * FROM Users WHERE Email = 'ayushibhutani15@gmail.com';`
2. Browser console output after login
3. Network tab showing `/auth/me` response
4. Screenshot of what you see after login
