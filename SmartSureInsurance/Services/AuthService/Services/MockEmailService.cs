using Microsoft.Extensions.Logging;

namespace AuthService.Services
{
    public class MockEmailService : IEmailService
    {
        private readonly ILogger<MockEmailService> _logger;

        public MockEmailService(ILogger<MockEmailService> logger)
        {
            _logger = logger;
        }

        public Task<bool> SendEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation($"📧 MOCK EMAIL - To: {to}");
            _logger.LogInformation($"   Subject: {subject}");
            _logger.LogInformation($"   Body Preview: {(body.Length > 200 ? body.Substring(0, 200) : body)}...");
            _logger.LogInformation("========================================");
            return Task.FromResult(true);
        }

        public Task<bool> SendPasswordResetEmailAsync(string to, string resetToken)
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation($"🔐 PASSWORD RESET - Email: {to}");
            _logger.LogInformation($"   Reset Token: {resetToken}");
            _logger.LogInformation($"   Reset Link: https://localhost:4200/reset-password?token={resetToken}&email={to}");
            _logger.LogInformation("========================================");
            return Task.FromResult(true);
        }

        public Task<bool> SendEmailVerificationEmailAsync(string to, string verificationToken)
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation($"✅ EMAIL VERIFICATION - Email: {to}");
            _logger.LogInformation($"   Verification Token: {verificationToken}");
            _logger.LogInformation($"   Verify Link: https://localhost:4200/verify-email?token={verificationToken}&email={to}");
            _logger.LogInformation("========================================");
            return Task.FromResult(true);
        }

        public Task<bool> SendWelcomeEmailAsync(string to, string firstName)
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation($"🎉 WELCOME EMAIL - To: {to}, Name: {firstName}");
            _logger.LogInformation("========================================");
            return Task.FromResult(true);
        }

        public Task<bool> SendPolicyPurchaseEmailAsync(string to, string policyNumber, string policyName)
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation($"📄 POLICY PURCHASE - To: {to}, Policy: {policyNumber}");
            _logger.LogInformation("========================================");
            return Task.FromResult(true);
        }

        public Task<bool> SendClaimStatusUpdateEmailAsync(string to, string claimNumber, string status)
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation($"📋 CLAIM UPDATE - To: {to}, Claim: {claimNumber}, Status: {status}");
            _logger.LogInformation("========================================");
            return Task.FromResult(true);
        }
    }
}