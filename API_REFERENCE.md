# SmartSure API Reference

## 🔗 Base URL

**Development:** `http://localhost:5000/api`  
**Gateway:** `http://localhost:5001/api`

---

## 🔐 Authentication

All authenticated endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string",
  "password": "string",
  "role": "Customer" | "Admin"
}

Response: 200 OK
{
  "userId": "string",
  "message": "OTP sent to email"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "string",
  "otp": "string"
}

Response: 200 OK
{
  "token": "string",
  "user": { ... }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "token": "string",
  "user": {
    "userId": "string",
    "email": "string",
    "fullName": "string",
    "role": "Customer" | "Admin"
  }
}
```

#### Google OAuth
```http
GET /auth/google
Response: Redirect to Google OAuth

GET /auth/google/callback?code=xxx
Response: Redirect with token
```

---

### Insurance Types

#### Get All Types
```http
GET /insurance/types

Response: 200 OK
[
  {
    "typeId": "string",
    "name": "string",
    "description": "string",
    "isActive": boolean
  }
]
```

#### Get Subtypes by Type
```http
GET /insurance/types/{typeId}/subtypes

Response: 200 OK
[
  {
    "subtypeId": "string",
    "typeId": "string",
    "name": "string",
    "description": "string",
    "basePremiumRate": number,
    "isActive": boolean
  }
]
```

---

### Policies

#### Get Quote
```http
POST /policies/quote
Authorization: Bearer <token>
Content-Type: application/json

{
  "subtypeId": "string",
  "duration": number,
  "couponCode": "string" (optional),
  "vehicleDetail": {
    "RegistrationNumber": "string",
    "Make": "string",
    "Model": "string",
    "ManufactureYear": number,
    "EstimatedValue": number,
    "ChassisNumber": "string",
    "EngineNumber": "string"
  },
  "homeDetail": {
    "Address": "string",
    "PropertyType": "string",
    "YearBuilt": number,
    "AreaSqFt": number,
    "ConstructionCostPerSqFt": number,
    "SecurityFeatures": "string"
  }
}

Response: 200 OK
{
  "subtypeId": "string",
  "subtypeName": "string",
  "typeName": "string",
  "duration": number,
  "insuredDeclaredValue": number,
  "premiumAmount": number,
  "breakdown": "string"
}
```

#### Create Policy
```http
POST /policies
Authorization: Bearer <token>
Content-Type: application/json

{
  "subtypeId": "string",
  "duration": number,
  "couponCode": "string" (optional),
  "nomineeName": "string" (optional),
  "nomineeRelation": "string" (optional),
  "vehicleDetail": { ... },
  "homeDetail": { ... }
}

Response: 201 Created
{
  "policyId": "string",
  "formattedPolicyId": "POL-xxxxx",
  "userId": "string",
  "subtypeId": "string",
  "status": "Draft",
  "startDate": "string",
  "endDate": "string",
  "premiumAmount": number,
  "insuredDeclaredValue": number
}
```

#### Get User Policies
```http
GET /policies/user?page=1&pageSize=10
Authorization: Bearer <token>

Response: 200 OK
{
  "items": [ ... ],
  "totalCount": number,
  "page": number,
  "pageSize": number,
  "totalPages": number
}
```

#### Get Policy by ID
```http
GET /policies/{policyId}
Authorization: Bearer <token>

Response: 200 OK
{
  "policyId": "string",
  "formattedPolicyId": "POL-xxxxx",
  "userId": "string",
  "subtypeId": "string",
  "status": "Active",
  "startDate": "string",
  "endDate": "string",
  "premiumAmount": number,
  "insuredDeclaredValue": number,
  "subtypeName": "string",
  "typeName": "string",
  "approvedClaimsCount": number
}
```

---

### Claims

#### Create Claim
```http
POST /claims
Authorization: Bearer <token>
Content-Type: application/json

{
  "policyId": "string",
  "claimType": "string",
  "incidentDate": "string",
  "description": "string",
  "claimAmount": number,
  "isCompletelyDamaged": boolean
}

Response: 201 Created
{
  "claimId": "string",
  "formattedClaimId": "CLM-xxxxx",
  "policyId": "string",
  "status": "Draft",
  "description": "string",
  "claimAmount": number,
  "createdAt": "string"
}
```

#### Submit Claim
```http
PUT /claims/{claimId}/submit
Authorization: Bearer <token>

Response: 200 OK
{
  "claimId": "string",
  "status": "Submitted",
  "submittedAt": "string"
}
```

#### Get User Claims
```http
GET /claims/user?page=1&pageSize=10&status=Submitted
Authorization: Bearer <token>

Response: 200 OK
{
  "items": [ ... ],
  "totalCount": number,
  "page": number,
  "pageSize": number,
  "totalPages": number
}
```

#### Get Claim by ID
```http
GET /claims/{claimId}
Authorization: Bearer <token>

Response: 200 OK
{
  "claimId": "string",
  "formattedClaimId": "CLM-xxxxx",
  "policyId": "string",
  "formattedPolicyId": "POL-xxxxx",
  "userId": "string",
  "description": "string",
  "claimAmount": number,
  "approvedAmount": number,
  "status": "string",
  "rejectionReason": "string",
  "reviewNotes": "string",
  "createdAt": "string",
  "reviewedAt": "string"
}
```

#### Get Claim History
```http
GET /claims/{claimId}/history
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "historyId": "string",
    "claimId": "string",
    "oldStatus": "string",
    "newStatus": "string",
    "notes": "string",
    "changedBy": "string",
    "changedAt": "string"
  }
]
```

---

### Payment

#### Create Payment Order
```http
POST /payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "policyId": "string",
  "amount": number
}

