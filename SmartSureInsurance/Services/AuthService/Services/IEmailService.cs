namespace AuthService.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body);
        Task<bool> SendPasswordResetEmailAsync(string to, string resetToken);
        Task<bool> SendEmailVerificationEmailAsync(string to, string verificationToken);
        Task<bool> SendWelcomeEmailAsync(string to, string firstName);
        Task<bool> SendPolicyPurchaseEmailAsync(string to, string policyNumber, string policyName);
        Task<bool> SendClaimStatusUpdateEmailAsync(string to, string claimNumber, string status);
    }
}