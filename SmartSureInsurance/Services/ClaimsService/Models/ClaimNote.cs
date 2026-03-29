using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;

namespace ClaimsService.Models
{
    public class ClaimNote : BaseEntity
    {
        public Guid ClaimId { get; set; }
        public virtual InsuranceClaim? Claim { get; set; }

        [Required]
        public string Note { get; set; } = string.Empty;

        public string? CreatedBy { get; set; }
        public string? CreatedByRole { get; set; }

        public bool IsInternal { get; set; } = true; // Internal notes vs customer notes
    }
}