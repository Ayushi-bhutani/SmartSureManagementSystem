using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace AuthService.Services
{
    public class EmailSettings
    {
        public string SmtpServer { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderName { get; set; } = "SmartSure Insurance";
        public string Password { get; set; } = string.Empty;
        public bool UseSsl { get; set; } = true;
        public bool EnableEmail { get; set; } = true;
        public int RetryCount { get; set; } = 3;
        public int RetryDelaySeconds { get; set; } = 2;
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;
        private readonly IEmailTemplateService _templateService;

        public EmailService(
            IOptions<EmailSettings> emailSettings,
            ILogger<EmailService> logger,
            IEmailTemplateService templateService)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
            _templateService = templateService;

            // Log email settings on startup
            _logger.LogInformation($"EmailService initialized with SMTP: {_emailSettings.SmtpServer}:{_emailSettings.SmtpPort}");
            _logger.LogInformation($"Sender Email: {_emailSettings.SenderEmail}");
            _logger.LogInformation($"Email Enabled: {_emailSettings.EnableEmail}");
            _logger.LogInformation($"Password Present: {!string.IsNullOrEmpty(_emailSettings.Password)}");
            if (!string.IsNullOrEmpty(_emailSettings.Password))
            {
                _logger.LogInformation($"Password Length: {_emailSettings.Password.Length}");
            }
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation($"========================================");
            _logger.LogInformation($"📧 SENDING EMAIL");
            _logger.LogInformation($"========================================");
            _logger.LogInformation($"To: {to}");
            _logger.LogInformation($"Subject: {subject}");
            _logger.LogInformation($"Email Enabled: {_emailSettings.EnableEmail}");

            if (!_emailSettings.EnableEmail)
            {
                _logger.LogWarning($"Email sending disabled. Would send to: {to}");
                return false;
            }

            if (string.IsNullOrEmpty(_emailSettings.SenderEmail) || string.IsNullOrEmpty(_emailSettings.Password))
            {
                _logger.LogError("Email credentials not configured properly");
                _logger.LogError($"SenderEmail: {(_emailSettings.SenderEmail ?? "NULL")}");
                _logger.LogError($"Password: {(_emailSettings.Password == null ? "NULL" : $"Present (Length: {_emailSettings.Password.Length})")}");
                return false;
            }

            for (int attempt = 1; attempt <= _emailSettings.RetryCount; attempt++)
            {
                try
                {
                    _logger.LogInformation($"Attempt {attempt}/{_emailSettings.RetryCount}...");
                    _logger.LogInformation($"SMTP Server: {_emailSettings.SmtpServer}:{_emailSettings.SmtpPort}");

                    var email = new MimeMessage();
                    email.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
                    email.To.Add(MailboxAddress.Parse(to));
                    email.Subject = subject;

                    var builder = new BodyBuilder
                    {
                        HtmlBody = body,
                        TextBody = StripHtml(body)
                    };

                    email.Body = builder.ToMessageBody();

                    _logger.LogInformation($"Connecting to SMTP server...");

                    using var smtp = new SmtpClient();

                    // Connect with timeout
                    await smtp.ConnectAsync(
                        _emailSettings.SmtpServer,
                        _emailSettings.SmtpPort,
                        _emailSettings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);

                    _logger.LogInformation($"Connected. Authenticating as {_emailSettings.SenderEmail}...");

                    await smtp.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.Password);

                    _logger.LogInformation($"Authenticated successfully. Sending email...");

                    await smtp.SendAsync(email);
                    await smtp.DisconnectAsync(true);

                    _logger.LogInformation($"✅ Email sent successfully to {to} on attempt {attempt}");
                    return true;
                }
                catch (SmtpCommandException ex)
                {
                    _logger.LogError(ex, $"SMTP Command Error on attempt {attempt}: {ex.Message}");
                    _logger.LogError($"StatusCode: {ex.StatusCode}");
                    _logger.LogError($"Error Message: {ex.Message}");

                    if (attempt < _emailSettings.RetryCount)
                    {
                        _logger.LogInformation($"Waiting {_emailSettings.RetryDelaySeconds * attempt} seconds before retry...");
                        await Task.Delay(TimeSpan.FromSeconds(_emailSettings.RetryDelaySeconds * attempt));
                    }
                }
                catch (SmtpProtocolException ex)
                {
                    _logger.LogError(ex, $"SMTP Protocol Error on attempt {attempt}: {ex.Message}");

                    if (attempt < _emailSettings.RetryCount)
                    {
                        await Task.Delay(TimeSpan.FromSeconds(_emailSettings.RetryDelaySeconds * attempt));
                    }
                }
                catch (AuthenticationException ex)
                {
                    _logger.LogError(ex, $"Authentication Failed on attempt {attempt}: {ex.Message}");
                    _logger.LogError("Please check your email credentials. For Gmail, use an App Password.");
                    break; // Don't retry authentication failures
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send email to {to}, attempt {attempt}/{_emailSettings.RetryCount}");
                    _logger.LogError($"Error Type: {ex.GetType().Name}");
                    _logger.LogError($"Error Message: {ex.Message}");

                    if (ex.InnerException != null)
                    {
                        _logger.LogError($"Inner Exception: {ex.InnerException.Message}");
                    }

                    if (attempt < _emailSettings.RetryCount)
                    {
                        _logger.LogInformation($"Waiting {_emailSettings.RetryDelaySeconds * attempt} seconds before retry...");
                        await Task.Delay(TimeSpan.FromSeconds(_emailSettings.RetryDelaySeconds * attempt));
                    }
                }
            }
            _logger.LogError($"❌ All {_emailSettings.RetryCount} attempts failed to send email to {to}");
            return false;
        }

        public async Task<bool> SendPasswordResetEmailAsync(string to, string resetToken)
        {
            _logger.LogInformation($"Preparing password reset email for {to}");
            var resetLink = $"https://localhost:4200/reset-password?token={resetToken}&email={to}";
            var body = _templateService.GetPasswordResetTemplate(to, resetLink);
            return await SendEmailAsync(to, "SmartSure - Password Reset Request", body);
        }

        public async Task<bool> SendEmailVerificationEmailAsync(string to, string verificationToken)
        {
            _logger.LogInformation($"Preparing verification email for {to}");
            _logger.LogInformation($"Verification Token: {verificationToken}");
            var verifyLink = $"https://localhost:4200/verify-email?token={verificationToken}&email={to}";
            var body = _templateService.GetEmailVerificationTemplate(to, verifyLink);
            return await SendEmailAsync(to, "SmartSure - Verify Your Email", body);
        }

        public async Task<bool> SendWelcomeEmailAsync(string to, string firstName)
        {
            _logger.LogInformation($"Preparing welcome email for {to}");
            var body = _templateService.GetWelcomeTemplate(firstName);
            return await SendEmailAsync(to, $"Welcome to SmartSure Insurance, {firstName}!", body);
        }

        public async Task<bool> SendPolicyPurchaseEmailAsync(string to, string policyNumber, string policyName)
        {
            var body = _templateService.GetPolicyPurchaseTemplate(policyNumber, policyName);
            return await SendEmailAsync(to, $"SmartSure - Policy {policyNumber} Purchased Successfully", body);
        }

        public async Task<bool> SendClaimStatusUpdateEmailAsync(string to, string claimNumber, string status)
        {
            var body = _templateService.GetClaimStatusTemplate(claimNumber, status);
            return await SendEmailAsync(to, $"SmartSure - Claim {claimNumber} Status Update", body);
        }

        private string StripHtml(string html)
        {
            return System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", string.Empty);
        }
    }
}