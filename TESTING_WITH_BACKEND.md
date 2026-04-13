# 🚀 Testing with Backend Running

**Status:** Backend is now running ✅  
**Issue Resolved:** "Session expired" was caused by backend not running

---

## ✅ Current Setup

### Backend Running:
- Backend services should be running
- API endpoints available
- Database connected

### Frontend Running:
```bash
cd SmartSure-Insurance-Management-System-main/frontend
ng serve
```

---

## 🔐 Login as Admin

### Step 1: Go to Login Page
```
http://localhost:4200/auth/login
```

### Step 2: Enter Admin Credentials
Use your admin credentials from the database:
- **Email:** (your admin email)
- **Password:** (your admin password)

### Step 3: After Successful Login
You should be redirected to:
```
http://localhost:4200/admin/dashboard
```

---

## 📊 Testing Analytics Dashboard

### Step 1: Check Navbar
After logging in as admin, you should see in the navbar:
```
Dashboard | Analytics | Policies | Claims | Manage
```

### Step 2: Click Analytics
Click the "Analytics" button in the navbar

### Step 3: Verify Page Loads
You should see:
- URL: `http://localhost:4200/admin/analytics`
- 4 metric cards at the top
- 4 charts (doughnut, pie, line, bar)
- Top insurance types section

---

## 🔔 Testing Notifications

### Check Notification Bell
Look at the top-right of the navbar:
- You should see a bell icon (🔔)
- It should have a red badge with number "3"
- Click it to open the notification panel

### Test Notification Features
1. **Open panel** - Click bell icon
2. **See notifications** - 3 demo notifications should appear
3. **Mark as read** - Click a notification
4. **Badge updates** - Counter should decrease
5. **Delete** - Hover and click X button
6. **Clear all** - Click "Clear All" at bottom

---

## 🐛 If You Still Have Issues

### Issue: Can't see Analytics button

**Check your role:**
1. Open browser console (F12)
2. Run this command:
```javascript
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('Role:', user.role || user.Role);
```

**Expected output:** `Role: Admin`

**If it shows "Customer":**
- You're logged in as a customer
- Logout and login with admin credentials

### Issue: Analytics page shows error

**Check console for errors:**
1. Press F12
2. Go to Console tab
3. Look for RED error messages
4. Share the error message

### Issue: Charts not displaying

**Verify Chart.js is installed:**
```bash
npm list chart.js ng2-charts
```

**If missing, install:**
```bash
npm install chart.js ng2-charts
ng serve
```

---

## ✅ Quick Testing Checklist

### Login Test:
- [ ] Navigate to login page
- [ ] Enter admin credentials
- [ ] Click "Sign In"
- [ ] Redirected to admin dashboard
- [ ] No "Session expired" error

### Navbar Test:
- [ ] See "Analytics" button in navbar
- [ ] See notification bell icon
- [ ] Bell has red badge with "3"

### Analytics Test:
- [ ] Click "Analytics" in navbar
- [ ] Page loads successfully
- [ ] See 4 metric cards
- [ ] See 4 charts
- [ ] Charts are interactive (hover shows tooltips)
- [ ] No console errors

### Notification Test:
- [ ] Click bell icon
- [ ] Panel opens
- [ ] See 3 notifications
- [ ] Click notification - marks as read
- [ ] Badge counter updates
- [ ] Delete works
- [ ] Clear all works

---

## 📸 What You Should See

### Admin Navbar:
```
┌────────────────────────────────────────────────────────┐
│ SmartSure  Dashboard Analytics Policies Claims Manage │
│                                          [🔔³] [👤]    │
└────────────────────────────────────────────────────────┘
```

### Analytics Dashboard:
```
┌─────────────────────────────────────────────────┐
│  Analytics Dashboard        [🔄 Refresh Data]   │
├─────────────────────────────────────────────────┤
│  [Metric 1] [Metric 2] [Metric 3] [Metric 4]   │
│  [Chart 1]  [Chart 2]                           │
│  [Chart 3 - Full Width]                         │
│  [Chart 4 - Full Width]                         │
│  [Top Insurance Types]                          │
└─────────────────────────────────────────────────┘
```

### Notification Panel:
```
┌──────────────────────────────┐
│ Notifications  [Mark all read]│
├──────────────────────────────┤
│ [✓] Policy Activated    [×]  │
│ [ℹ] Claim Update        [×]  │
│ [⚠] Policy Renewal Due  [×]  │
├──────────────────────────────┤
│      [🗑️ Clear All]          │
└──────────────────────────────┘
```

---

## 🎯 Success Criteria

**Everything is working when:**

✅ Login successful without "Session expired" error  
✅ Redirected to admin dashboard  
✅ "Analytics" button visible in navbar  
✅ Notification bell shows badge with "3"  
✅ Analytics page loads with all charts  
✅ Charts are interactive (hover tooltips)  
✅ Notification panel opens and works  
✅ No console errors  

---

## 💡 Pro Tips

### 1. Keep Backend Running
Make sure backend services stay running while testing:
- Check backend console for any errors
- Verify database connection is active

### 2. Check API Endpoints
If analytics data doesn't load, the backend might not have the analytics endpoint. The frontend will show mock data in that case.

### 3. Clear Cache if Needed
If you see old data or issues:
```
Ctrl + Shift + Delete (clear cache)
Ctrl + F5 (hard refresh)
```

### 4. Monitor Console
Keep browser console open (F12) to catch any errors immediately.

---

## 🚨 Common Backend Issues

### Issue: Backend not responding

**Check if backend is running:**
- Look at backend console
- Should see "Application started" or similar message
- Check the port (usually 5000, 5001, or 7000)

**Verify API URL in frontend:**
Check `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'  // Verify this matches your backend
};
```

### Issue: CORS errors

**Symptoms:** Console shows CORS policy errors

**Solution:** Backend needs to enable CORS for `http://localhost:4200`

### Issue: 401 Unauthorized

**Symptoms:** All API calls return 401

**Possible causes:**
- Token not being sent correctly
- Backend authentication middleware issue
- Token expired

**Quick fix:** Logout and login again

---

## 📞 Report Results

After testing, let me know:

### If Everything Works ✅
- "All features working!"
- Share screenshots of:
  - Analytics dashboard
  - Notification panel
  - Any impressive features

### If Something Fails ❌
- Which specific feature failed
- Error message from console
- Screenshot of the issue
- What you expected vs what happened

---

## 🎉 Next Steps After Successful Testing

Once everything works:

1. ✅ Take screenshots for portfolio
2. ✅ Test all features thoroughly
3. ✅ Prepare demo for interview
4. ✅ Document any observations
5. ✅ Practice explaining features

---

**Good luck with testing! The backend is running, so everything should work now!** 🚀
