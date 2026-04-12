using IdentityService.Data;
using IdentityService.DTOs;
using IdentityService.Helpers;
using IdentityService.Models;
using IdentityService.Repositories;
using Microsoft.Extensions.Caching.Memory;
using MassTransit;
using SmartSure.Shared.Contracts.Events;
using SmartSure.Shared.Contracts.Exceptions;

namespace IdentityService.Services
{
    /// <summary>
    /// Core service responsible for user authentication, registration workflows,
    /// password management, and JWT generation. Highlights standard Identity procedures.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repo;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;
        private readonly IBus _bus;
        private readonly IEmailService _emailService;
        private readonly IOtpService _otpService;

        public AuthService(IUserRepository repo, TokenService tokenService, IConfiguration config,
            IMemoryCache cache, IBus bus, IEmailService emailService, IOtpService otpService)
        {
            _repo = repo;
            _tokenService = tokenService;
            _config = config;
            _cache = cache;
            _bus = bus;
            _emailService = emailService;
            _otpService = otpService;
        }

        #region User Profile & Management

        /// <summary>
        /// Allows a user to change their existing password by verifying the old password first.
        /// </summary>
        public async Task ChangePassword(string userId, ChangePasswordDTO dto)
        {
            var user = await _repo.GetByIdAsync(Guid.Parse(userId));
            if (user == null) throw new NotFoundException("User");

            if (!PasswordHasher.Verify(dto.OldPassword, user.Password.PasswordHash))
                throw new ValidationException("Invalid old password.");

            user.Password.PasswordHash = PasswordHasher.PasswordHash(dto.NewPassword);
            await _repo.SaveChangesAsync();
        }

        /// <summary>
        /// Resets a user's password using a one-time password (OTP) verification safely.
        /// </summary>
        public async Task ResetPasswordAsync(ResetPasswordWithOtpDTO dto)
        {
            bool isValid = await _otpService.ValidateOtpAsync(dto.Email, dto.Otp);
            if (!isValid) throw new ValidationException("Invalid or expired OTP.");

            var user = await _repo.GetByEmailAsync(dto.Email);
            if (user == null) throw new NotFoundException("User");

            user.Password.PasswordHash = PasswordHasher.PasswordHash(dto.NewPassword);
            await _repo.SaveChangesAsync();
        }

        /// <summary>
        /// Retrieves the profile information for a specific user ID.
        /// </summary>
        public async Task<UserDTO> GetProfile(string userId)
        {
            var user = await _repo.GetByIdAsync(Guid.Parse(userId));
            if (user == null) throw new NotFoundException("User");

            return new UserDTO
            {
                UserId      = user.UserId,
                Email       = user.Email,
                FullName    = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Address     = user.Address
            };
        }

        /// <summary>
        /// Performs the GetAllUsers operation.
        /// </summary>
        public async Task<List<UserDTO>> GetAllUsers()
        {
            var users = await _repo.GetAllAsync();
            return users.Select(user => new UserDTO
            {
                UserId      = user.UserId,
                Email       = user.Email,
                FullName    = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Address     = user.Address
            }).ToList();
        }

        #endregion

        #region Authentication & Sessions

        /// <summary>
        /// Authenticates user credentials and issues a JWT token along with a refresh token.
        /// </summary>
        public async Task<TokenResponseDTO> Login(LoginDTO dto)
        {
            var user = await _repo.GetByEmailAsync(dto.Email);
            if (user == null) throw new UnauthorizedException("Invalid credentials.");

            if (!PasswordHasher.Verify(dto.Password, user.Password.PasswordHash))
                throw new UnauthorizedException("Invalid credentials.");

            var roles    = user.UserRoles?.Select(ur => ur.Role.RoleName).ToList() ?? new List<string>();
            var audiences = new[] { "Aud1", "Aud2", "Aud3", "Aud4", "Aud5" }
                .Select(key => _config[$"Jwt:{key}"] ?? "")
                .Where(a => !string.IsNullOrEmpty(a))
                .ToList();

            var token        = _tokenService.BuildToken(_config["Jwt:Key"]!, _config["Jwt:Issuer"]!, audiences, user.UserId.ToString(), roles);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // Cache refresh token for 24 hours (no DB storage)
            _cache.Set($"refreshToken_{refreshToken}", user.UserId.ToString(), TimeSpan.FromHours(24));

            return new TokenResponseDTO
            {
                Token        = token,
                RefreshToken = refreshToken,
                Role         = roles.FirstOrDefault() ?? "Customer"
            };
        }

