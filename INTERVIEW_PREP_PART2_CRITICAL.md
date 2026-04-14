# 🔥 CRITICAL Interview Questions - Must Know!

## These are the MOST LIKELY questions based on your trainer's mock interview

---

## Q1: Difference between IEnumerable and IQueryable ⭐⭐⭐

**Answer:**

| Feature | IEnumerable | IQueryable |
|---------|-------------|------------|
| **Namespace** | System.Collections | System.Linq |
| **Execution** | In-memory | Database-side |
| **Performance** | Loads all data first | Filters at database |
| **Use Case** | Small datasets | Large datasets |
| **LINQ Provider** | LINQ to Objects | LINQ to SQL/EF |

**Code Example:**

```csharp
// IEnumerable - BAD for large data
public IEnumerable<Policy> GetActivePolicies()
{
    // Loads ALL policies into memory first!
    IEnumerable<Policy> policies = _context.Policies.ToList();
    
    // Then filters in memory
    return policies.Where(p => p.Status == "Active");
    
    // SQL: SELECT * FROM Policies  (Gets everything!)
}

// IQueryable - GOOD for large data
public IQueryable<Policy> GetActivePolicies()
{
    // Builds query expression
    IQueryable<Policy> policies = _context.Policies;
    
    // Filters at database
    return policies.Where(p => p.Status == "Active");
    
    // SQL: SELECT * FROM Policies WHERE Status = 'Active'  (Filtered!)
}
```

**Real Example from Your Project:**

```csharp
// PolicyService.cs
public async Task<List<Policy>> GetUserPoliciesAsync(string userId)
{
    // Using IQueryable - efficient!
    return await _context.Policies
        .Where(p => p.UserId == userId)  // Filters at DB
        .Include(p => p.InsuranceSubtype)
        .ToListAsync();  // Executes query
        
    // SQL Generated:
    // SELECT * FROM Policies p
    // INNER JOIN InsuranceSubtypes s ON p.SubtypeId = s.Id
    // WHERE p.UserId = @userId
}
```

**When to use:**
- **IQueryable**: EF Core queries, large datasets
- **IEnumerable**: In-memory collections, small data

---

## Q2: JWT Token - Complete Explanation ⭐⭐⭐

**Answer:**

**JWT Structure:** `header.payload.signature`

**1. Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**2. Payload (Claims):**
```json
{
  "sub": "user123",
  "email": "john@example.com",
  "role": "Customer",
  "exp": 1735689600
}
```

**3. Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**Your Project Implementation:**

```csharp
// 1. Generate Token (IdentityService)
public string GenerateJwtToken(User user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.RoleName),
        new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
    };

    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddHours(24),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

// 2. Validate Token (Program.cs)
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

// 3. Use in Controller
[Authorize(Roles = "Customer")]
[HttpGet("my-policies")]
public async Task<IActionResult> GetMyPolicies()
{
    // Extract user ID from token
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var policies = await _policyService.GetUserPoliciesAsync(userId);
    return Ok(policies);
}
```

**appsettings.json:**
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong",
    "Issuer": "SmartSure",
    "Audience": "SmartSureUsers"
  }
}
```

---

## Q3: Ocelot API Gateway Configuration ⭐⭐⭐

**Answer:**

**What is Ocelot?**
- API Gateway for .NET microservices
- Single entry point for all client requests
- Routes requests to appropriate microservices
- Handles authentication, rate limiting, load balancing

**Your ocelot.json:**

```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/auth/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        {
          "Host": "localhost",
          "Port": 5001
        }
      ],
      "UpstreamPathTemplate": "/gateway/auth/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ]
    },
    {
      "DownstreamPathTemplate": "/api/policies/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        {
          "Host": "localhost",
          "Port": 5002
        }
      ],
      "UpstreamPathTemplate": "/gateway/policies/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "AuthenticationOptions": {
        "AuthenticationProviderKey": "Bearer"
      }
    },
    {
      "DownstreamPathTemplate": "/api/claims/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        {
          "Host": "localhost",
          "Port": 5003
        }
      ],
      "UpstreamPathTemplate": "/gateway/claims/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "AuthenticationOptions": {
        "AuthenticationProviderKey": "Bearer"
      }
    },
    {
      "DownstreamPathTemplate": "/api/admin/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        {
          "Host": "localhost",
          "Port": 5004
        }
      ],
      "UpstreamPathTemplate": "/gateway/admin/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "AuthenticationOptions": {
        "AuthenticationProviderKey": "Bearer"
      }
    }
  ],
  "GlobalConfiguration": {
    "BaseUrl": "http://localhost:5000"
  }
}
```

**Program.cs Configuration:**

```csharp
// Add Ocelot
builder.Services.AddOcelot();

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
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

