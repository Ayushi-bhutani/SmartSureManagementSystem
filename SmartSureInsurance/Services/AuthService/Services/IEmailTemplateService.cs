namespace AuthService.Services
{
    public interface IEmailTemplateService
    {
        string GetPasswordResetTemplate(string email, string resetLink);
        string GetEmailVerificationTemplate(string email, string verifyLink);
        string GetWelcomeTemplate(string firstName);
        string GetPolicyPurchaseTemplate(string policyNumber, string policyName);
        string GetClaimStatusTemplate(string claimNumber, string status);
    }

    public class EmailTemplateService : IEmailTemplateService
    {
        private readonly ILogger<EmailTemplateService> _logger;

        public EmailTemplateService(ILogger<EmailTemplateService> logger)
        {
            _logger = logger;
        }

        public string GetPasswordResetTemplate(string email, string resetLink)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Password Reset</title>
                    <style>
                        body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                        .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
                        .button:hover {{ opacity: 0.9; }}
                        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
                        .code {{ font-family: monospace; background: #f4f4f4; padding: 10px; border-radius: 5px; word-break: break-all; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>🔐 SmartSure Insurance</h1>
                            <p>Password Reset Request</p>
                        </div>
                        <div class='content'>
                            <h2>Hello,</h2>
                            <p>We received a request to reset the password for your SmartSure Insurance account associated with <strong>{email}</strong>.</p>
                            
                            <div class='warning'>
                                <strong>⚠️ Security Notice:</strong> If you didn't request this, please ignore this email. Your password will remain unchanged.
                            </div>
                            
                            <div style='text-align: center;'>
                                <a href='{resetLink}' class='button'>Reset Password</a>
                            </div>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <div class='code'>{resetLink}</div>
                            
                            <p><strong>⏰ This link will expire in 1 hour for security reasons.</strong></p>
                            
                            <hr style='margin: 30px 0;'>
                            
                            <p style='font-size: 14px; color: #666;'>
                                For security, we recommend creating a strong password that you don't use for other accounts.
                            </p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 SmartSure Insurance. All rights reserved.</p>
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";
        }

        public string GetEmailVerificationTemplate(string email, string verifyLink)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Verify Your Email</title>
                    <style>
                        body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                        .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
                        .button:hover {{ opacity: 0.9; }}
                        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                        .benefits {{ background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>✅ SmartSure Insurance</h1>
                            <p>Verify Your Email Address</p>
                        </div>
                        <div class='content'>
                            <h2>Welcome to SmartSure Insurance!</h2>
                            <p>Hi there,</p>
                            <p>Thank you for registering with SmartSure Insurance. Please verify your email address <strong>{email}</strong> to complete your registration and start using our services.</p>
                            
                            <div style='text-align: center;'>
                                <a href='{verifyLink}' class='button'>Verify Email Address</a>
                            </div>
                            
                            <div class='benefits'>
                                <strong>🎯 After verification, you can:</strong>
                                <ul style='margin-top: 10px;'>
                                    <li>Purchase insurance policies online</li>
                                    <li>Track your claims in real-time</li>
                                    <li>Access your policy documents</li>
                                    <li>Get instant premium calculations</li>
                                </ul>
                            </div>
                            
                            <p>If the button doesn't work, copy and paste this link:</p>
                            <div class='code'>{verifyLink}</div>
                            
                            <p><strong>⏰ This link will expire in 24 hours.</strong></p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 SmartSure Insurance. All rights reserved.</p>
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";
        }

        public string GetWelcomeTemplate(string firstName)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <title>Welcome to SmartSure Insurance</title>
                    <style>
                        body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }}
                        .content {{ padding: 30px; background: white; }}
                        .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>🎉 Welcome to SmartSure Insurance!</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {firstName}!</h2>
                            <p>We're thrilled to have you as part of the SmartSure family. Your journey to secure and smart insurance management starts here.</p>
                            
                            <h3>🚀 Getting Started:</h3>
                            <ul>
                                <li>Complete your profile for better recommendations</li>
                                <li>Explore our insurance products</li>
                                <li>Calculate premiums instantly</li>
                                <li>Purchase your first policy</li>
                            </ul>
                            
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='https://localhost:4200/dashboard' class='button'>Go to Dashboard</a>
                            </div>
                            
                            <p>Need help? Our support team is available 24/7 at support@smartsure.com</p>
                        </div>
                    </div>
                </body>
                </html>
            ";
        }

        public string GetPolicyPurchaseTemplate(string policyNumber, string policyName)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Policy Purchase Confirmation</title>
                </head>
                <body>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <div style='background: #28a745; color: white; padding: 20px; text-align: center;'>
                            <h1>Policy Purchased Successfully!</h1>
                        </div>
                        <div style='padding: 20px;'>
                            <h2>Policy Details:</h2>
                            <p><strong>Policy Number:</strong> {policyNumber}</p>
                            <p><strong>Policy Name:</strong> {policyName}</p>
                            <p>Your policy is now active. You can view all details in your dashboard.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";
        }

        public string GetClaimStatusTemplate(string claimNumber, string status)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Claim Status Update</title>
                </head>
                <body>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <div style='background: #007bff; color: white; padding: 20px; text-align: center;'>
                            <h1>Claim Status Update</h1>
                        </div>
                        <div style='padding: 20px;'>
                            <h2>Claim Number: {claimNumber}</h2>
                            <p><strong>Current Status:</strong> {status}</p>
                            <p>You can track your claim progress in the dashboard.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";
        }
    }
}