        /// <summary>
        /// Refreshes a JWT using a valid, cached refresh token to prolong user sessions transparently.
        /// </summary>
        public async Task<TokenResponseDTO> Refresh(string refreshToken)
        {
            if (!_cache.TryGetValue($"refreshToken_{refreshToken}", out string? userIdStr))
                throw new UnauthorizedException("Invalid or expired refresh token.");

            var userId = Guid.Parse(userIdStr!);
            var user   = await _repo.GetByIdAsync(userId);
            if (user == null) throw new NotFoundException("User");

            var roles    = user.UserRoles?.Select(ur => ur.Role.RoleName).ToList() ?? new List<string>();
            var audiences = new[] { "Aud1", "Aud2", "Aud3", "Aud4", "Aud5" }
                .Select(key => _config[$"Jwt:{key}"] ?? "")
                .Where(a => !string.IsNullOrEmpty(a))
                .ToList();

            var newToken        = _tokenService.BuildToken(_config["Jwt:Key"]!, _config["Jwt:Issuer"]!, audiences, user.UserId.ToString(), roles);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Revoke old token and cache new one
            _cache.Remove($"refreshToken_{refreshToken}");
            _cache.Set($"refreshToken_{newRefreshToken}", user.UserId.ToString(), TimeSpan.FromHours(24));

            return new TokenResponseDTO
            {
                Token        = newToken,
                RefreshToken = newRefreshToken,
                Role         = roles.FirstOrDefault() ?? "Customer"
            };
        }

        #endregion

        #region Registration Pipeline