var app = builder.Build();

// Use Ocelot
await app.UseOcelot();
```

**Request Flow:**

```
Client Request:
GET http://localhost:5000/gateway/policies/user/123

↓ Ocelot Gateway (Port 5000)
  - Validates JWT token
  - Checks route configuration
  - Forwards to downstream service

↓ Policy Service (Port 5002)
GET http://localhost:5002/api/policies/user/123

↓ Response flows back through gateway

Client receives response
```

---

## Q4: Microservices Architecture in Your Project ⭐⭐⭐

**Answer:**

**Your 4 Microservices:**

**1. Identity Service (Port 5001)**
- **Responsibility:** Authentication, user management
- **Database:** SmartSure_Identity
- **Endpoints:**
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password

**2. Policy Service (Port 5002)**
- **Responsibility:** Insurance policies, premium calculation
- **Database:** SmartSure_Policy
- **Endpoints:**
  - GET /api/policies
  - POST /api/policies
  - GET /api/policies/{id}
  - GET /api/policies/user/{userId}
  - POST /api/policies/calculate-premium

**3. Claims Service (Port 5003)**
- **Responsibility:** Claim management, document upload
- **Database:** SmartSure_Claims
- **Endpoints:**
  - GET /api/claims
  - POST /api/claims
  - GET /api/claims/{id}
  - PUT /api/claims/{id}/status
  - POST /api/claims/{id}/documents

**4. Admin Service (Port 5004)**
- **Responsibility:** Admin operations, reports, analytics
- **Database:** SmartSure_Admin (or reads from all DBs)
- **Endpoints:**
  - GET /api/admin/dashboard/stats
  - GET /api/admin/claims
  - PUT /api/admin/claims/{id}/approve
  - PUT /api/admin/claims/{id}/reject
  - GET /api/admin/reports

**Key Principles:**

1. **Database per Service**
   - Each service has its own database
   - No direct database access between services
   - Data consistency through events/APIs

2. **Independent Deployment**
   - Each service can be deployed separately
   - No downtime for other services
   - Version independently

3. **Single Responsibility**
   - Each service does one thing well
   - Clear boundaries
   - Easy to understand and maintain

4. **Communication**
   - HTTP/REST through API Gateway
   - Async messaging (RabbitMQ) for events
   - No direct service-to-service calls

---

## Q5: EF Core Code-First Migrations ⭐⭐⭐

**Answer:**

**Code-First Workflow:**

**1. Create Entity Models:**

```csharp
public class Policy
{
    public string PolicyId { get; set; }
    public string UserId { get; set; }
    public string PolicyNumber { get; set; }
    public string SubtypeId { get; set; }
    public decimal PremiumAmount { get; set; }
    public decimal CoverageAmount { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; }
    
    // Navigation properties
    public virtual InsuranceSubtype InsuranceSubtype { get; set; }
    public virtual ICollection<Claim> Claims { get; set; }
}
```

**2. Create DbContext:**

```csharp
public class PolicyDbContext : DbContext
{
    public PolicyDbContext(DbContextOptions<PolicyDbContext> options)
        : base(options)
    {
    }

    public DbSet<Policy> Policies { get; set; }
    public DbSet<InsuranceType> InsuranceTypes { get; set; }
    public DbSet<InsuranceSubtype> InsuranceSubtypes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure relationships
        modelBuilder.Entity<Policy>()
            .HasOne(p => p.InsuranceSubtype)
            .WithMany(s => s.Policies)
            .HasForeignKey(p => p.SubtypeId);

