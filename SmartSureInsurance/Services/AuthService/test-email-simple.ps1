# test-email-simple.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Email SMTP Connection" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# IMPORTANT: Replace with your actual Gmail App Password
$smtpServer = "smtp.gmail.com"
$smtpPort = 587
$username = "ayushibhutani15@gmail.com"
$password = "uevg vtfc qkvo trtg"  # ← REPLACE THIS!
$to = "ayushibhutani15@gmail.com"  # Send to yourself

Write-Host "SMTP Server: $smtpServer`:$smtpPort" -ForegroundColor Yellow
Write-Host "Username: $username" -ForegroundColor Yellow
Write-Host "Password length: $($password.Length)" -ForegroundColor Yellow
Write-Host "Recipient: $to" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Creating SMTP client..." -ForegroundColor Cyan
    $smtp = New-Object Net.Mail.SmtpClient($smtpServer, $smtpPort)
    $smtp.EnableSsl = $true
    $smtp.Timeout = 10000  # 10 second timeout
    $smtp.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    
    Write-Host "Creating email message..." -ForegroundColor Cyan
    $mail = New-Object Net.Mail.MailMessage
    $mail.From = $username
    $mail.To.Add($to)
    $mail.Subject = "Test Email from SmartSure Insurance"
    $mail.Body = @"
Hello,

This is a test email to verify that the SMTP settings for SmartSure Insurance are working correctly.

If you received this email, your email configuration is working!

Timestamp: $(Get-Date)

Regards,
SmartSure Insurance System
"@
    
    Write-Host "Sending test email..." -ForegroundColor Yellow
    $smtp.Send($mail)
    
    Write-Host ""
    Write-Host "✅ TEST SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Email sent successfully to: $to" -ForegroundColor Green
    Write-Host "Please check your inbox (and spam folder)." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ TEST FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*authentication*") {
        Write-Host ""
        Write-Host "🔐 Authentication Failed!" -ForegroundColor Yellow
        Write-Host "Please make sure:" -ForegroundColor Yellow
        Write-Host "  1. You have enabled 2-Step Verification on your Google Account" -ForegroundColor Yellow
        Write-Host "  2. You are using an App Password, not your regular password" -ForegroundColor Yellow
        Write-Host "  3. The App Password is exactly 16 characters with spaces" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Get App Password at: https://myaccount.google.com/apppasswords" -ForegroundColor Cyan
    } elseif ($_.Exception.Message -like "*connection*") {
        Write-Host ""
        Write-Host "🌐 Connection Failed!" -ForegroundColor Yellow
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. Your internet connection" -ForegroundColor Yellow
        Write-Host "  2. Firewall is not blocking port 587" -ForegroundColor Yellow
        Write-Host "  3. Try port 465 instead" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan