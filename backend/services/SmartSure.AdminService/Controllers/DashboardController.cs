using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace SmartSure.AdminService.Controllers
{
    /// <summary>
    /// Represent or implements DashboardController.
    /// </summary>
    [ApiController]
    [Route("admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly ILogger<DashboardController> _logger;
        private readonly IConfiguration _configuration;

        public DashboardController(ILogger<DashboardController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Performs the GetDashboardStats operation.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                // Connection strings for the three databases
                var identityConnString = "Server=Mera_hai\\SQLEXPRESS;Database=SmartSure_Identity;Trusted_Connection=True;TrustServerCertificate=True;";
                var policyConnString = "Server=Mera_hai\\SQLEXPRESS;Database=SmartSure_Policy;Trusted_Connection=True;TrustServerCertificate=True;";
                var claimsConnString = "Server=Mera_hai\\SQLEXPRESS;Database=SmartSure_Claims;Trusted_Connection=True;TrustServerCertificate=True;";

                int totalUsers = 0;
                int totalPolicies = 0;
                int activePolicies = 0;
                int totalClaims = 0;
                int pendingClaims = 0;
                int approvedClaims = 0;
                int rejectedClaims = 0;
                decimal totalRevenue = 0m;

                // Query Identity database for user count
                using (var conn = new SqlConnection(identityConnString))
                {
                    await conn.OpenAsync();
                    using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Users", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        totalUsers = result != null ? Convert.ToInt32(result) : 0;
                    }
                }

                // Query Policy database for policy stats
                using (var conn = new SqlConnection(policyConnString))
                {
                    await conn.OpenAsync();
                    
                    // Total policies
                    using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Policies", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        totalPolicies = result != null ? Convert.ToInt32(result) : 0;
                    }
                    
                    // Active policies
                    using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Policies WHERE Status = 'Active'", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        activePolicies = result != null ? Convert.ToInt32(result) : 0;
                    }
                    
                    // Total revenue (sum of premiums)
                    using (var cmd = new SqlCommand("SELECT ISNULL(SUM(PremiumAmount), 0) FROM Policies", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        totalRevenue = result != null ? Convert.ToDecimal(result) : 0m;
                    }
                }

                // Query Claims database for claim stats
                using (var conn = new SqlConnection(claimsConnString))
                {
                    await conn.OpenAsync();
                    
                    // Total claims
                    using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Claims", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        totalClaims = result != null ? Convert.ToInt32(result) : 0;
                    }
                    
                    // Pending claims
                    using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Claims WHERE Status = 'Pending'", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        pendingClaims = result != null ? Convert.ToInt32(result) : 0;
                    }
                    
                    // Approved claims
                    using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Claims WHERE Status = 'Approved'", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        approvedClaims = result != null ? Convert.ToInt32(result) : 0;
                    }
                    
                    // Rejected claims
                    using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Claims WHERE Status = 'Rejected'", conn))
                    {
                        var result = await cmd.ExecuteScalarAsync();
                        rejectedClaims = result != null ? Convert.ToInt32(result) : 0;
                    }
                }

                var stats = new
                {
                    totalUsers,
                    totalPolicies,
                    totalClaims,
                    pendingClaims,
                    approvedClaims,
                    rejectedClaims,
                    activePolicies,
                    totalRevenue
                };

                _logger.LogInformation("Dashboard stats retrieved successfully: Users={Users}, Policies={Policies}, Claims={Claims}", 
                    totalUsers, totalPolicies, totalClaims);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard stats from databases");
                
                // Fallback to zeros if database query fails
                var fallbackStats = new
                {
                    totalUsers = 0,
                    totalPolicies = 0,
                    totalClaims = 0,
                    pendingClaims = 0,
                    approvedClaims = 0,
                    rejectedClaims = 0,
                    activePolicies = 0,
                    totalRevenue = 0m
                };
                
                return Ok(fallbackStats);
            }
        }
    }
}
