using ClaimsService.DTOs;
using ClaimsService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSure.SharedKernel;
using System.Security.Claims;

namespace ClaimsService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClaimsController : ControllerBase
    {
        private readonly IClaimsService _claimsService;
        private readonly ILogger<ClaimsController> _logger;

        public ClaimsController(IClaimsService claimsService, ILogger<ClaimsController> logger)
        {
            _claimsService = claimsService;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("UserId")?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException());
        }

        private string GetUserName()
        {
            return User.FindFirst(ClaimTypes.GivenName)?.Value
                ?? User.FindFirst(ClaimTypes.Name)?.Value
                ?? "Admin";
        }

        // ============================================
        // CUSTOMER ENDPOINTS
        // ============================================

        /// <summary>
        /// Create a new claim
        /// POST /api/Claims/create
        /// </summary>
        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreateClaim([FromBody] CreateClaimRequest request)
        {
            try
            {
                var userId = GetUserId();
                var claim = await _claimsService.CreateClaimAsync(request, userId);
                return Ok(ApiResponse<ClaimDto>.Ok(claim, "Claim created successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating claim");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while creating claim"));
            }
        }

        /// <summary>
        /// Get user's claims
        /// GET /api/Claims
        /// </summary>
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMyClaims()
        {
            try
            {
                var userId = GetUserId();
                var claims = await _claimsService.GetUserClaimsAsync(userId);
                return Ok(ApiResponse<IEnumerable<ClaimDto>>.Ok(claims));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user claims");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Get claim by ID
        /// GET /api/Claims/{claimId}
        /// </summary>
        [HttpGet("{claimId}")]
        [Authorize]
        public async Task<IActionResult> GetClaim(Guid claimId)
        {
            try
            {
                var userId = GetUserId();
                var claim = await _claimsService.GetClaimByIdAsync(claimId, userId);
                return Ok(ApiResponse<ClaimDto>.Ok(claim));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claim");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Upload document for claim
        /// POST /api/Claims/{claimId}/documents
        /// </summary>
        [HttpPost("{claimId}/documents")]
        [Authorize]
        public async Task<IActionResult> UploadDocument(Guid claimId, [FromBody] DocumentUploadRequest request)
        {
            try
            {
                var userId = GetUserId();
                var document = await _claimsService.UploadDocumentAsync(claimId, request, userId);
                return Ok(ApiResponse<ClaimDocumentDto>.Ok(document, "Document uploaded successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Get claim documents
        /// GET /api/Claims/{claimId}/documents
        /// </summary>
        [HttpGet("{claimId}/documents")]
        [Authorize]
        public async Task<IActionResult> GetDocuments(Guid claimId)
        {
            try
            {
                var userId = GetUserId();
                var documents = await _claimsService.GetClaimDocumentsAsync(claimId, userId);
                return Ok(ApiResponse<IEnumerable<ClaimDocumentDto>>.Ok(documents));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting documents");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Submit claim for review
        /// POST /api/Claims/{claimId}/submit
        /// </summary>
        [HttpPost("{claimId}/submit")]
        [Authorize]
        public async Task<IActionResult> SubmitClaim(Guid claimId)
        {
            try
            {
                var userId = GetUserId();
                var claim = await _claimsService.SubmitClaimAsync(claimId, userId);
                return Ok(ApiResponse<ClaimDto>.Ok(claim, "Claim submitted successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting claim");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        // ============================================
        // ADMIN ENDPOINTS
        // ============================================

        /// <summary>
        /// Get all claims (Admin only)
        /// GET /api/Claims/admin/all
        /// </summary>
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllClaims()
        {
            try
            {
                var claims = await _claimsService.GetAllClaimsAsync();
                return Ok(ApiResponse<IEnumerable<ClaimDto>>.Ok(claims));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all claims");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Get claims by status (Admin only)
        /// GET /api/Claims/admin/status/{status}
        /// </summary>
        [HttpGet("admin/status/{status}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetClaimsByStatus(int status)
        {
            try
            {
                var claimStatus = (ClaimStatus)status;
                var claims = await _claimsService.GetClaimsByStatusAsync(claimStatus);
                return Ok(ApiResponse<IEnumerable<ClaimDto>>.Ok(claims));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claims by status");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Review claim (Admin only)
        /// POST /api/Claims/admin/{claimId}/review
        /// </summary>
        [HttpPost("admin/{claimId}/review")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReviewClaim(Guid claimId, [FromBody] ClaimReviewRequest request)
        {
            try
            {
                var adminName = GetUserName();
                var claim = await _claimsService.ReviewClaimAsync(claimId, request, adminName);
                return Ok(ApiResponse<ClaimDto>.Ok(claim, $"Claim {request.Status} successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reviewing claim");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Approve claim (Admin only)
        /// POST /api/Claims/admin/{claimId}/approve
        /// </summary>
        [HttpPost("admin/{claimId}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveClaim(Guid claimId, [FromBody] decimal approvedAmount)
        {
            try
            {
                var adminName = GetUserName();
                var claim = await _claimsService.ApproveClaimAsync(claimId, approvedAmount, adminName);
                return Ok(ApiResponse<ClaimDto>.Ok(claim, "Claim approved successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving claim");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }

        /// <summary>
        /// Reject claim (Admin only)
        /// POST /api/Claims/admin/{claimId}/reject
        /// </summary>
        [HttpPost("admin/{claimId}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectClaim(Guid claimId, [FromBody] string reason)
        {
            try
            {
                var adminName = GetUserName();
                var claim = await _claimsService.RejectClaimAsync(claimId, reason, adminName);
                return Ok(ApiResponse<ClaimDto>.Ok(claim, "Claim rejected successfully"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting claim");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }
    }
}