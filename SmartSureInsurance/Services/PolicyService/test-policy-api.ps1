# test-policy-api.ps1
$baseUrl = "https://localhost:5004"
$authUrl = "https://localhost:5001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing PolicyService API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Login to get token
Write-Host "1. Logging in to AuthService..." -ForegroundColor Yellow
$loginBody = @{
    email = "your-email@gmail.com"  # Change this
    password = "Test@12345"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$authUrl/api/Auth/login" `
    -Method Post -Body $loginBody -ContentType "application/json"

$token = $loginResponse.data.accessToken
Write-Host "   ✅ Token obtained: $($token.Substring(0, 50))...`n" -ForegroundColor Green

# Step 2: Get all products
Write-Host "2. Getting all insurance products..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "$baseUrl/api/Policy/products" -Method Get
Write-Host "   ✅ Found $($products.data.Count) products`n" -ForegroundColor Green

# Get first product ID
$productId = $products.data[0].id
Write-Host "   Using Product ID: $productId`n" -ForegroundColor Cyan

# Step 3: Calculate premium
Write-Host "3. Calculating premium..." -ForegroundColor Yellow
$premiumBody = @{
    productId = $productId
    coverageAmount = 5000000
    termYears = 20
    age = 35
    smokerStatus = "Non-Smoker"
} | ConvertTo-Json

$premium = Invoke-RestMethod -Uri "$baseUrl/api/Policy/calculate-premium" `
    -Method Post -Body $premiumBody -ContentType "application/json"

Write-Host "   ✅ Monthly Premium: ₹$($premium.data.monthlyPremium)" -ForegroundColor Green
Write-Host "   ✅ Total Premium: ₹$($premium.data.totalPremium)`n" -ForegroundColor Green

# Step 4: Create policy
Write-Host "4. Creating policy..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token" }
$policyBody = @{
    productId = $productId
    coverageAmount = 5000000
    termYears = 20
    startDate = "2026-04-01T00:00:00Z"
    beneficiaryName = "Test Beneficiary"
    beneficiaryRelationship = "Spouse"
    paymentFrequency = "Monthly"
} | ConvertTo-Json

$policy = Invoke-RestMethod -Uri "$baseUrl/api/Policy/create" `
    -Method Post -Body $policyBody -ContentType "application/json" -Headers $headers

$policyId = $policy.data.id
$policyNumber = $policy.data.policyNumber
Write-Host "   ✅ Policy created: $policyNumber (ID: $policyId)" -ForegroundColor Green
Write-Host "   ✅ Status: $($policy.data.status)`n" -ForegroundColor Green

# Step 5: Get user policies
Write-Host "5. Getting user policies..." -ForegroundColor Yellow
$userPolicies = Invoke-RestMethod -Uri "$baseUrl/api/Policy" `
    -Method Get -Headers $headers

Write-Host "   ✅ Found $($userPolicies.data.Count) policies for user`n" -ForegroundColor Green

# Step 6: Activate policy
Write-Host "6. Activating policy..." -ForegroundColor Yellow
$activated = Invoke-RestMethod -Uri "$baseUrl/api/Policy/$policyId/activate" `
    -Method Post -Headers $headers

Write-Host "   ✅ Policy status: $($activated.data.status)`n" -ForegroundColor Green

# Step 7: Get premium schedule
Write-Host "7. Getting premium schedule..." -ForegroundColor Yellow
$schedule = Invoke-RestMethod -Uri "$baseUrl/api/Policy/$policyId/premium-schedule" `
    -Method Get -Headers $headers

Write-Host "   ✅ Found $($schedule.data.Count) premium installments`n" -ForegroundColor Green

# Step 8: Pay first premium
Write-Host "8. Paying first premium..." -ForegroundColor Yellow
$paymentBody = @{
    installmentNumber = 1
    paymentMethod = "Credit Card"
    transactionId = "TXN$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

$payment = Invoke-RestMethod -Uri "$baseUrl/api/Policy/$policyId/pay-premium" `
    -Method Post -Body $paymentBody -ContentType "application/json" -Headers $headers

Write-Host "   ✅ Premium paid successfully`n" -ForegroundColor Green

# Step 9: Upload document
Write-Host "9. Uploading document..." -ForegroundColor Yellow
$docBody = @{
    documentName = "ID Proof"
    documentUrl = "https://storage.com/docs/id-proof.pdf"
    documentType = "Identity"
} | ConvertTo-Json

$document = Invoke-RestMethod -Uri "$baseUrl/api/Policy/$policyId/documents" `
    -Method Post -Body $docBody -ContentType "application/json" -Headers $headers

Write-Host "   ✅ Document uploaded: $($document.data.documentName)`n" -ForegroundColor Green

# Step 10: Get documents
Write-Host "10. Getting policy documents..." -ForegroundColor Yellow
$documents = Invoke-RestMethod -Uri "$baseUrl/api/Policy/$policyId/documents" `
    -Method Get -Headers $headers

Write-Host "   ✅ Found $($documents.data.Count) documents`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan