using Microsoft.EntityFrameworkCore;
using PolicyService.Data;
using PolicyService.DTOs;
using PolicyService.Models;
using SmartSure.SharedKernel;
using System.Text.Json;

namespace PolicyService.Services
{
    public class PolicyService : IPolicyService
    {
        private readonly PolicyDbContext _context;
        private readonly ILogger<PolicyService> _logger;

        public PolicyService(PolicyDbContext context, ILogger<PolicyService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PolicyDto> CreatePolicyAsync(CreatePolicyRequest request, Guid userId)
        {
            _logger.LogInformation($"Creating policy for user: {userId}");

            var product = await _context.InsuranceProducts.FindAsync(request.ProductId);
            if (product == null)
                throw new KeyNotFoundException("Insurance product not found");

            // Validate coverage amount
            if (request.CoverageAmount < product.MinCoverageAmount ||
                request.CoverageAmount > product.MaxCoverageAmount)
            {
                throw new InvalidOperationException($"Coverage amount must be between {product.MinCoverageAmount:C} and {product.MaxCoverageAmount:C}");
            }

            // Validate term
            if (request.TermYears < product.MinTermYears || request.TermYears > product.MaxTermYears)
            {
                throw new InvalidOperationException($"Term must be between {product.MinTermYears} and {product.MaxTermYears} years");
            }

            // Calculate premium
            var premiumCalculation = await CalculatePremiumAsync(new PremiumCalculationRequest
            {
                ProductId = request.ProductId,
                CoverageAmount = request.CoverageAmount,
                TermYears = request.TermYears
            });

            // Generate policy number
            var policyNumber = GeneratePolicyNumber();

            // Create policy
            var policy = new Policy
            {
                UserId = userId,
                ProductId = request.ProductId,
                PolicyNumber = policyNumber,
                CoverageAmount = request.CoverageAmount,
                TermYears = request.TermYears,
                PremiumAmount = premiumCalculation.MonthlyPremium,
                TotalPremium = premiumCalculation.TotalPremium,
                StartDate = request.StartDate,
                EndDate = request.StartDate.AddYears(request.TermYears),
                Status = PolicyStatus.Draft,
                BeneficiaryName = request.BeneficiaryName,
                BeneficiaryRelationship = request.BeneficiaryRelationship,
                NomineeDetails = request.NomineeDetails,
                PaymentFrequency = request.PaymentFrequency
            };

            _context.Policies.Add(policy);
            await _context.SaveChangesAsync();

            // Create premium schedule
            await CreatePremiumSchedule(policy);

            _logger.LogInformation($"Policy created successfully: {policyNumber}");

            return await MapToPolicyDto(policy);
        }

        public async Task<PremiumCalculationResponse> CalculatePremiumAsync(PremiumCalculationRequest request)
        {
            var product = await _context.InsuranceProducts.FindAsync(request.ProductId);
            if (product == null)
                throw new KeyNotFoundException("Insurance product not found");

            // Base premium calculation
            decimal basePremium = request.CoverageAmount * (product.BasePremiumRate / 100);

            // Age factor (for life/health insurance)
            decimal ageFactor = 1.0m;
            if (request.Age > 50) ageFactor = 1.5m;
            else if (request.Age > 40) ageFactor = 1.2m;
            else if (request.Age > 30) ageFactor = 1.0m;
            else ageFactor = 0.9m;

            // Smoker factor
            decimal smokerFactor = request.SmokerStatus == "Smoker" ? 1.5m : 1.0m;

            // Term factor
            decimal termFactor = 1.0m + (request.TermYears / 100m);

            // Calculate premiums
            decimal totalPremium = basePremium * ageFactor * smokerFactor * termFactor;
            decimal monthlyPremium = totalPremium / (request.TermYears * 12);
            decimal quarterlyPremium = monthlyPremium * 3;
            decimal yearlyPremium = monthlyPremium * 12;

            // Add admin fee and tax
            decimal taxAmount = totalPremium * 0.18m; // 18% GST
            decimal adminFee = product.AdminFee;

            return new PremiumCalculationResponse
            {
                TotalPremium = totalPremium + taxAmount + adminFee,
                MonthlyPremium = monthlyPremium,
                QuarterlyPremium = quarterlyPremium,
                YearlyPremium = yearlyPremium,
                CoverageAmount = request.CoverageAmount,
                TermYears = request.TermYears,
                PremiumFrequency = "Monthly",
                AdminFee = adminFee,
                TaxAmount = taxAmount
            };
        }

        public async Task<PolicyDto> ActivatePolicyAsync(Guid policyId)
        {
            var policy = await _context.Policies
                .Include(p => p.Product)
                .FirstOrDefaultAsync(p => p.Id == policyId);

            if (policy == null)
                throw new KeyNotFoundException("Policy not found");

            if (policy.Status != PolicyStatus.Draft)
                throw new InvalidOperationException($"Cannot activate policy in {policy.Status} status");

            policy.Status = PolicyStatus.Active;
            policy.ActivationDate = DateTime.UtcNow;
            policy.UpdateTimestamp();

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Policy activated: {policy.PolicyNumber}");

            return await MapToPolicyDto(policy);
        }

        public async Task<PolicyDto> CancelPolicyAsync(Guid policyId, string reason)
        {
            var policy = await _context.Policies
                .Include(p => p.Product)
                .FirstOrDefaultAsync(p => p.Id == policyId);

            if (policy == null)
                throw new KeyNotFoundException("Policy not found");

            if (policy.Status != PolicyStatus.Active)
                throw new InvalidOperationException($"Cannot cancel policy in {policy.Status} status");

            policy.Status = PolicyStatus.Cancelled;
            policy.CancellationDate = DateTime.UtcNow;
            policy.CancellationReason = reason;
            policy.UpdateTimestamp();

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Policy cancelled: {policy.PolicyNumber}, Reason: {reason}");

            return await MapToPolicyDto(policy);
        }

        public async Task<PolicyDto> GetPolicyByIdAsync(Guid policyId)
        {
            var policy = await _context.Policies
                .Include(p => p.Product)
                .FirstOrDefaultAsync(p => p.Id == policyId);

            if (policy == null)
                throw new KeyNotFoundException("Policy not found");

            return await MapToPolicyDto(policy);
        }

        public async Task<IEnumerable<PolicyDto>> GetUserPoliciesAsync(Guid userId)
        {
            var policies = await _context.Policies
                .Include(p => p.Product)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var policyDtos = new List<PolicyDto>();
            foreach (var policy in policies)
            {
                policyDtos.Add(await MapToPolicyDto(policy));
            }

            return policyDtos;
        }

        public async Task<IEnumerable<InsuranceProductDto>> GetAvailableProductsAsync()
        {
            var products = await _context.InsuranceProducts
                .Where(p => p.IsActive)
                .ToListAsync();

            return products.Select(p => new InsuranceProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Category = p.Category,
                MinCoverageAmount = p.MinCoverageAmount,
                MaxCoverageAmount = p.MaxCoverageAmount,
                MinTermYears = p.MinTermYears,
                MaxTermYears = p.MaxTermYears,
                BasePremiumRate = p.BasePremiumRate,
                IsActive = p.IsActive,
                Features = string.IsNullOrEmpty(p.Features) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(p.Features) ?? new List<string>(),
                RequiredDocuments = string.IsNullOrEmpty(p.RequiredDocuments) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(p.RequiredDocuments) ?? new List<string>()
            });
        }

