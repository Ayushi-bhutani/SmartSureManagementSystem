# 🔐 Admin Login Guide

## How to Access Analytics Dashboard

The Analytics dashboard is only visible to **Admin** users. Here's how to access it:

---

## 🎯 Quick Steps

### Step 1: Check Your Current Role

1. Open `check-user-role.html` in your browser
2. It will show your current role (Admin or Customer)

### Step 2: Login as Admin

If you're not logged in as admin:

1. **Logout** from current account:
   - Click profile icon (top-right)
   - Click "Logout"

2. **Go to login page:**
   ```
   http://localhost:4200/auth/login
   ```

3. **Login with Admin credentials:**
   - Use your admin email and password
   - If you don't have admin credentials, see "Creating Admin User" below

### Step 3: Access Analytics

After logging in as admin, you'll see the navbar with:
```
Dashboard | Analytics | Policies | Claims | Manage
```

Click "Analytics" or navigate to:
```
http://localhost:4200/admin/analytics
```

---

## 🔧 Creating an Admin User

If you don't have admin credentials, you have two options:

### Option 1: Register and Manually Update Database

1. **Register a new user:**
   ```
   http://localhost:4200/auth/register
   ```

2. **Update the user role in database:**
   - Open your database management tool (SQL Server Management Studio, Azure Data Studio, etc.)
   - Find the Users table
   - Update the Role field from "Customer" to "Admin" for your user:
   ```sql
   UPDATE Users 
   SET Role = 'Admin' 
   WHERE Email = 'your-email@example.com';
   ```

3. **Logout and login again**

### Option 2: Use Backend API (If Available)

If your backend has an admin creation endpoint, use it to create an admin user.

---

## 🎯 What You Should See as Admin

### Navbar (Top):
```
┌─────────────────────────────────────────────────────────┐
│ SmartSure  Dashboard Analytics Policies Claims Manage  │
└─────────────────────────────────────────────────────────┘
```

### Admin Menu Items:
- **Dashboard** - Admin overview
- **Analytics** ⭐ - Charts and data visualization
- **Policies** - Manage all policies
- **Claims** - Review claims
- **Manage** - Dropdown with:
  - Insurance Types
  - Discounts
  - Users
  - Reports
  - Audit Logs

---

## 🔔 Notification Bell

As any logged-in user (Admin or Customer), you should see:
- Bell icon (🔔) in top-right navbar
- Red badge with number "3"
- Click to open notification panel

---

## 🚨 Troubleshooting

### Issue: Still Don't See Analytics Button

**Solution 1: Clear Cache**
```
1. Press Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page (F5)
```

**Solution 2: Hard Refresh**
```
Press Ctrl + Shift + R
```

**Solution 3: Navigate Directly**
```
http://localhost:4200/admin/analytics
```

**Solution 4: Check Browser Console**
```
1. Press F12
2. Look for errors in Console tab
3. Check if there are any route guard errors
```

### Issue: "Access Denied" or Redirected

This means you're not logged in as admin. Follow the login steps above.

### Issue: Page Not Found (404)

**Check if server is running:**
```bash
cd SmartSure-Insurance-Management-System-main/frontend
ng serve
```

**Verify route exists:**
The route should be in `app.routes.ts`:
```typescript
{
  path: 'analytics',
  loadComponent: () => import('./features/admin/analytics/analytics-dashboard.component')
}
```

---

## ✅ Verification Checklist

After logging in as admin, verify:

- [ ] Navbar shows "Analytics" button
- [ ] Clicking Analytics navigates to `/admin/analytics`
- [ ] Page loads without errors
- [ ] 4 metric cards display
- [ ] 4 charts render (doughnut, pie, line, bar)
- [ ] Notification bell shows badge with "3"
- [ ] No console errors

---

## 🎯 Quick Test Commands

### Check if you're logged in:
Open browser console (F12) and run:
```javascript
console.log(localStorage.getItem('currentUser'));
console.log(localStorage.getItem('token'));
```

### Check your role:
```javascript
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Role:', user.role || user.Role);
```

### Force navigate to analytics:
```javascript
window.location.href = 'http://localhost:4200/admin/analytics';
```

---

## 📞 Still Having Issues?

If you still can't see the Analytics button:

1. **Take a screenshot** of your navbar
2. **Check browser console** (F12) for errors
3. **Run this in console:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('currentUser'));
   console.log('Current User:', user);
   console.log('Role:', user.role || user.Role);
   ```
4. **Share the output** so I can help debug

---

## 🎉 Success!

Once you're logged in as admin, you should see:

✅ Analytics button in navbar  
✅ Notification bell with badge  
✅ Full admin menu  
✅ Access to all admin features  

**Navigate to Analytics and enjoy the interactive dashboard!** 📊
