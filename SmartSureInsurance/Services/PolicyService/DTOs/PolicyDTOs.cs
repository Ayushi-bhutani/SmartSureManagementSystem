using System.ComponentModel.DataAnnotations;

namespace PolicyService.DTOs
{
    public class CreatePolicyRequest
    {
        [Required]
        public Guid ProductId { get; set; }

        [Required]
        [Range(1000, 10000000)]
        public decimal CoverageAmount { get; set; }

        [Required]
        [Range(1, 50)]
        public int TermYears { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public string? BeneficiaryName { get; set; }
        public string? BeneficiaryRelationship { get; set; }
        public string? NomineeDetails { get; set; }

        public string PaymentFrequency { get; set; } = "Monthly";
    }

    public class PolicyDto
    {
        public Guid Id { get; set; }
        public string PolicyNumber { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ProductCategory { get; set; } = string.Empty;
        public decimal CoverageAmount { get; set; }
        public int TermYears { get; set; }
        public decimal PremiumAmount { get; set; }
        public decimal TotalPremium { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int PaidPremiums { get; set; }
        public int TotalPremiums { get; set; }
        public decimal NextPremiumAmount { get; set; }
        public DateTime? NextPremiumDueDate { get; set; }
        public string PaymentFrequency { get; set; } = string.Empty;
        public string? BeneficiaryName { get; set; }
    }

    public class PremiumCalculationRequest
    {
        [Required]
        public Guid ProductId { get; set; }

        [Required]
        public decimal CoverageAmount { get; set; }

        [Required]
        public int TermYears { get; set; }

        public int Age { get; set; } = 30;
        public string SmokerStatus { get; set; } = "Non-Smoker";
    }

    public class PremiumCalculationResponse
    {
        public decimal TotalPremium { get; set; }
        public decimal MonthlyPremium { get; set; }
        public decimal QuarterlyPremium { get; set; }
        public decimal YearlyPremium { get; set; }
        public decimal CoverageAmount { get; set; }
        public int TermYears { get; set; }
        public string PremiumFrequency { get; set; } = string.Empty;
        public decimal AdminFee { get; set; }
        public decimal TaxAmount { get; set; }
    }

    public class InsuranceProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal MinCoverageAmount { get; set; }
        public decimal MaxCoverageAmount { get; set; }
        public int MinTermYears { get; set; }
        public int MaxTermYears { get; set; }
        public decimal BasePremiumRate { get; set; }
        public bool IsActive { get; set; }
        public List<string> Features { get; set; } = new List<string>();
        public List<string> RequiredDocuments { get; set; } = new List<string>();
    }

    public class UploadDocumentRequest
    {
        [Required]
        public string DocumentName { get; set; } = string.Empty;

        [Required]
        public string DocumentUrl { get; set; } = string.Empty;

        public string? DocumentType { get; set; }
    }

    public class PolicyDocumentDto
    {
        public Guid Id { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public string DocumentUrl { get; set; } = string.Empty;
        public string? DocumentType { get; set; }
        public DateTime UploadDate { get; set; }
        public bool IsVerified { get; set; }
    }

    public class PayPremiumRequest
    {
        [Required]
        public int InstallmentNumber { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = string.Empty;

        public string? TransactionId { get; set; }
    }
}