        public async Task<InsuranceProductDto> GetProductByIdAsync(Guid productId)
        {
            var product = await _context.InsuranceProducts.FindAsync(productId);
            if (product == null)
                throw new KeyNotFoundException("Product not found");

            return new InsuranceProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Category = product.Category,
                MinCoverageAmount = product.MinCoverageAmount,
                MaxCoverageAmount = product.MaxCoverageAmount,
                MinTermYears = product.MinTermYears,
                MaxTermYears = product.MaxTermYears,
                BasePremiumRate = product.BasePremiumRate,
                IsActive = product.IsActive,
                Features = string.IsNullOrEmpty(product.Features) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(product.Features) ?? new List<string>(),
                RequiredDocuments = string.IsNullOrEmpty(product.RequiredDocuments) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(product.RequiredDocuments) ?? new List<string>()
            };
        }

        public async Task<PolicyDocumentDto> UploadDocumentAsync(Guid policyId, UploadDocumentRequest request, Guid userId)
        {
            var policy = await _context.Policies.FindAsync(policyId);
            if (policy == null)
                throw new KeyNotFoundException("Policy not found");

            if (policy.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to upload documents for this policy");

            var document = new PolicyDocument
            {
                PolicyId = policyId,
                DocumentName = request.DocumentName,
                DocumentUrl = request.DocumentUrl,
                DocumentType = request.DocumentType,
                UploadDate = DateTime.UtcNow
            };

            _context.PolicyDocuments.Add(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Document uploaded for policy {policy.PolicyNumber}: {request.DocumentName}");

            return new PolicyDocumentDto
            {
                Id = document.Id,
                DocumentName = document.DocumentName,
                DocumentUrl = document.DocumentUrl,
                DocumentType = document.DocumentType,
                UploadDate = document.UploadDate,
                IsVerified = document.IsVerified
            };
        }

        public async Task<IEnumerable<PolicyDocumentDto>> GetPolicyDocumentsAsync(Guid policyId)
        {
            var documents = await _context.PolicyDocuments
                .Where(d => d.PolicyId == policyId)
                .OrderByDescending(d => d.UploadDate)
                .ToListAsync();

            return documents.Select(d => new PolicyDocumentDto
            {
                Id = d.Id,
                DocumentName = d.DocumentName,
                DocumentUrl = d.DocumentUrl,
                DocumentType = d.DocumentType,
                UploadDate = d.UploadDate,
                IsVerified = d.IsVerified
            });
        }

        public async Task<bool> MakePremiumPaymentAsync(Guid policyId, PayPremiumRequest request)
        {
            var premium = await _context.Premiums
                .FirstOrDefaultAsync(p => p.PolicyId == policyId && p.InstallmentNumber == request.InstallmentNumber);

            if (premium == null)
                throw new KeyNotFoundException("Premium installment not found");

            if (premium.PaymentStatus == PaymentStatus.Completed)
                throw new InvalidOperationException("This premium has already been paid");

            premium.PaymentStatus = PaymentStatus.Completed;
            premium.PaidDate = DateTime.UtcNow;
            premium.TransactionId = request.TransactionId;
            premium.PaymentMethod = request.PaymentMethod;
            premium.UpdateTimestamp();

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Premium payment received for policy {policyId}, installment {request.InstallmentNumber}");

            return true;
        }

        public async Task<IEnumerable<PremiumPayment>> GetPremiumScheduleAsync(Guid policyId)
        {
            var premiums = await _context.Premiums
                .Where(p => p.PolicyId == policyId)
                .OrderBy(p => p.InstallmentNumber)
                .ToListAsync();

            return premiums;
        }

        private async Task CreatePremiumSchedule(Policy policy)
        {
            int totalInstallments;
            decimal installmentAmount;

            switch (policy.PaymentFrequency?.ToLower())
            {
                case "quarterly":
                    totalInstallments = policy.TermYears * 4;
                    installmentAmount = policy.TotalPremium / totalInstallments;
                    break;
                case "yearly":
                    totalInstallments = policy.TermYears;
                    installmentAmount = policy.TotalPremium / totalInstallments;
                    break;
                default: // monthly
                    totalInstallments = policy.TermYears * 12;
                    installmentAmount = policy.PremiumAmount;
                    break;
            }

            for (int i = 1; i <= totalInstallments; i++)
            {
                var premium = new PremiumPayment
                {
                    PolicyId = policy.Id,
                    InstallmentNumber = i,
                    Amount = installmentAmount,
                    DueDate = policy.StartDate.AddMonths(i * (policy.PaymentFrequency == "Yearly" ? 12 :
                                                              policy.PaymentFrequency == "Quarterly" ? 3 : 1)),
                    PaymentStatus = PaymentStatus.Pending
                };

                _context.Premiums.Add(premium);
            }

            await _context.SaveChangesAsync();
        }

        private string GeneratePolicyNumber()
        {
            return $"POL-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }

        private async Task<PolicyDto> MapToPolicyDto(Policy policy)
        {
            var product = await _context.InsuranceProducts.FindAsync(policy.ProductId);
            var premiums = await _context.Premiums
                .Where(p => p.PolicyId == policy.Id)
                .OrderBy(p => p.InstallmentNumber)
                .ToListAsync();

            var nextPremium = premiums.FirstOrDefault(p => p.PaymentStatus == PaymentStatus.Pending);

            return new PolicyDto
            {
                Id = policy.Id,
                PolicyNumber = policy.PolicyNumber,
                ProductName = product?.Name ?? string.Empty,
                ProductCategory = product?.Category ?? string.Empty,
                CoverageAmount = policy.CoverageAmount,
                TermYears = policy.TermYears,
                PremiumAmount = policy.PremiumAmount,
                TotalPremium = policy.TotalPremium,
                StartDate = policy.StartDate,
                EndDate = policy.EndDate,
                Status = policy.Status.ToString(),
                PaidPremiums = premiums.Count(p => p.PaymentStatus == PaymentStatus.Completed),
                TotalPremiums = premiums.Count,
                NextPremiumAmount = nextPremium?.Amount ?? 0,
                NextPremiumDueDate = nextPremium?.DueDate,
                PaymentFrequency = policy.PaymentFrequency ?? "Monthly",
                BeneficiaryName = policy.BeneficiaryName
            };
        }
    }
}