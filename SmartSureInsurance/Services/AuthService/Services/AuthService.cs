using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using AuthService.Data;
using AuthService.DTOs;
using AuthService.Models;
using SmartSure.SharedKernel;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Security.Cryptography;

namespace AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly AuthDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;
        private readonly IEmailService _emailService;

        // Updated constructor - accepts JwtSettings directly, not IOptions
        public AuthService(AuthDbContext context, JwtSettings jwtSettings, ILogger<AuthService> logger, IEmailService emailService)
        {
            _context = context;
            _jwtSettings = jwtSettings;
            _logger = logger;
            _emailService = emailService;  // Add this line
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress)
        {
            try
            {
                _logger.LogInformation($"Attempting to register user: {request.Email}");

                // Validate request
                if (request == null)
                    throw new ArgumentNullException(nameof(request));

                // Check if user exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    _logger.LogWarning($"User already exists: {request.Email}");
                    throw new InvalidOperationException("User with this email already exists");
                }

                // Create password hash using BCrypt
                string passwordHash;
                try
                {
                    passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error hashing password for user: {Email}", request.Email);
                    throw new InvalidOperationException("Error processing password. Please try again.", ex);
                }

                // ============================================
                // GENERATE VERIFICATION TOKEN
                // ============================================
                var verificationToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                _logger.LogInformation($"Generated verification token for {request.Email}: {verificationToken}");

                // Create new user WITH verification token
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = request.Email.Trim().ToLower(),
                    FirstName = request.FirstName?.Trim() ?? string.Empty,
                    LastName = request.LastName?.Trim() ?? string.Empty,
                    PasswordHash = passwordHash,
                    PhoneNumber = request.PhoneNumber?.Trim(),
                    Address = request.Address?.Trim(),
                    DateOfBirth = request.DateOfBirth ?? DateTime.UtcNow.AddYears(-30),
                    Role = UserRole.Customer,
                    IsActive = true,
                    IsEmailVerified = false,
                    CreatedAt = DateTime.UtcNow,
                    EmailVerificationToken = verificationToken,  // ← ADD THIS
                    EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)  // ← ADD THIS
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"User saved to database: {user.Email}");

                // ============================================
                // SEND VERIFICATION EMAIL - THIS IS MISSING!
                // ============================================
                try
                {
                    _logger.LogInformation($"Attempting to send verification email to {user.Email}...");
                    var emailSent = await _emailService.SendEmailVerificationEmailAsync(user.Email, verificationToken);

                    if (emailSent)
                    {
                        _logger.LogInformation($"✅ Verification email sent successfully to {user.Email}");
                    }
                    else
                    {
                        _logger.LogWarning($"⚠️ Failed to send verification email to {user.Email}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error sending verification email to {user.Email}");
                    // Don't throw - user can still register, they can request verification later
                }

                // Generate tokens
                var accessToken = GenerateAccessToken(user);
                var refreshToken = await GenerateRefreshTokenAsync(user.Id, ipAddress);

                return new AuthResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken.Token,
                    User = MapToUserDto(user),
                    ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                    TokenType = "Bearer"
                };
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during registration for user: {Email}", request.Email);
                throw new InvalidOperationException($"Database error: {ex.InnerException?.Message ?? ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration for user: {Email}", request.Email);
                throw;
            }
        }
        public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress)
        {
            try
            {
                _logger.LogInformation($"Login attempt for user: {request.Email}");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());

                if (user == null)
                {
                    _logger.LogWarning($"Login failed - user not found: {request.Email}");
                    throw new UnauthorizedAccessException("Invalid email or password");
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning($"Login failed - account deactivated: {request.Email}");
                    throw new UnauthorizedAccessException("Your account has been deactivated. Please contact support.");
                }

                // Verify password
                bool passwordValid;
                try
                {
                    passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error verifying password for user: {Email}", request.Email);
                    throw new UnauthorizedAccessException("Invalid email or password");
                }

                if (!passwordValid)
                {
                    _logger.LogWarning($"Login failed - invalid password for user: {request.Email}");
                    throw new UnauthorizedAccessException("Invalid email or password");
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Generate tokens
                var accessToken = GenerateAccessToken(user);
                var refreshToken = await GenerateRefreshTokenAsync(user.Id, ipAddress);

                _logger.LogInformation($"User logged in successfully: {user.Email}");

                return new AuthResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken.Token,
                    User = MapToUserDto(user),
                    ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                    TokenType = "Bearer"
                };
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login for user: {Email}", request.Email);
                throw new UnauthorizedAccessException("An error occurred during login. Please try again.");
            }
        }

        public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress)
        {
            try
            {
                _logger.LogInformation("Refresh token attempt");

                var token = await _context.RefreshTokens
                    .Include(rt => rt.User)
                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsRevoked);

                if (token == null)
                {
                    _logger.LogWarning("Refresh token not found");
                    throw new UnauthorizedAccessException("Invalid refresh token");
                }

                if (token.IsExpired)
                {
                    _logger.LogWarning("Refresh token expired");
                    throw new UnauthorizedAccessException("Refresh token has expired");
                }

                if (token.User == null)
                {
                    _logger.LogWarning("User not found for refresh token");
                    throw new UnauthorizedAccessException("Invalid refresh token");
                }

                // Revoke current refresh token
                token.IsRevoked = true;
                token.RevokedByIp = ipAddress;

                // Generate new tokens
                var newAccessToken = GenerateAccessToken(token.User);
                var newRefreshToken = await GenerateRefreshTokenAsync(token.UserId, ipAddress);

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Token refreshed successfully for user: {token.User.Email}");

                return new AuthResponse
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken.Token,
                    User = MapToUserDto(token.User),
                    ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                    TokenType = "Bearer"
                };
            }
            catch (UnauthorizedAccessException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                throw new UnauthorizedAccessException("An error occurred while refreshing token");
            }
        }

        public async Task<bool> LogoutAsync(string refreshToken, string ipAddress)
        {
            try
            {
                var token = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
                if (token != null && !token.IsRevoked)
                {
                    token.IsRevoked = true;
                    token.RevokedByIp = ipAddress;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"User logged out, token revoked");
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return false;
            }
        }

        public async Task<UserDto> GetUserByIdAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            return MapToUserDto(user);
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    throw new KeyNotFoundException("User not found");

                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                {
                    throw new UnauthorizedAccessException("Current password is incorrect");
                }

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                user.UpdateTimestamp();
                await _context.SaveChangesAsync();

                // Revoke all refresh tokens on password change
                var refreshTokens = await _context.RefreshTokens
                    .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                    .ToListAsync();

                foreach (var token in refreshTokens)
                {
                    token.IsRevoked = true;
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation($"Password changed for user: {user.Email}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());
            if (user == null)
            {
                _logger.LogInformation($"Password reset requested for non-existent email: {request.Email}");
                return true; // Don't reveal if email exists for security
            }

            // Generate reset token
            var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Generated reset token for {request.Email}: {resetToken}");

            // SEND PASSWORD RESET EMAIL
            try
            {
                var emailSent = await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken);
                if (emailSent)
                {
                    _logger.LogInformation($"✅ Password reset email sent to {user.Email}");
                }
                else
                {
                    _logger.LogWarning($"⚠️ Failed to send password reset email to {user.Email}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending password reset email to {user.Email}");
            }

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());
            if (user == null)
                throw new KeyNotFoundException("User not found");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdateTimestamp();
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Password reset for user: {user.Email}");
            return true;
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            try
            {
                _logger.LogInformation($"Verifying email with token: {token}");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
                if (user == null)
                {
                    _logger.LogWarning($"Invalid verification token: {token}");
                    return false;
                }

                if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                {
                    _logger.LogWarning($"Expired verification token for user: {user.Email}");
                    return false;
                }

                user.IsEmailVerified = true;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"✅ Email verified successfully for {user.Email}");

                // Send welcome email
                try
                {
                    await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);
                    _logger.LogInformation($"Welcome email sent to {user.Email}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error sending welcome email to {user.Email}");
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in VerifyEmailAsync: {ex.Message}");
                return false;
            }
        }

        private string GenerateAccessToken(User user)
        {
            // Add this check at the beginning
            if (_jwtSettings == null)
            {
                _logger.LogError("JWT Settings is NULL in GenerateAccessToken");
                throw new InvalidOperationException("JWT Settings not configured");
            }

            if (string.IsNullOrEmpty(_jwtSettings.Secret))
            {
                _logger.LogError("JWT Secret is NULL or EMPTY in GenerateAccessToken");
                throw new InvalidOperationException("JWT Secret not configured");
            }

            _logger.LogInformation($"Generating token with Secret length: {_jwtSettings.Secret.Length}");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.Secret);

            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
        new Claim(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
        new Claim(ClaimTypes.Surname, user.LastName ?? string.Empty),
        new Claim(ClaimTypes.Role, user.Role.ToString()),
        new Claim("UserId", user.Id.ToString()),
        new Claim("Email", user.Email ?? string.Empty)
    };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                Issuer = _jwtSettings.Issuer ?? "SmartSure",
                Audience = _jwtSettings.Audience ?? "SmartSureClients",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<RefreshToken> GenerateRefreshTokenAsync(Guid userId, string ipAddress)
        {
            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                CreatedByIp = ipAddress ?? "unknown",
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Role = user.Role.ToString(),
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                DateOfBirth = user.DateOfBirth,
                IsEmailVerified = user.IsEmailVerified,
                ProfilePictureUrl = user.ProfilePictureUrl
            };
        }

        public async Task<bool> ResendVerificationEmailAsync(string email)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLower());
                if (user == null)
                {
                    _logger.LogWarning($"Resend verification requested for non-existent email: {email}");
                    return false;
                }

                if (user.IsEmailVerified)
                {
                    _logger.LogWarning($"Resend verification requested for already verified email: {email}");
                    return false;
                }

                // Generate new verification token
                var verificationToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                user.EmailVerificationToken = verificationToken;
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Generated new verification token for {email}: {verificationToken}");

                // Send verification email
                var emailSent = await _emailService.SendEmailVerificationEmailAsync(user.Email, verificationToken);

                if (emailSent)
                {
                    _logger.LogInformation($"✅ Verification email resent to {user.Email}");
                    return true;
                }
                else
                {
                    _logger.LogWarning($"⚠️ Failed to resend verification email to {user.Email}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error resending verification email to {email}");
                return false;
            }
        }
    }
}