using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PolicyService.DTOs;
using PolicyService.Models;
using PolicyService.Services;
using SmartSure.SharedKernel;
using System.Security.Claims;

namespace PolicyService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PolicyController : ControllerBase
    {
        private readonly IPolicyService _policyService;
        private readonly ILogger<PolicyController> _logger;

        public PolicyController(IPolicyService policyService, ILogger<PolicyController> logger)
        {
            _policyService = policyService;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("UserId")?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException());
        }

        /// <summary>
        /// Get all available insurance products
        /// GET /api/Policy/products
        /// </summary>
        [HttpGet("products")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _policyService.GetAvailableProductsAsync();
            return Ok(ApiResponse<IEnumerable<InsuranceProductDto>>.Ok(products));
        }

        /// <summary>
        /// Get insurance product by ID
        /// GET /api/Policy/products/{id}
        /// </summary>
        [HttpGet("products/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProduct(Guid id)
        {
            try
            {
                var product = await _policyService.GetProductByIdAsync(id);
                return Ok(ApiResponse<InsuranceProductDto>.Ok(product));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Calculate premium for a policy
        /// POST /api/Policy/calculate-premium
        /// </summary>
        [HttpPost("calculate-premium")]
        [AllowAnonymous]
        public async Task<IActionResult> CalculatePremium([FromBody] PremiumCalculationRequest request)
        {
            try
            {
                var result = await _policyService.CalculatePremiumAsync(request);
                return Ok(ApiResponse<PremiumCalculationResponse>.Ok(result));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Create a new policy
        /// POST /api/Policy/create
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> CreatePolicy([FromBody] CreatePolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _policyService.CreatePolicyAsync(request, userId);
                return Ok(ApiResponse<PolicyDto>.Ok(policy, "Policy created successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Activate a policy
        /// POST /api/Policy/{policyId}/activate
        /// </summary>
        [HttpPost("{policyId}/activate")]
        public async Task<IActionResult> ActivatePolicy(Guid policyId)
        {
            try
            {
                var policy = await _policyService.ActivatePolicyAsync(policyId);
                return Ok(ApiResponse<PolicyDto>.Ok(policy, "Policy activated successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Cancel a policy
        /// POST /api/Policy/{policyId}/cancel
        /// </summary>
        [HttpPost("{policyId}/cancel")]
        public async Task<IActionResult> CancelPolicy(Guid policyId, [FromBody] string reason)
        {
            try
            {
                var policy = await _policyService.CancelPolicyAsync(policyId, reason);
                return Ok(ApiResponse<PolicyDto>.Ok(policy, "Policy cancelled successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Get all policies for current user
        /// GET /api/Policy
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyPolicies()
        {
            var userId = GetUserId();
            var policies = await _policyService.GetUserPoliciesAsync(userId);
            return Ok(ApiResponse<IEnumerable<PolicyDto>>.Ok(policies));
        }

        /// <summary>
        /// Get policy by ID
        /// GET /api/Policy/{policyId}
        /// </summary>
        [HttpGet("{policyId}")]
        public async Task<IActionResult> GetPolicy(Guid policyId)
        {
            try
            {
                var policy = await _policyService.GetPolicyByIdAsync(policyId);
                return Ok(ApiResponse<PolicyDto>.Ok(policy));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Upload document for a policy
        /// POST /api/Policy/{policyId}/documents
        /// </summary>
        [HttpPost("{policyId}/documents")]
        public async Task<IActionResult> UploadDocument(Guid policyId, [FromBody] UploadDocumentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var document = await _policyService.UploadDocumentAsync(policyId, request, userId);
                return Ok(ApiResponse<PolicyDocumentDto>.Ok(document, "Document uploaded successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Get documents for a policy
        /// GET /api/Policy/{policyId}/documents
        /// </summary>
        [HttpGet("{policyId}/documents")]
        public async Task<IActionResult> GetDocuments(Guid policyId)
        {
            var documents = await _policyService.GetPolicyDocumentsAsync(policyId);
            return Ok(ApiResponse<IEnumerable<PolicyDocumentDto>>.Ok(documents));
        }

        /// <summary>
        /// Pay premium installment
        /// POST /api/Policy/{policyId}/pay-premium
        /// </summary>
        [HttpPost("{policyId}/pay-premium")]
        public async Task<IActionResult> PayPremium(Guid policyId, [FromBody] PayPremiumRequest request)
        {
            try
            {
                var result = await _policyService.MakePremiumPaymentAsync(policyId, request);
                return Ok(ApiResponse<bool>.Ok(result, "Payment successful"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
        }

        /// <summary>
        /// Get premium schedule for a policy
        /// GET /api/Policy/{policyId}/premium-schedule
        /// </summary>
        [HttpGet("{policyId}/premium-schedule")]
        public async Task<IActionResult> GetPremiumSchedule(Guid policyId)
        {
            var schedule = await _policyService.GetPremiumScheduleAsync(policyId);
            return Ok(ApiResponse<IEnumerable<PremiumPayment>>.Ok(schedule));
        }
    }
}