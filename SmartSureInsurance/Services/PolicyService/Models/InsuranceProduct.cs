using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PolicyService.Models
{
    public class InsuranceProduct : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // Life, Health, Auto, Home

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MinCoverageAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxCoverageAmount { get; set; }

        [Required]
        public int MinTermYears { get; set; }

        [Required]
        public int MaxTermYears { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal BasePremiumRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal AdminFee { get; set; }

        public bool IsActive { get; set; } = true;

        public string Features { get; set; } = string.Empty; // JSON string
        public string EligibilityCriteria { get; set; } = string.Empty;
        public string RequiredDocuments { get; set; } = string.Empty; // JSON array

        // Navigation properties
        public virtual ICollection<Policy> Policies { get; set; } = new List<Policy>();
    }
}