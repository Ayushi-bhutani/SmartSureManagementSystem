using PolicyService.DTOs;
using PolicyService.Models;

namespace PolicyService.Services
{
    public interface IPolicyService
    {
        Task<PolicyDto> CreatePolicyAsync(CreatePolicyRequest request, Guid userId);
        Task<PolicyDto> ActivatePolicyAsync(Guid policyId);
        Task<PolicyDto> CancelPolicyAsync(Guid policyId, string reason);
        Task<PolicyDto> GetPolicyByIdAsync(Guid policyId);
        Task<IEnumerable<PolicyDto>> GetUserPoliciesAsync(Guid userId);
        Task<IEnumerable<InsuranceProductDto>> GetAvailableProductsAsync();
        Task<InsuranceProductDto> GetProductByIdAsync(Guid productId);
        Task<PremiumCalculationResponse> CalculatePremiumAsync(PremiumCalculationRequest request);
        Task<PolicyDocumentDto> UploadDocumentAsync(Guid policyId, UploadDocumentRequest request, Guid userId);
        Task<IEnumerable<PolicyDocumentDto>> GetPolicyDocumentsAsync(Guid policyId);
        Task<bool> MakePremiumPaymentAsync(Guid policyId, PayPremiumRequest request);
        Task<IEnumerable<PremiumPayment>> GetPremiumScheduleAsync(Guid policyId);
    }
}