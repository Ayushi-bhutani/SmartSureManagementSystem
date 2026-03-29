using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace ClaimsService.Models
{
    public class ClaimDocument : BaseEntity
    {
        public Guid ClaimId { get; set; }
        public virtual InsuranceClaim? Claim { get; set; }

        [Required]
        [MaxLength(200)]
        public string DocumentName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string DocumentUrl { get; set; } = string.Empty;

        public DocumentType DocumentType { get; set; }

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        public bool IsVerified { get; set; } = false;
        public string? VerifiedBy { get; set; }
        public DateTime? VerifiedDate { get; set; }

        [MaxLength(500)]
        public string? VerificationNotes { get; set; }
    }
}