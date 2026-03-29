using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;

namespace PolicyService.Models
{
    public class PolicyDocument : BaseEntity
    {
        public Guid PolicyId { get; set; }
        public virtual Policy? Policy { get; set; }

        [Required]
        [MaxLength(200)]
        public string DocumentName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string DocumentUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? DocumentType { get; set; }

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        public bool IsVerified { get; set; } = false;
        public string? VerifiedBy { get; set; }
        public DateTime? VerifiedDate { get; set; }
    }
}