        // Configure properties
        modelBuilder.Entity<Policy>()
            .Property(p => p.PremiumAmount)
            .HasColumnType("decimal(18,2)");

        // Seed data
        modelBuilder.Entity<InsuranceType>().HasData(
            new InsuranceType { TypeId = "1", Name = "Vehicle Insurance" },
            new InsuranceType { TypeId = "2", Name = "Home Insurance" }
        );
    }
}
```

**3. Register in Program.cs:**

```csharp
builder.Services.AddDbContext<PolicyDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("PolicyConnection")));
```

**4. Create Migration:**

```bash
# Navigate to service folder
cd backend/services/SmartSure.PolicyService

# Add migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

**5. Migration File Generated:**

```csharp
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Policies",
            columns: table => new
            {
                PolicyId = table.Column<string>(nullable: false),
                UserId = table.Column<string>(nullable: false),
                PolicyNumber = table.Column<string>(nullable: false),
                PremiumAmount = table.Column<decimal>(type: "decimal(18,2)"),
                Status = table.Column<string>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Policies", x => x.PolicyId);
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Policies");
    }
}
```

**Commands:**

```bash
# Add migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script

# Update to specific migration
dotnet ef database update MigrationName
```

---

## Q6: Angular Route Guards ⭐⭐

**Answer:**

**What are Route Guards?**
- Protect routes from unauthorized access
- Check conditions before navigation
- Redirect if conditions not met

**Your Project Guards:**

**1. Auth Guard (Checks if logged in):**

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Not logged in, redirect to login
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
```

**2. Customer Guard (Checks if customer role):**

```typescript
@Injectable({
  providedIn: 'root'
})
export class CustomerGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isCustomer()) {
      return true;
    }

    // Not a customer, redirect
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

**3. Admin Guard (Checks if admin role):**

```typescript
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
```

**Usage in Routes:**

```typescript
export const routes: Routes = [
  {
    path: 'customer',
    canActivate: [AuthGuard, CustomerGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'policies', component: PolicyListComponent },
      { path: 'claims', component: ClaimListComponent }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'claims', component: AdminClaimsComponent }
    ]
  }
];
```

---

## Q7: Angular Interceptors ⭐⭐

**Answer:**

**What are Interceptors?**
- Intercept HTTP requests/responses
- Add headers, handle errors, show loading
- Global HTTP handling

**Your Project Interceptors:**

**1. Auth Interceptor (Add JWT token):**

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get token
    const token = this.authService.getToken();

    // Clone request and add Authorization header
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
```

**2. Error Interceptor (Handle errors globally):**

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastr: ToastrService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 401:
              errorMessage = 'Unauthorized. Please login.';
              this.router.navigate(['/auth/login']);
              break;
            case 403:
              errorMessage = 'Access denied.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again.';
              break;
            default:
              errorMessage = error.error?.message || error.message;
          }
        }

        this.toastr.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
```

**3. Loading Interceptor (Show spinner):**

```typescript
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Show loading
    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => {
        // Hide loading when done
        this.loadingService.hide();
      })
    );
  }
}
```

**Register in app.config.ts:**

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    )
  ]
};
```

---

## 🎯 Quick Summary - Must Remember!

1. **IEnumerable vs IQueryable**
   - IQueryable filters at database (efficient)
   - IEnumerable filters in memory (inefficient for large data)

2. **JWT Token**
   - Structure: header.payload.signature
   - Contains claims (user info, roles)
   - Validated on every request

3. **Ocelot Gateway**
   - Single entry point for all services
   - Routes requests to microservices
   - Handles authentication

4. **Microservices**
   - 4 services: Identity, Policy, Claims, Admin
   - Each has own database
   - Communicate through gateway

5. **EF Core Migrations**
   - Code-First: Models → Migrations → Database
   - Commands: add, update, remove
   - DbContext configures relationships

6. **Route Guards**
   - Protect routes from unauthorized access
   - AuthGuard, CustomerGuard, AdminGuard
   - Return true/false for navigation

7. **Interceptors**
   - Add JWT token to requests
   - Handle errors globally
   - Show loading spinner

---

**You're 80% prepared! Practice the demo and you'll ace it!** 🚀