        /// <summary>
        /// Initiates user registration by validating email uniqueness and triggering an OTP workflow.
        /// Registration data is kept in memory cache until verified.
        /// </summary>
        public async Task<string> Register(RegisterDTO dto)
        {
            var existingUser = await _repo.GetByEmailAsync(dto.Email);
            if (existingUser != null) throw new ConflictException("Email already exists.");

            // Generate a 6-digit OTP
            var random = new Random();
            string otp = random.Next(100000, 999999).ToString();

            // Cache the OTP and DTO
            _cache.Set($"RegistrationOtp_{dto.Email}",  otp, TimeSpan.FromMinutes(10));
            _cache.Set($"RegistrationData_{dto.Email}", dto, TimeSpan.FromMinutes(10));

            // Send Email asynchronously
            string subject = "Verify Your Registration – SmartSure Insurance";
string body = $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>SmartSure OTP Verification</title>
</head>
<body style=""margin:0; padding:0; background-color:#f4f7fb; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" bgcolor=""#f4f7fb"">
    <tr>
      <td align=""center"" style=""padding:40px 20px;"">
        <table width=""100%"" max-width=""550"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""max-width:550px; width:100%; background-color:#ffffff; border-radius:24px; box-shadow:0 8px 20px rgba(0,0,0,0.05);"">
          <tr>
            <td style=""background: linear-gradient(135deg, #0b3b5f 0%, #1b4f72 100%); padding:35px 30px; text-align:center;"">
              <h1 style=""margin:0; color:#ffffff; font-size:26px; font-weight:600;"">SmartSure Insurance</h1>
              <p style=""margin:10px 0 0; color:#d4e6f1; font-size:14px;"">Secure • Smart • Simple</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:35px 30px 30px;"">
              <h2 style=""margin:0 0 12px; font-size:22px; color:#1e2a3e;"">Verify Your Email Address</h2>
              <p style=""margin:0 0 20px; font-size:16px; line-height:1.5; color:#2c3e50;"">Hello <strong>{dto.FullName}</strong>,</p>
              <p style=""margin:0 0 20px; font-size:16px; line-height:1.5; color:#2c3e50;"">Thank you for registering with SmartSure Insurance. Please use the 6‑digit verification code below to complete your registration.</p>
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background-color:#f8fafc; border-radius:20px; margin:0 0 25px; border:1px solid #e2e8f0;"">
                <tr>
                  <td align=""center"" style=""padding:20px;"">
                    <span style=""font-size:14px; color:#475569; letter-spacing:2px;"">YOUR VERIFICATION CODE</span>
                    <p style=""margin:10px 0 0; font-size:36px; font-weight:700; letter-spacing:8px; color:#0b3b5f;"">{otp}</p>
                  </td>
                </tr>
              </table>
              <p style=""margin:0 0 10px; font-size:14px; color:#5a6e7c;"">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
              <hr style=""margin:25px 0 20px; border:0; border-top:1px solid #e4e9f0;"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background-color:#eef2f9; border-radius:16px;"">
                <tr>
                  <td style=""padding:18px 20px;"">
                    <p style=""margin:0; font-size:14px; color:#1e2a3e;"">✨ <strong>After verification, you can:</strong><br>✔ Purchase policies online<br>✔ Track claims in real‑time<br>✔ Access documents instantly</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style=""background-color:#f9fafc; border-top:1px solid #e4e9f0; padding:20px 30px; text-align:center;"">
              <p style=""margin:0; font-size:12px; color:#7f8c8d;"">© 2025 SmartSure Insurance – 123 Insurance Ave, New York, NY 10001</p>
              <p style=""margin:10px 0 0;""><a href=""#"" style=""color:#1b4f72; text-decoration:none; font-size:12px;"">Privacy Policy</a> &nbsp;|&nbsp; <a href=""#"" style=""color:#1b4f72; text-decoration:none; font-size:12px;"">Contact Support</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendEmailAsync(dto.Email, subject, body);
                }
                catch (Exception)
                {
                    // For local development, the OTP is also printed to the console in EmailService
                }
            });

            return "OTP sent successfully. Please check your email to verify and complete registration.";
        }

        /// <summary>
        /// Completes user registration by validating the supplied OTP. 
        /// Creates the user and broadcast the 'UserRegisteredEvent' to other microservices.
        /// </summary>
        public async Task<string> VerifyRegistrationOtp(VerifyOtpDTO dto)
        {
            if (!_cache.TryGetValue($"RegistrationOtp_{dto.Email}", out string? cachedOtp))
                throw new ValidationException("OTP expired or invalid.");

            if (cachedOtp != dto.Otp)
                throw new ValidationException("Incorrect OTP.");

            if (!_cache.TryGetValue($"RegistrationData_{dto.Email}", out RegisterDTO? regDto))
                throw new ValidationException("Registration data not found or expired. Please register again.");

            // Create user
            var user = new User
            {
                UserId          = Guid.NewGuid(),
                FullName        = regDto!.FullName,
                Email           = regDto.Email,
                PhoneNumber     = regDto.PhoneNumber,
                Address         = "",
                IsEmailVerified = true,
                Password = new Password
                {
                    PassId       = Guid.NewGuid(),
                    PasswordHash = PasswordHasher.PasswordHash(regDto.Password)
                }
            };
            user.Password.UserId = user.UserId;

            await _repo.AddAsync(user);
            await _repo.SaveChangesAsync();

            await _bus.Publish(new UserRegisteredEvent(
                user.UserId,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                DateTime.UtcNow,
                false
            ));

            // Remove from cache
            _cache.Remove($"RegistrationOtp_{dto.Email}");
            _cache.Remove($"RegistrationData_{dto.Email}");

            // Send Welcome Email asynchronously
            string welcomeSubject = "Welcome to SmartSure Insurance!";

string welcomeBody = $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Welcome to SmartSure</title>
</head>
<body style=""margin:0; padding:0; background-color:#f4f7fb; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" bgcolor=""#f4f7fb"">
    <tr>
      <td align=""center"" style=""padding:40px 20px;"">
        <table width=""100%"" max-width=""550"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""max-width:550px; width:100%; background-color:#ffffff; border-radius:24px; box-shadow:0 8px 20px rgba(0,0,0,0.05);"">
          <tr>
            <td style=""background: linear-gradient(135deg, #0b3b5f 0%, #1b4f72 100%); padding:35px 30px; text-align:center;"">
              <h1 style=""margin:0; color:#ffffff; font-size:26px; font-weight:600;"">Welcome, {user.FullName}!</h1>
              <p style=""margin:10px 0 0; color:#d4e6f1; font-size:14px;"">Your journey with us starts now</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:35px 30px 30px;"">
              <p style=""margin:0 0 20px; font-size:16px; line-height:1.5; color:#2c3e50;"">Thank you for joining <strong>SmartSure Insurance</strong>. Your email has been successfully verified.</p>
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background-color:#eef2f9; border-radius:20px; margin:0 0 25px;"">
                <tr>
                  <td style=""padding:20px 25px;"">
                    <p style=""margin:0 0 12px; font-size:16px; font-weight:600; color:#1e2a3e;"">🚀 What you can do next:</p>
                    <ul style=""margin:0; padding-left:20px; font-size:15px; color:#2c3e50; line-height:1.6;"">
                      <li>Browse and buy insurance policies</li>
                      <li>File and track claims online</li>
                      <li>Download policy documents anytime</li>
                      <li>Get instant premium calculations</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">
                <tr>
                  <td align=""center"" style=""padding:10px 0 5px;"">
                    <a href=""https://localhost:4200/login"" style=""display:inline-block; background:#1b4f72; color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; padding:12px 28px; border-radius:40px;"">Login to Your Account</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style=""background-color:#f9fafc; border-top:1px solid #e4e9f0; padding:20px 30px; text-align:center;"">
              <p style=""margin:0; font-size:12px; color:#7f8c8d;"">© 2025 SmartSure Insurance – 123 Insurance Ave, New York, NY 10001</p>
            </td>
          </tr>
        </table>
      </table>
    </tr>
  </table>
</body>
</html>";
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendEmailAsync(user.Email, welcomeSubject, welcomeBody);
                }
                catch
                {
                    // Not critical if welcome email fails
                }
            });

            return "Registration successful and verified";
        }

        /// <summary>
        /// Performs the UpdateProfile operation.
        /// </summary>
        public async Task UpdateProfile(string userId, UpdateUserDTO dto)
        {
            var user = await _repo.GetByIdAsync(Guid.Parse(userId));
            if (user == null) throw new NotFoundException("User");

            user.FullName    = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Address     = dto.Address;

            await _repo.SaveChangesAsync();
        }

        #endregion
    }
}
