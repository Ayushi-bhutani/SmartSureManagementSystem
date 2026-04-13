# 🚀 SmartSure Quick Start Guide

Get up and running with SmartSure in 5 minutes!

---

## ✅ Current Status

**System Status:** ✅ FULLY OPERATIONAL  
**Dev Server:** ✅ RUNNING on http://localhost:4200/  
**Build Status:** ✅ SUCCESS  
**Last Updated:** April 13, 2026

---

## 🎯 What's Working Right Now

### ✅ Customer Features
- Register and login
- Buy insurance policies (Vehicle, Home, etc.)
- Make payments via Razorpay (test mode)
- File and track claims
- View policy details
- Download policy PDFs
- Manage profile

### ✅ Admin Features
- Admin dashboard with statistics
- Review and approve/reject claims
- View all policies
- Manage system operations

---

## 🏃 Quick Access

### Frontend
**URL:** http://localhost:4200/

### Key Routes
- **Landing:** http://localhost:4200/
- **Login:** http://localhost:4200/auth/login
- **Register:** http://localhost:4200/auth/register
- **Customer Dashboard:** http://localhost:4200/customer/dashboard
- **Admin Dashboard:** http://localhost:4200/admin/dashboard

---

## 🧪 Quick Test Scenarios

### 1. Register & Login (2 minutes)
```
1. Go to http://localhost:4200/
2. Click "Get Started" or "Sign Up"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: Test@123
4. Enter OTP (check backend logs)
5. Login automatically
```

### 2. Buy a Policy (3 minutes)
```
1. Click "Buy Policy" from dashboard
2. Select "Vehicle" insurance
3. Choose any plan
4. Select "12 months" duration
5. Click "Get Quote"
6. Review quote (verify IDV is NOT zero)
7. Click "Proceed to Payment"
8. Click "Pay with Razorpay"
9. In popup: Select "Netbanking" → Choose any bank
10. Payment succeeds automatically
11. Policy is now ACTIVE!
```

### 3. File a Claim (2 minutes)
```
1. Click "Initiate Claim"
2. Select your active policy
3. Fill details:
   - Type: Accident
   - Date: Today
   - Description: "Test claim"
   - Amount: 50000
4. Click "Submit Claim"
5. Status changes to "Submitted" ✅
```

### 4. Admin Review (2 minutes)
```
1. Logout from customer
2. Login as admin
3. Go to "Review Claims"
4. Click "Review" on pending claim
5. Approve Tab:
   - Enter approved amount
   - Add notes
   - Click "Approve Claim"
6. Claim status updates to "Approved" ✅
```

---

## 🎨 UI Highlights

### Modern Design
- Material Design components
- Gradient backgrounds
- Smooth animations
- Responsive layout

### User Experience
- Loading spinners
- Toast notifications
- Status badges
- Empty states
- Error handling

---

## 🔑 Key Features to Test

### ✅ Must Test
1. **Policy Purchase** - Verify IDV calculation works
2. **Payment Flow** - Test Razorpay integration
3. **Claim Submission** - Verify status changes to "Submitted"
4. **Admin Review** - Test approve/reject functionality
5. **Policy Download** - Generate PDF

### 🎯 Nice to Test
1. Search and filter policies
2. Search and filter claims
3. Profile update
4. Password change
5. Responsive design on mobile

---

## 📊 What to Expect

### Policy Purchase
- ✅ IDV (coverage) shows correct value (NOT zero)
- ✅ Premium calculated correctly
- ✅ Razorpay popup opens in test mode
- ✅ Policy activates immediately after payment
- ✅ Policy number in format: POL-xxxxx

### Claims
- ✅ Claim status: Draft → Submitted (NOT stuck in Draft)
- ✅ Claim number in format: CLM-xxxxx
- ✅ Admin can approve/reject
- ✅ Status updates in real-time

### Admin
- ✅ Dashboard shows statistics
- ✅ Can review pending claims
- ✅ Approved amount validation (max = claimed amount)
- ✅ Rejection requires reason

---

## 🐛 Common Issues & Quick Fixes

### Issue: Razorpay popup not showing
**Fix:** Check if Razorpay script is loaded in index.html

### Issue: Payment fails
**Try:** Use Netbanking or UPI instead of cards

### Issue: IDV showing 0
**Status:** ✅ FIXED! Backend expects PascalCase field names

### Issue: Claim stuck in Draft
**Status:** ✅ FIXED! Two-step process implemented

### Issue: Policy number undefined
**Status:** ✅ FIXED! Using formattedPolicyId from backend

---

## 📱 Mobile Testing

The app is fully responsive! Test on:
- Chrome DevTools (F12 → Toggle Device Toolbar)
- Real mobile device
- Tablet

---

## 🎯 Success Checklist

After testing, you should see:
- [ ] User can register and login
- [ ] Policy purchase works with payment
- [ ] IDV shows correct value (not zero)
- [ ] Claims submit successfully (status = Submitted)
- [ ] Admin can review claims
- [ ] Policy PDF downloads correctly
- [ ] No console errors
- [ ] Responsive design works

---

## 📚 Need More Info?

- **Detailed Testing:** See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **API Endpoints:** See [API_REFERENCE.md](./API_REFERENCE.md)
- **System Status:** See [SYSTEM_STATUS.md](./SYSTEM_STATUS.md)
- **Full Documentation:** See [README.md](./README.md)

---

## 🎉 You're All Set!

The SmartSure system is fully functional and ready to use. All core features are working correctly:

✅ Authentication  
✅ Policy Purchase  
✅ Payment Integration  
✅ Claims Management  
✅ Admin Portal  

**Happy Testing! 🚀**

---

## 💡 Pro Tips

1. **Use Netbanking** for test payments (international cards disabled)
2. **Check console logs** if something doesn't work
3. **Verify backend is running** before testing
4. **Clear browser cache** if you see old data
5. **Use Chrome DevTools** for debugging

---

## 🆘 Need Help?

1. Check console for errors (F12)
2. Verify backend services are running
3. Check Network tab for failed API calls
4. Review documentation files
5. Check backend logs

---

*Last Updated: April 13, 2026*

**System Status: ✅ All Systems Operational**
