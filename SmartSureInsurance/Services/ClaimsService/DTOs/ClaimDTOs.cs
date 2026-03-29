using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace ClaimsService.DTOs
{
    // Request DTOs
    public class CreateClaimRequest
    {
        [Required]
        public Guid PolicyId { get; set; }

        [Required]
        [Range(1, 10000000)]
        public decimal ClaimAmount { get; set; }

        [Required]
        [MaxLength(500)]
        public string IncidentDescription { get; set; } = string.Empty;

        [Required]
        public DateTime IncidentDate { get; set; }

        public List<DocumentUploadRequest>? Documents { get; set; }
    }

    public class DocumentUploadRequest
    {
        [Required]
        public string DocumentName { get; set; } = string.Empty;

        [Required]
        public string DocumentUrl { get; set; } = string.Empty;

        public DocumentType DocumentType { get; set; }
    }

    public class ClaimReviewRequest
    {
        [Required]
        public ClaimStatus Status { get; set; }

        public decimal? ApprovedAmount { get; set; }

        public string? RejectionReason { get; set; }

        public string? AdjusterNotes { get; set; }
    }

    // Response DTOs
    public class ClaimDto
    {
        public Guid Id { get; set; }
        public string ClaimNumber { get; set; } = string.Empty;
        public Guid PolicyId { get; set; }
        public string? PolicyNumber { get; set; }
        public decimal ClaimAmount { get; set; }
        public string IncidentDescription { get; set; } = string.Empty;
        public DateTime IncidentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? SubmittedDate { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public string? RejectionReason { get; set; }
        public decimal ApprovedAmount { get; set; }
        public int DocumentCount { get; set; }
        public int VerifiedDocumentCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ClaimDocumentDto
    {
        public Guid Id { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public string DocumentUrl { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; }
        public bool IsVerified { get; set; }
        public string? VerificationNotes { get; set; }
    }

    public class ClaimNoteDto
    {
        public Guid Id { get; set; }
        public string Note { get; set; } = string.Empty;
        public string? CreatedBy { get; set; }
        public string? CreatedByRole { get; set; }
        public bool IsInternal { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}