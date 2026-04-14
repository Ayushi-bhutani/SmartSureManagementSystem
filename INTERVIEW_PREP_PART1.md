# 🎯 Interview Prep Part 1: ASP.NET Core Fundamentals

## Topic 1: IActionResult vs ActionResult<T>

### Q1: What is the difference between IActionResult and ActionResult<T>?

**Answer:**

**IActionResult:**
- Interface that represents the result of an action method
- Returns any type of HTTP response
- Less type-safe
- Used when returning different types

**ActionResult<T>:**
- Generic class that wraps a specific return type
- Provides compile-time type safety
- Can return either T or IActionResult
- Better for API documentation (Swagger)

**Example from your project:**

```csharp
// IActionResult - Less specific
[HttpGet]
public IActionResult GetPolicies()
{
    var policies = _policyService.GetAll();
    return Ok(policies); // Could return any type
}

// ActionResult<T> - Type-safe
[HttpGet]
public ActionResult<List<Policy>> GetPolicies()
{
    var policies = _policyService.GetAll();
    return Ok(policies); // Compiler knows it returns List<Policy>
}
```

**When to use which:**
- Use `ActionResult<T>` for APIs (better Swagger docs)
- Use `IActionResult` when returning multiple different types

---

### Q2: Show me code examples from your project

**Answer:**

```csharp
// From AdminClaimsController.cs
[HttpGet]
public async Task<ActionResult<PagedResult<ClaimDto>>> GetAllClaims(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    var claims = await _claimService.GetAllClaimsAsync(page, pageSize);
    return Ok(claims);
}

// From DashboardController.cs
[HttpGet("stats")]
public async Task<IActionResult> GetDashboardStats()
{
    var stats = await GetStatsFromDatabase();
    return Ok(stats);
}
```

**Why different?**
- First uses `ActionResult<PagedResult<ClaimDto>>` - specific return type
- Second uses `IActionResult` - flexible for different response types

---

## Topic 2: Routing in ASP.NET Core

### Q3: What is routing in ASP.NET Core?

**Answer:**

Routing is the process of mapping incoming HTTP requests to specific controller actions.

**Two types:**
1. **Conventional Routing** - Defined in Program.cs
2. **Attribute Routing** - Defined on controllers/actions

**Your project uses Attribute Routing:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class PoliciesController : ControllerBase
{
    [HttpGet]                    // GET: api/policies
    [HttpGet("{id}")]           // GET: api/policies/123
    [HttpPost]                   // POST: api/policies
    [HttpPut("{id}")]           // PUT: api/policies/123
    [HttpDelete("{id}")]        // DELETE: api/policies/123
}
```

---

### Q4: Explain route tokens in your project

**Answer:**

**Route Tokens** are placeholders in route templates:

```csharp
[Route("api/[controller]")]  // [controller] = token
```

**Common tokens:**
- `[controller]` - Replaced with controller name (without "Controller")
- `[action]` - Replaced with action method name
- `{id}` - Route parameter

**Examples from your project:**

```csharp
// PoliciesController
[Route("api/[controller]")]  // Becomes: api/policies

[HttpGet("{id}")]            // Becomes: api/policies/123
public async Task<ActionResult<Policy>> GetPolicy(string id)

[HttpGet("user/{userId}")]   // Becomes: api/policies/user/456
public async Task<ActionResult<List<Policy>>> GetUserPolicies(string userId)
```

---

### Q5: What is [ApiController] attribute?

**Answer:**

`[ApiController]` enables API-specific behaviors:

**Features it enables:**
1. **Automatic Model Validation**
   ```csharp
   [HttpPost]
   public IActionResult Create([FromBody] PolicyDto policy)
   {
       // No need for: if (!ModelState.IsValid) return BadRequest();
       // [ApiController] does it automatically
   }
   ```

2. **Automatic 400 Response** for invalid models

3. **Binding Source Inference**
   - `[FromBody]` for complex types
   - `[FromRoute]` for route parameters
   - `[FromQuery]` for query strings

4. **Problem Details** for errors

**Your project example:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class ClaimsController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateClaim([FromBody] CreateClaimDto dto)
    {
        // Automatic validation - no manual ModelState check needed
        var claim = await _claimService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetClaim), new { id = claim.Id }, claim);
    }
}
```

---

## Topic 3: Middleware Pipeline

### Q6: What is middleware in ASP.NET Core?

**Answer:**

Middleware is software that's assembled into an application pipeline to handle requests and responses.

**Key Concepts:**
- Each middleware can:
  1. Process the request
  2. Pass to next middleware
  3. Process the response
  4. Short-circuit the pipeline

**Middleware Pipeline Order (Important!):**

```csharp
// From your Program.cs
var app = builder.Build();

// 1. Exception Handling (First!)
app.UseExceptionHandler("/error");

// 2. HTTPS Redirection
app.UseHttpsRedirection();

// 3. Static Files
app.UseStaticFiles();

// 4. Routing
app.UseRouting();

// 5. CORS (Before Authentication!)
app.UseCors();

// 6. Authentication (Before Authorization!)
app.UseAuthentication();

// 7. Authorization
app.UseAuthorization();

// 8. Endpoints (Last!)
app.MapControllers();
```

**Order matters!** Authentication must come before Authorization.

---

### Q7: Write code for custom middleware

**Answer:**

**Custom Exception Handling Middleware:**

```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // Pass to next middleware
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            ValidationException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        var response = new
        {
            error = exception.Message,
            statusCode = context.Response.StatusCode,
            timestamp = DateTime.UtcNow
        };

        return context.Response.WriteAsJsonAsync(response);
    }
}

// Extension method for easy registration
public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandling(
        this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}

// Usage in Program.cs
app.UseExceptionHandling();
```

---

### Q8: Explain middleware for customer authentication in your project

**Answer:**

**JWT Authentication Middleware Flow:**

```csharp
// 1. Configure in Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// 2. Add to pipeline
app.UseAuthentication();  // Validates JWT token
app.UseAuthorization();   // Checks roles/claims

// 3. Protect endpoints
[Authorize(Roles = "Customer")]
[HttpGet("my-policies")]
public async Task<IActionResult> GetMyPolicies()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var policies = await _policyService.GetUserPoliciesAsync(userId);
    return Ok(policies);
}
```

**Flow:**
1. Request arrives with JWT in Authorization header
2. Authentication middleware validates token
3. If valid, creates ClaimsPrincipal (User object)
4. Authorization middleware checks [Authorize] attribute
5. If authorized, request reaches controller
6. If not, returns 401/403

---

## Topic 4: Dependency Injection

### Q9: What is Dependency Injection? Explain service lifetimes.

**Answer:**

**Dependency Injection (DI)** is a design pattern where dependencies are provided to a class rather than the class creating them.

**Three Service Lifetimes:**

**1. Transient** - Created each time requested
```csharp
builder.Services.AddTransient<IEmailService, EmailService>();
```
- New instance every time
- Use for: Lightweight, stateless services
- Example: Email service, SMS service

**2. Scoped** - Created once per request
```csharp
builder.Services.AddScoped<IPolicyService, PolicyService>();
```
- Same instance within HTTP request
- Use for: Database contexts, repositories
- Example: DbContext, Unit of Work

**3. Singleton** - Created once for application lifetime
```csharp
builder.Services.AddSingleton<ICacheService, CacheService>();
```
- Single instance for entire app
- Use for: Configuration, caching, logging
- Example: Configuration settings, cache

---

### Q10: Show DI implementation from your project

**Answer:**

**Service Registration (Program.cs):**

```csharp
// Scoped - Per request
builder.Services.AddScoped<IPolicyService, PolicyService>();
builder.Services.AddScoped<IClaimService, ClaimService>();
builder.Services.AddScoped<IUserService, UserService>();

// DbContext - Always Scoped
builder.Services.AddDbContext<PolicyDbContext>(options =>
    options.UseSqlServer(connectionString));

// Singleton - App-wide
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

// Transient - Lightweight
builder.Services.AddTransient<IEmailService, EmailService>();
```

**Constructor Injection (Controller):**

```csharp
public class PoliciesController : ControllerBase
{
    private readonly IPolicyService _policyService;
    private readonly ILogger<PoliciesController> _logger;
    private readonly IUserService _userService;

    public PoliciesController(
        IPolicyService policyService,
        ILogger<PoliciesController> logger,
        IUserService userService)
    {
        _policyService = policyService;
        _logger = logger;
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPolicies()
    {
        _logger.LogInformation("Fetching all policies");
        var policies = await _policyService.GetAllAsync();
        return Ok(policies);
    }
}
```

**Service Implementation:**

```csharp
public interface IPolicyService
{
    Task<List<Policy>> GetAllAsync();
    Task<Policy> GetByIdAsync(string id);
    Task<Policy> CreateAsync(CreatePolicyDto dto);
}

public class PolicyService : IPolicyService
{
    private readonly PolicyDbContext _context;
    private readonly ILogger<PolicyService> _logger;

    public PolicyService(
        PolicyDbContext context,
        ILogger<PolicyService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Policy>> GetAllAsync()
    {
        return await _context.Policies
            .Include(p => p.InsuranceSubtype)
            .ToListAsync();
    }
}
```

---

### Q11: How do you inject inheritance in your project?

**Answer:**

**Interface-based Inheritance with DI:**

```csharp
// 1. Define base interface
public interface IBaseService<T> where T : class
{
    Task<T> GetByIdAsync(string id);
    Task<List<T>> GetAllAsync();
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(string id);
}

// 2. Implement base service
public class BaseService<T> : IBaseService<T> where T : class
{
    protected readonly DbContext _context;
    protected readonly DbSet<T> _dbSet;

    public BaseService(DbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T> GetByIdAsync(string id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<List<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }
}

// 3. Inherit in specific service
public interface IPolicyService : IBaseService<Policy>
{
    Task<List<Policy>> GetUserPoliciesAsync(string userId);
    Task<decimal> CalculatePremiumAsync(PolicyDto dto);
}

public class PolicyService : BaseService<Policy>, IPolicyService
{
    public PolicyService(PolicyDbContext context) : base(context)
    {
    }

    public async Task<List<Policy>> GetUserPoliciesAsync(string userId)
    {
        return await _dbSet
            .Where(p => p.UserId == userId)
            .ToListAsync();
    }

    public async Task<decimal> CalculatePremiumAsync(PolicyDto dto)
    {
        // Custom logic
        return await Task.FromResult(1000m);
    }
}

// 4. Register in DI
builder.Services.AddScoped<IPolicyService, PolicyService>();
builder.Services.AddScoped<IClaimService, ClaimService>();
```

**Benefits:**
- Code reuse (CRUD operations in base)
- Consistent interface
- Easy to test
- Follows DRY principle

---

## Topic 5: Exception Handling

### Q12: How do you implement exception handling in your project?

**Answer:**

**Three-Layer Exception Handling:**

**1. Custom Exceptions:**

```csharp
// Base exception
public class SmartSureException : Exception
{
    public int StatusCode { get; set; }

    public SmartSureException(string message, int statusCode = 500) 
        : base(message)
    {
        StatusCode = statusCode;
    }
}

// Specific exceptions
public class NotFoundException : SmartSureException
{
    public NotFoundException(string message) 
        : base(message, 404) { }
}

public class UnauthorizedException : SmartSureException
{
    public UnauthorizedException(string message) 
        : base(message, 401) { }
}

public class ValidationException : SmartSureException
{
    public ValidationException(string message) 
        : base(message, 400) { }
}
```

**2. Global Exception Handler:**

```csharp
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Exception occurred: {Message}", exception.Message);

        var (statusCode, message) = exception switch
        {
            NotFoundException => (404, exception.Message),
            UnauthorizedException => (401, exception.Message),
            ValidationException => (400, exception.Message),
            _ => (500, "An internal server error occurred")
        };

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(new
        {
            error = message,
            statusCode,
            timestamp = DateTime.UtcNow
        }, cancellationToken);

        return true;
    }
}

// Register in Program.cs
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
app.UseExceptionHandler();
```

**3. Usage in Services:**

```csharp
public class PolicyService : IPolicyService
{
    public async Task<Policy> GetByIdAsync(string id)
    {
        var policy = await _context.Policies.FindAsync(id);
        
        if (policy == null)
            throw new NotFoundException($"Policy with ID {id} not found");
            
        return policy;
    }

    public async Task<Policy> CreateAsync(CreatePolicyDto dto)
    {
        if (dto.PremiumAmount <= 0)
            throw new ValidationException("Premium amount must be greater than zero");

        var policy = new Policy
        {
            // Map properties
        };

        try
        {
            _context.Policies.Add(policy);
            await _context.SaveChangesAsync();
            return policy;
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error creating policy");
            throw new SmartSureException("Failed to create policy");
        }
    }
}
```

---

## 🎯 Quick Review - Key Points

1. **IActionResult vs ActionResult<T>**
   - ActionResult<T> is type-safe, better for APIs
   - IActionResult is flexible for multiple return types

2. **Routing**
   - Attribute routing with [Route], [HttpGet], etc.
   - Route tokens: [controller], [action], {id}
   - [ApiController] enables automatic validation

3. **Middleware**
   - Order matters: Exception → HTTPS → Auth → Authorization
   - Custom middleware for cross-cutting concerns
   - Use RequestDelegate to pass to next middleware

4. **Dependency Injection**
   - Transient: New instance each time
   - Scoped: One per request
   - Singleton: One for app lifetime
   - Constructor injection in controllers

5. **Exception Handling**
   - Custom exceptions with status codes
   - Global exception handler
   - Try-catch in services
   - Proper logging

---

**Next:** Read INTERVIEW_PREP_PART2.md for Microservices & Architecture questions! 🚀
