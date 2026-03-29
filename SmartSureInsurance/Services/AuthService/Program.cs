using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using AuthService.Data;
using AuthService.Services;
using SmartSure.SharedKernel;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Force reload configuration to ensure it's read
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

// Load user secrets in development (for secure credential storage)
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Auth Service API",
        Version = "v1",
        Description = "Authentication and Authorization Service for SmartSure Insurance"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ============================================
// Database Configuration
// ============================================
var connectionString = builder.Configuration.GetConnectionString("AuthDb");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Database connection string 'AuthDb' is not configured.");
}

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlServer(connectionString));

// ============================================
// JWT Settings Configuration
// ============================================
var jwtSettings = new JwtSettings();

// Bind from configuration
builder.Configuration.GetSection("JwtSettings").Bind(jwtSettings);

// If binding fails, try direct reading
if (string.IsNullOrEmpty(jwtSettings.Secret))
{
    jwtSettings.Secret = builder.Configuration["JwtSettings:Secret"];
    jwtSettings.Issuer = builder.Configuration["JwtSettings:Issuer"];
    jwtSettings.Audience = builder.Configuration["JwtSettings:Audience"];
    var expMinutes = builder.Configuration["JwtSettings:ExpirationMinutes"];
    if (!string.IsNullOrEmpty(expMinutes))
    {
        jwtSettings.ExpirationMinutes = int.Parse(expMinutes);
    }
}

// Fallback for testing (remove in production)
if (string.IsNullOrEmpty(jwtSettings.Secret))
{
    Console.WriteLine("⚠️ WARNING: Using hardcoded JWT Secret! This should only be for testing.");
    jwtSettings.Secret = "YourSuperSecretKeyForJWTTokenGenerationThatIsAtLeast32CharsLong!2024";
    jwtSettings.Issuer = "SmartSure";
    jwtSettings.Audience = "SmartSureClients";
    jwtSettings.ExpirationMinutes = 60;
}

// Print JWT settings for debugging
Console.WriteLine("========================================");
Console.WriteLine("JWT Settings Loaded:");
Console.WriteLine($"Secret Present: {(string.IsNullOrEmpty(jwtSettings.Secret) ? "NO" : "YES")}");
Console.WriteLine($"Secret Length: {jwtSettings.Secret?.Length ?? 0}");
Console.WriteLine($"Issuer: {jwtSettings.Issuer}");
Console.WriteLine($"Audience: {jwtSettings.Audience}");
Console.WriteLine("========================================");

// Validate JWT settings
if (string.IsNullOrEmpty(jwtSettings.Secret))
{
    throw new InvalidOperationException("JWT Secret is null or empty. Please check appsettings.json");
}
if (jwtSettings.Secret.Length < 32)
{
    throw new InvalidOperationException($"JWT Secret must be at least 32 characters. Current length: {jwtSettings.Secret.Length}");
}

// Register JWT settings as singleton
builder.Services.AddSingleton(jwtSettings);

// ============================================
// Authentication Configuration
// ============================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(jwtSettings.Secret);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Append("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });

// ============================================
// Email Configuration with Best Practices
// ============================================

// Load email settings from configuration
var emailSettings = builder.Configuration.GetSection("EmailSettings").Get<EmailSettings>();
if (emailSettings == null)
{
    emailSettings = new EmailSettings();
}

// Validate email settings if enabled
if (emailSettings.EnableEmail)
{
    if (string.IsNullOrEmpty(emailSettings.SmtpServer))
    {
        Console.WriteLine("⚠️ WARNING: Email enabled but SMTP server not configured. Falling back to mock email mode.");
        emailSettings.EnableEmail = false;
    }
    else if (string.IsNullOrEmpty(emailSettings.SenderEmail) || string.IsNullOrEmpty(emailSettings.Password))
    {
        Console.WriteLine("⚠️ WARNING: Email enabled but sender credentials not configured. Falling back to mock email mode.");
        emailSettings.EnableEmail = false;
    }
    else
    {
        Console.WriteLine("✅ Email service configured successfully!");
        Console.WriteLine($"   SMTP Server: {emailSettings.SmtpServer}");
        Console.WriteLine($"   Sender Email: {emailSettings.SenderEmail}");
        Console.WriteLine($"   Retry Count: {emailSettings.RetryCount}");
    }
}
else
{
    Console.WriteLine("ℹ️ Email service is disabled. Using mock email mode (logs only).");
}

