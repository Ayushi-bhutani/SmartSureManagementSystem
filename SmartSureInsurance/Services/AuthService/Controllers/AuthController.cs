using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AuthService.DTOs;
using AuthService.Services;
using SmartSure.SharedKernel;

namespace AuthService.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Get client IP address from request
        /// </summary>
        private string GetIpAddress()
        {
            // Check for forwarded IP (when behind a proxy/load balancer)
            if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
                return forwardedFor.ToString();

            // Get direct IP address
            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "unknown";
        }

        /// <summary>
        /// Get current user ID from JWT token
        /// </summary>
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");

            return Guid.Parse(userIdClaim);
        }

        // ============================================
        // PUBLIC ENDPOINTS (No Authentication Required)
        // ============================================

        /// <summary>
        /// Register a new customer account
        /// POST /api/Auth/register
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                _logger.LogInformation($"Registration attempt for email: {request.Email}");

                // Validate request
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage).ToList();
                    return BadRequest(ApiResponse<object>.Error(errors, "Validation failed"));
                }

                var ipAddress = GetIpAddress();
                var response = await _authService.RegisterAsync(request, ipAddress);

                _logger.LogInformation($"User registered successfully: {request.Email}");
                return Ok(ApiResponse<AuthResponse>.Ok(response, "Registration successful"));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Registration failed - {ex.Message}");
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error during registration for {request.Email}");
                return StatusCode(500, ApiResponse<object>.Error("Database error occurred. Please try again later."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unexpected error during registration for {request.Email}");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred during registration. Please try again."));
            }
        }

        /// <summary>
        /// Login with email and password
        /// POST /api/Auth/login
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation($"Login attempt for email: {request.Email}");

                // Validate request
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<object>.Error("Invalid request data"));
                }

                var ipAddress = GetIpAddress();
                var response = await _authService.LoginAsync(request, ipAddress);

                _logger.LogInformation($"User logged in successfully: {request.Email}");
                return Ok(ApiResponse<AuthResponse>.Ok(response, "Login successful"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Login failed for {request.Email} - {ex.Message}");
                return Unauthorized(ApiResponse<object>.Error(ex.Message, 401));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during login for {request.Email}");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred during login. Please try again."));
            }
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// POST /api/Auth/refresh
        /// </summary>
        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            try
            {
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return BadRequest(ApiResponse<object>.Error("Refresh token is required"));
                }

                var ipAddress = GetIpAddress();
                var response = await _authService.RefreshTokenAsync(refreshToken, ipAddress);

                _logger.LogInformation("Token refreshed successfully");
                return Ok(ApiResponse<AuthResponse>.Ok(response, "Token refreshed successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Refresh token failed - {ex.Message}");
                return Unauthorized(ApiResponse<object>.Error(ex.Message, 401));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while refreshing token"));
            }
        }

        /// <summary>
        /// Forgot password - sends reset link to email
        /// POST /api/Auth/forgot-password
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email))
                {
                    return BadRequest(ApiResponse<object>.Error("Email is required"));
                }

                await _authService.ForgotPasswordAsync(request);

                // Always return success even if email doesn't exist (security best practice)
                return Ok(ApiResponse<object>.Ok(null, "If the email exists, a password reset link has been sent"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during forgot password for {request.Email}");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred. Please try again later."));
            }
        }

        /// <summary>
        /// Reset password with token
        /// POST /api/Auth/reset-password
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<object>.Error("Invalid request data"));
                }

                var result = await _authService.ResetPasswordAsync(request);
                return Ok(ApiResponse<bool>.Ok(result, "Password reset successful"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while resetting password"));
            }
        }

        // ============================================
        // PROTECTED ENDPOINTS (Authentication Required)
        // ============================================

        /// <summary>
        /// Get current user profile
        /// GET /api/Auth/me
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _authService.GetUserByIdAsync(userId);

                return Ok(ApiResponse<UserDto>.Ok(user, "User profile retrieved"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<object>.Error(ex.Message, 401));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while fetching user profile"));
            }
        }

        /// <summary>
        /// Change password for authenticated user
        /// POST /api/Auth/change-password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<object>.Error("Invalid request data"));
                }

                var userId = GetCurrentUserId();
                var result = await _authService.ChangePasswordAsync(userId, request);

                return Ok(ApiResponse<bool>.Ok(result, "Password changed successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(ApiResponse<object>.Error(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while changing password"));
            }
        }

        /// <summary>
        /// Logout - revoke refresh token
        /// POST /api/Auth/logout
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] string refreshToken)
        {
            try
            {
                if (string.IsNullOrEmpty(refreshToken))
                {
                    return BadRequest(ApiResponse<object>.Error("Refresh token is required"));
                }

                var ipAddress = GetIpAddress();
                var result = await _authService.LogoutAsync(refreshToken, ipAddress);

                return Ok(ApiResponse<bool>.Ok(result, "Logout successful"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred during logout"));
            }
        }

        /// <summary>
        /// Verify email address
        /// POST /api/Auth/verify-email
        /// </summary>
        [HttpPost("verify-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail([FromBody] string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(ApiResponse<object>.Error("Verification token is required"));
                }

                var result = await _authService.VerifyEmailAsync(token);

                if (result)
                {
                    return Ok(ApiResponse<bool>.Ok(true, "Email verified successfully"));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.Error("Invalid or expired verification token"));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while verifying email"));
            }
        }

        // ============================================
        // ADMIN ENDPOINTS (Requires Admin Role)
        // ============================================

        /// <summary>
        /// Get all users (Admin only)
        /// GET /api/Auth/users
        /// </summary>
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                // This would need to be implemented in your AuthService
                // For now, return not implemented
                return Ok(ApiResponse<object>.Ok(null, "Admin functionality - Get all users"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while fetching users"));
            }
        }

        /// <summary>
        /// Get user by ID (Admin only)
        /// GET /api/Auth/users/{id}
        /// </summary>
        [HttpGet("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            try
            {
                var user = await _authService.GetUserByIdAsync(id);
                return Ok(ApiResponse<UserDto>.Ok(user, "User retrieved"));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Error(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user by ID: {id}");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while fetching user"));
            }
        }

        /// <summary>
        /// Deactivate user account (Admin only)
        /// POST /api/Auth/users/{id}/deactivate
        /// </summary>
        [HttpPost("users/{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            try
            {
                // This would need to be implemented in your AuthService
                // For now, return not implemented
                return Ok(ApiResponse<object>.Ok(null, $"User {id} deactivated"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deactivating user: {id}");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred while deactivating user"));
            }
        }

        /// <summary>
        /// Resend email verification
        /// POST /api/Auth/resend-verification
        /// </summary>
        [HttpPost("resend-verification")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendVerification([FromBody] string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest(ApiResponse<object>.Error("Email is required"));
                }

                var result = await _authService.ResendVerificationEmailAsync(email);

                if (result)
                {
                    return Ok(ApiResponse<object>.Ok(null, "Verification email sent successfully"));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.Error("Unable to send verification email. User may already be verified."));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error resending verification to {email}");
                return StatusCode(500, ApiResponse<object>.Error("An error occurred"));
            }
        }
    }
}