# Policy Approval Workflow

## Current Behavior (Auto-Activation)

### What Happens Now:
1. Customer purchases policy → Status: **Draft/Pending**
2. Customer completes payment → Backend automatically calls `ActivatePolicyAsync()`
3. Policy status changes to: **Active** (immediately)
4. Customer can use the policy right away

### Backend Code Location:
- **File**: `backend/services/SmartSure.PolicyService/Services/PaymentService.cs`
- **Method**: `VerifyAndRecordRazorpayPaymentAsync()` (Line ~156)
- **Code**:
```csharp
// After successful payment verification
await _policyService.ActivatePolicyAsync(dto.PolicyId);
```

---

## Desired Behavior (Admin Approval Required)

### What Should Happen:
1. Customer purchases policy → Status: **Draft**
2. Customer completes payment → Status: **Pending** (awaiting admin approval)
3. Admin reviews policy → Approves/Rejects
4. If approved → Status: **Active**
5. If rejected → Status: **Cancelled** (with refund)

---

## How to Implement Admin Approval Workflow

### Backend Changes Required:

#### 1. Update PaymentService.cs

**Current Code** (Line ~156):
```csharp
try
{
    await _policyService.ActivatePolicyAsync(dto.PolicyId);
    _logger.LogInformation("Policy {PolicyId} activated after successful payment", dto.PolicyId);
}
```

**Change To**:
```csharp
try
{
    // Set policy to Pending status instead of Active
    await _policyService.SetPolicyStatusAsync(dto.PolicyId, PolicyStatus.Pending);
    _logger.LogInformation("Policy {PolicyId} set to Pending status, awaiting admin approval", dto.PolicyId);
    
    // Optional: Send notification to admin
    // await _notificationService.NotifyAdminNewPolicyAsync(dto.PolicyId);
}
```

#### 2. Add SetPolicyStatusAsync Method

In `IPolicyMgmtService.cs`:
```csharp
Task SetPolicyStatusAsync(Guid policyId, PolicyStatus status);
```

In `PolicyMgmtService.cs`:
```csharp
public async Task SetPolicyStatusAsync(Guid policyId, PolicyStatus status)
{
    var policy = await _repo.GetByIdAsync(policyId);
    if (policy == null)
        throw new NotFoundException($"Policy {policyId} not found");
    
    policy.Status = status;
    policy.UpdatedAt = DateTime.UtcNow;
    
    await _repo.UpdateAsync(policy);
    await _repo.SaveChangesAsync();
    
    _logger.LogInformation("Policy {PolicyId} status changed to {Status}", policyId, status);
}
```

#### 3. Add Admin Approval Endpoint

In `PoliciesController.cs`:
```csharp
/// <summary>
/// Admin approves a pending policy
/// </summary>
[HttpPut("/policies/{policyId}/approve")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> ApprovePolicy(Guid policyId)
{
    try
    {
        await _service.ActivatePolicyAsync(policyId);
        return Ok(new { message = "Policy approved and activated" });
    }
    catch (NotFoundException ex)
    {
        return NotFound(new { error = ex.Message });
    }
}

/// <summary>
/// Admin rejects a pending policy
/// </summary>
[HttpPut("/policies/{policyId}/reject")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> RejectPolicy(Guid policyId, [FromBody] RejectPolicyDTO dto)
{
    try
    {
        await _service.CancelPolicyAsync(policyId);
        // Optional: Initiate refund process
        // await _paymentService.RefundPolicyPaymentAsync(policyId, dto.Reason);
        return Ok(new { message = "Policy rejected" });
    }
    catch (NotFoundException ex)
    {
        return NotFound(new { error = ex.Message });
    }
}
```

---

### Frontend Changes Required:

#### 1. Update Success Message

In `buy-policy.component.ts`:
```typescript
this.toastr.success(
  'Payment successful! Your policy is pending admin approval.',
  'Success',
  { timeOut: 5000 }
);
```

#### 2. Update Policy Status Display

In `policy-detail.component.ts` and `policy-list.component.ts`:
- Show "Pending Approval" badge for Pending status
- Add message: "Your policy is awaiting admin approval"

#### 3. Create Admin Policy Management Component

Create `admin/policies/policy-management.component.ts`:
- List all pending policies
- Show policy details
- Approve/Reject buttons
- Reason field for rejection

---

## Benefits of Admin Approval Workflow

### 1. Risk Management
- Admin can verify policy details before activation
- Prevent fraudulent policies
- Check for duplicate policies

### 2. Quality Control
- Ensure all required documents are submitted
- Verify customer information
- Check for policy conflicts

### 3. Compliance
- Meet regulatory requirements
- Maintain audit trail
- Document approval decisions

### 4. Business Logic
- Apply manual underwriting rules
- Assess risk factors
- Adjust premiums if needed

---

## Implementation Priority

### Phase 1: Basic Approval (Recommended)
1. Change auto-activation to Pending status
2. Add admin approve/reject endpoints
3. Create admin policy management UI
4. Update customer notifications

### Phase 2: Enhanced Features
1. Add approval workflow with multiple levels
2. Implement automatic approval rules
3. Add document verification
4. Email notifications to customers

### Phase 3: Advanced Features
1. Risk scoring system
2. Automated underwriting
3. Integration with external verification services
4. Analytics dashboard for approval metrics

---

## Testing the Workflow

### Current Behavior (Auto-Activation):
1. Buy policy → Pay → Status: Active ✅
2. No admin intervention needed

### After Implementing Approval:
1. Buy policy → Pay → Status: Pending ⏳
2. Admin logs in → Reviews policy
3. Admin approves → Status: Active ✅
4. Customer receives notification

---

## Database Schema

### Policy Table
```sql
CREATE TABLE Policies (
    PolicyId UNIQUEIDENTIFIER PRIMARY KEY,
    Status NVARCHAR(50) NOT NULL, -- Draft, Pending, Active, Cancelled, Expired
    ApprovedBy UNIQUEIDENTIFIER NULL, -- Admin UserId who approved
    ApprovedAt DATETIME2 NULL,
    RejectionReason NVARCHAR(500) NULL,
    -- other fields...
)
```

### Policy Status Enum
```csharp
public enum PolicyStatus
{
    Draft,      // Policy created but not paid
    Pending,    // Payment done, awaiting approval
    Active,     // Approved and active
    Cancelled,  // Rejected or cancelled
    Expired,    // Policy term ended
    Terminated  // Terminated by admin
}
```

---

## Summary

**Current**: Payment → Auto-Activate → Active
**Desired**: Payment → Pending → Admin Approval → Active

**To Implement**: 
1. Remove auto-activation from PaymentService
2. Add admin approval endpoints
3. Create admin UI for policy management
4. Update customer notifications

**Estimated Effort**: 4-6 hours
**Files to Modify**: 
- Backend: PaymentService.cs, PoliciesController.cs, PolicyMgmtService.cs
- Frontend: buy-policy.component.ts, admin policy management components

---

**Note**: The current auto-activation is suitable for:
- Demo/Testing environments
- Low-risk policies
- Automated underwriting systems

For production with manual approval, implement the changes above.
