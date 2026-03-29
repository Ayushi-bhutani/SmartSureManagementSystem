using ClaimsService.DTOs;
using ClaimsService.Models;
using Microsoft.AspNetCore.Components.Authorization;
using SmartSure.SharedKernel;

namespace ClaimsService.Services
{
    public interface IClaimsService
    {
        // Customer endpoints
        Task<ClaimDto> CreateClaimAsync(CreateClaimRequest request, Guid userId);
        Task<ClaimDto> GetClaimByIdAsync(Guid claimId, Guid userId);
        Task<IEnumerable<ClaimDto>> GetUserClaimsAsync(Guid userId);
        Task<ClaimDocumentDto> UploadDocumentAsync(Guid claimId, DocumentUploadRequest request, Guid userId);
        Task<IEnumerable<ClaimDocumentDto>> GetClaimDocumentsAsync(Guid claimId, Guid userId);
        Task<ClaimDto> SubmitClaimAsync(Guid claimId, Guid userId);

        // Admin endpoints
        Task<IEnumerable<ClaimDto>> GetAllClaimsAsync();
        Task<IEnumerable<ClaimDto>> GetClaimsByStatusAsync(ClaimStatus status);
        Task<ClaimDto> ReviewClaimAsync(Guid claimId, ClaimReviewRequest request, string adminName);
        Task<ClaimDto> ApproveClaimAsync(Guid claimId, decimal approvedAmount, string adminName);
        Task<ClaimDto> RejectClaimAsync(Guid claimId, string reason, string adminName);

        // Helper methods
        Task<ClaimDto> MapToClaimDto(InsuranceClaim claim);
        string GenerateClaimNumber();
    }
}