// Register email settings
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddSingleton(emailSettings);

// Register email services (real or mock based on configuration)
if (emailSettings.EnableEmail && !string.IsNullOrEmpty(emailSettings.SmtpServer))
{
    // Register real email services
    builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    Console.WriteLine("✅ Real Email Service registered.");
}
else
{
    // Register mock email service for development
    builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
    builder.Services.AddScoped<IEmailService, MockEmailService>();
    Console.WriteLine("📝 Mock Email Service registered (logs only).");
}

// ============================================
// Auth Service Registration with Email Support
// ============================================
builder.Services.AddScoped<IAuthService>(provider =>
{
    var context = provider.GetRequiredService<AuthDbContext>();
    var logger = provider.GetRequiredService<ILogger<AuthService.Services.AuthService>>();
    var emailService = provider.GetRequiredService<IEmailService>();
    return new AuthService.Services.AuthService(context, jwtSettings, logger, emailService);
});

// ============================================
// CORS Configuration
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });

    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

// ============================================
// Build Application
// ============================================
var app = builder.Build();

// ============================================
// Configure HTTP Pipeline
// ============================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Auth Service API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "SmartSure Auth Service API";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ============================================
// Configuration Test Endpoint
// ============================================
app.MapGet("/config-test", () => new
{
    jwtSecretLoaded = !string.IsNullOrEmpty(jwtSettings.Secret),
    jwtSecretLength = jwtSettings.Secret?.Length ?? 0,
    jwtIssuer = jwtSettings.Issuer,
    jwtAudience = jwtSettings.Audience,
    connectionStringLoaded = !string.IsNullOrEmpty(connectionString),
    emailEnabled = emailSettings.EnableEmail,
    emailConfigured = !string.IsNullOrEmpty(emailSettings.SmtpServer),
    emailProvider = emailSettings.EnableEmail ? "Real Email" : "Mock (Log Only)"
});

// ============================================
// Health Check Endpoint
// ============================================
app.MapGet("/health", () => new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow,
    services = new
    {
        database = "Connected",
        jwt = jwtSettings.Secret != null ? "Configured" : "Missing",
        email = emailSettings.EnableEmail ? "Configured" : "Mock Mode"
    }
});

// ============================================
// Database Verification
// ============================================
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        var canConnect = dbContext.Database.CanConnect();
        if (canConnect)
        {
            logger.LogInformation("✅ Successfully connected to database!");

            // Check if Users table exists
            try
            {
                var userCount = await dbContext.Users.CountAsync();
                logger.LogInformation($"✅ Users table exists with {userCount} records");
            }
            catch
            {
                logger.LogWarning("⚠️ Users table not found. Please run migrations: Update-Database");
            }
        }
        else
        {
            logger.LogError("❌ Cannot connect to database!");
            logger.LogError($"   Connection String: {connectionString?.Replace("Password=", "Password=***")}");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ Database connection error");
        logger.LogError($"   Error: {ex.Message}");
    }
}

// ============================================
// Application Startup Banner
// ============================================
Console.WriteLine("\n╔═══════════════════════════════════════════════════════════════╗");
Console.WriteLine("║     🚀 SmartSure Insurance - Auth Service Started!         ║");
Console.WriteLine("╠═══════════════════════════════════════════════════════════════╣");
Console.WriteLine($"║  Swagger UI:     https://localhost:5001/swagger              ║");
Console.WriteLine($"║  Config Test:    https://localhost:5001/config-test          ║");
Console.WriteLine($"║  Health Check:   https://localhost:5001/health               ║");
Console.WriteLine("╠═══════════════════════════════════════════════════════════════╣");
Console.WriteLine($"║  Email Mode:     {(emailSettings.EnableEmail ? "✅ REAL EMAIL" : "📝 MOCK (Logs Only)")}                ║");
Console.WriteLine($"║  Database:       {(await IsDatabaseConnected() ? "✅ Connected" : "❌ Disconnected")}                ║");
Console.WriteLine("╚═══════════════════════════════════════════════════════════════╝\n");

async Task<bool> IsDatabaseConnected()
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    try
    {
        return await dbContext.Database.CanConnectAsync();
    }
    catch
    {
        return false;
    }
}

app.Run();