# Razorpay Integration - Complete Guide

## ✅ Integration Status: COMPLETE

The frontend now has **full Razorpay integration** using the test environment. No real money will be charged.

## How It Works

### 1. Backend Configuration
- **Test Key ID**: `rzp_test_ScrbMdCn9O25Jj`
- **Test Secret**: Configured in backend `appsettings.json`
- Backend creates real Razorpay orders and verifies signatures

### 2. Frontend Flow

#### Step 1: Create Policy
User selects insurance type, plan, and duration → Gets quote

#### Step 2: Initiate Payment
- Frontend calls backend: `POST /policies/{policyId}/payments/razorpay/create-order`
- Backend creates Razorpay order and returns:
  ```json
  {
    "orderId": "order_xxx",
    "amount": 15000,
    "currency": "INR",
    "keyId": "rzp_test_ScrbMdCn9O25Jj",
    "policyId": "guid"
  }
  ```

#### Step 3: Show Razorpay Popup
- Frontend opens Razorpay checkout with the order details
- User sees the actual Razorpay payment interface
- **Test Mode**: No real money is charged

#### Step 4: Verify Payment
- After successful payment, Razorpay returns:
  - `razorpay_order_id`
  - `razorpay_payment_id`
  - `razorpay_signature`
- Frontend sends these to backend: `POST /policies/{policyId}/payments/razorpay/verify`
- Backend verifies the signature using Razorpay SDK
- Policy is activated on successful verification

## Test Payment Methods (Razorpay Test Mode)

### ✅ Recommended: UPI (Works Best!)
- **UPI ID**: Enter any UPI ID format
  - `test@paytm`
  - `success@razorpay`
  - `yourname@upi`
- **Result**: Payment succeeds instantly in test mode

### ✅ Recommended: Netbanking
- Select any bank from the list
- Use test credentials provided by Razorpay
- **Result**: Payment succeeds

### ⚠️ Cards (Limited in Test Mode)
The test account has international cards disabled. Use Indian cards only:

- **Rupay Card**: `6074667022059103`
  - CVV: Any 3 digits
  - Expiry: Any future date
  - Name: Any name

- **Visa (if enabled)**: `4111 1111 1111 1111`
  - May not work if international cards are disabled

### 💡 Best Practice for Testing
1. **First Choice**: Use UPI - fastest and most reliable
2. **Second Choice**: Use Netbanking - always works
3. **Last Resort**: Try Rupay card if cards are enabled

## Code Changes Made

### 1. Payment Service (`services/payment.service.ts`)
```typescript
processDemoPayment(policyId: string, amount: number): Observable<Payment> {
  // Creates Razorpay order from backend
  // Opens Razorpay checkout popup
  // Verifies payment with backend
  // Returns payment confirmation
}
```

### 2. Payment Models (`models/payment.models.ts`)
```typescript
export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string; // Backend provides test key
  policyId: string;
}

export interface VerifyRazorpayPaymentRequest {
  policyId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod: string;
}
```

### 3. Buy Policy Component (`features/customer/policies/buy-policy.component.ts`)
- Updated payment button text: "Pay with Razorpay (Test Mode)"
- Added test card information in UI
- Proper error handling for payment cancellation

### 4. Index.html
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

## User Experience

1. User clicks "Pay with Razorpay (Test Mode)"
2. Razorpay popup appears with payment options
3. User selects payment method (Card/UPI/Netbanking)
4. Enters test credentials
5. Payment succeeds (in test mode)
6. Policy is activated automatically
7. User is redirected to policy details page

## Important Notes

### ✅ What Works
- Real Razorpay popup interface
- Test mode - no real money charged
- Signature verification
- Automatic policy activation
- Payment history tracking

### ⚠️ Test Mode Limitations
- Only test cards/UPI work
- Real cards will be rejected
- No actual bank transactions
- Razorpay dashboard shows test transactions

### 🔒 Security
- Payment signature is verified by backend
- Razorpay SDK handles encryption
- Test keys are safe to expose in frontend
- Production keys should NEVER be in frontend code

## Testing the Integration

1. Start the application: `npm start`
2. Navigate to: http://localhost:4200/
3. Register/Login as a customer
4. Click "Explore Plans" → Select any insurance type
5. Complete the wizard (Type → Plan → Review)
6. Click "Pay with Razorpay (Test Mode)"
7. **Choose UPI or Netbanking** (recommended for test mode)
   - UPI: Enter `test@paytm` or any UPI ID
   - Netbanking: Select any bank
   - Card: Use Rupay `6074667022059103` (if cards enabled)
8. Payment succeeds → Policy activated!

## Common Issues & Solutions

### "International cards are not supported"
**Solution**: The test account has international cards disabled. Use:
- ✅ UPI (any UPI ID works)
- ✅ Netbanking (any bank works)
- ✅ Rupay card: `6074667022059103`
- ❌ Avoid: Visa/Mastercard international test cards

## Troubleshooting

### Razorpay popup doesn't appear
- Check browser console for errors
- Ensure Razorpay script is loaded in index.html
- Check network tab for API calls

### Payment verification fails
- Check backend logs
- Verify Razorpay keys in backend appsettings.json
- Ensure signature verification is working

### Policy not activated
- Check payment status in backend
- Verify payment service is calling activate endpoint
- Check backend logs for errors

## Production Deployment

When moving to production:

1. **Backend**: Update `appsettings.json` with live Razorpay keys
   ```json
   "Razorpay": {
     "KeyId": "rzp_live_xxxxx",
     "KeySecret": "your_live_secret"
   }
   ```

2. **Frontend**: No changes needed! Backend provides the key

3. **Testing**: Use real cards in production (small amounts first)

4. **Monitoring**: Check Razorpay dashboard for transactions

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Integration Guide: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

---

**Status**: ✅ Fully Functional
**Last Updated**: April 13, 2026
**Test Mode**: Active
**Real Money**: Not Charged
