using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PolicyService.Models
{
    public class Policy : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid ProductId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PolicyNumber { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CoverageAmount { get; set; }

        [Required]
        public int TermYears { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PremiumAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPremium { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public PolicyStatus Status { get; set; } = PolicyStatus.Draft;

        public DateTime? ActivationDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public DateTime? CancellationDate { get; set; }

        [MaxLength(500)]
        public string? CancellationReason { get; set; }

        public string? BeneficiaryName { get; set; }
        public string? BeneficiaryRelationship { get; set; }
        public string? NomineeDetails { get; set; }

        public string PaymentFrequency { get; set; } = "Monthly";

        // Navigation properties
        public virtual InsuranceProduct? Product { get; set; }
        public virtual ICollection<PremiumPayment> Premiums { get; set; } = new List<PremiumPayment>();
        public virtual ICollection<PolicyDocument> Documents { get; set; } = new List<PolicyDocument>();
    }
}