using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClaimsService.Models
{
    public class InsuranceClaim : BaseEntity
    {
        [Required]
        public Guid PolicyId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ClaimNumber { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ClaimAmount { get; set; }

        [Required]
        [MaxLength(500)]
        public string IncidentDescription { get; set; } = string.Empty;

        public DateTime IncidentDate { get; set; }

        public ClaimStatus Status { get; set; } = ClaimStatus.Draft;

        public DateTime? SubmittedDate { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public DateTime? RejectedDate { get; set; }
        public DateTime? ClosedDate { get; set; }

        [MaxLength(500)]
        public string? RejectionReason { get; set; }

        public string? AdjusterNotes { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ApprovedAmount { get; set; }

        // Navigation properties
        public virtual ICollection<ClaimDocument> Documents { get; set; } = new List<ClaimDocument>();
        public virtual ICollection<ClaimNote> Notes { get; set; } = new List<ClaimNote>();
    }
}