Response: 200 OK
{
  "orderId": "string",
  "amount": number,
  "currency": "INR",
  "razorpayOrderId": "string",
  "razorpayKey": "string"
}
```

#### Verify Payment
```http
POST /payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "string",
  "razorpayPaymentId": "string",
  "razorpayOrderId": "string",
  "razorpaySignature": "string"
}

Response: 200 OK
{
  "success": true,
  "policyId": "string",
  "message": "Payment verified successfully"
}
```

---

### Admin - Dashboard

#### Get Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer <token>
Role: Admin

Response: 200 OK
{
  "totalPolicies": number,
  "activePolicies": number,
  "pendingClaims": number,
  "totalUsers": number,
  "totalRevenue": number
}
```

---

### Admin - Claims

#### Get All Claims
```http
GET /admin/claims?page=1&pageSize=10&status=Submitted
Authorization: Bearer <token>
Role: Admin

Response: 200 OK
{
  "items": [ ... ],
  "totalCount": number,
  "page": number,
  "pageSize": number,
  "totalPages": number
}
```

#### Approve Claim
```http
PUT /admin/claims/{claimId}/approve
Authorization: Bearer <token>
Role: Admin
Content-Type: application/json

{
  "approvedAmount": number,
  "notes": "string"
}

Response: 200 OK
{
  "claimId": "string",
  "status": "Approved",
  "approvedAmount": number,
  "reviewedAt": "string"
}
```

#### Reject Claim
```http
PUT /admin/claims/{claimId}/reject
Authorization: Bearer <token>
Role: Admin
Content-Type: application/json

{
  "reason": "string"
}

Response: 200 OK
{
  "claimId": "string",
  "status": "Rejected",
  "rejectionReason": "string",
  "reviewedAt": "string"
}
```

---

### Admin - Policies

#### Get All Policies
```http
GET /admin/policies?page=1&pageSize=10&status=Active
Authorization: Bearer <token>
Role: Admin

Response: 200 OK
{
  "items": [ ... ],
  "totalCount": number,
  "page": number,
  "pageSize": number,
  "totalPages": number
}
```

---

## 📊 Data Models

### Policy Status
- `Draft` - Policy created but not paid
- `Pending` - Payment initiated
- `Active` - Policy active and valid
- `Expired` - Policy expired
- `Cancelled` - Policy cancelled by user
- `Terminated` - Policy terminated by admin
- `Failed` - Payment failed

### Claim Status
- `Draft` - Claim created but not submitted
- `Submitted` - Claim submitted for review
- `Under Review` - Admin reviewing claim
- `Approved` - Claim approved
- `Rejected` - Claim rejected
- `Closed` - Claim closed

### User Roles
- `Customer` - Regular user
- `Admin` - Administrator

---

## 🔑 Important Field Names

### Backend (PascalCase)
The backend uses PascalCase for field names:
- `InsuredDeclaredValue`
- `PremiumAmount`
- `FormattedPolicyId`
- `FormattedClaimId`
- `ManufactureYear`
- `EstimatedValue`
- `SubtypeName`
- `TypeName`

### Frontend (camelCase)
The frontend uses camelCase but accepts both:
- `insuredDeclaredValue` or `idv`
- `premiumAmount`
- `formattedPolicyId` or `policyNumber`
- `formattedClaimId` or `claimNumber`
- `manufactureYear`
- `estimatedValue`
- `subtypeName`
- `typeName`

---

## 🧪 Test Data

### Test Razorpay Key
```
rzp_test_ScrbMdCn9O25Jj
```

### Sample Vehicle Details
```json
{
  "RegistrationNumber": "MH01AB1234",
  "Make": "Mahindra",
  "Model": "XUV700",
  "ManufactureYear": 2020,
  "EstimatedValue": 1500000,
  "ChassisNumber": "CH1234567890",
  "EngineNumber": "EN1234567890"
}
```

### Sample Home Details
```json
{
  "Address": "123 Main St",
  "PropertyType": "Apartment",
  "YearBuilt": 2015,
  "AreaSqFt": 1200,
  "ConstructionCostPerSqFt": 2000,
  "SecurityFeatures": "CCTV"
}
```

---

## ⚠️ Error Codes

### 400 Bad Request
- Invalid input data
- Validation errors
- Missing required fields

### 401 Unauthorized
- Missing or invalid token
- Token expired

### 403 Forbidden
- Insufficient permissions
- Wrong role for endpoint

### 404 Not Found
- Resource not found
- Invalid ID

### 500 Internal Server Error
- Server error
- Database error
- Unexpected error

---

## 📝 Notes

1. All dates are in ISO 8601 format
2. All amounts are in INR (Indian Rupees)
3. Pagination starts at page 1
4. Default page size is 10
5. Maximum page size is 100
6. All IDs are GUIDs (strings)
7. Formatted IDs use prefixes:
   - Policies: `POL-xxxxx`
   - Claims: `CLM-xxxxx`
   - Users: `SSUSER-xxxxx`

---

## 🔗 Related Documentation

- [System Status](./SYSTEM_STATUS.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

*Last Updated: April 13, 2026*
