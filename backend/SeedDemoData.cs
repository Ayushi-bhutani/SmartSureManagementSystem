using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using IdentityService.Data;
using IdentityService.Models;
using SmartSure.PolicyService.Data;
using SmartSure.PolicyService.Models;
using SmartSure.ClaimsService.Data;
using SmartSure.ClaimsService.Models;

namespace SmartSure.DataSeeding
{
    /// <summary>
    /// Comprehensive data seeding script for SmartSure demo
    /// Creates realistic users, policies, and claims for impressive analytics
    /// </summary>
    public class DemoDataSeeder
    {
        private readonly IdentityDbContext _identityDb;
        private readonly PolicyDbContext _policyDb;
        private readonly ClaimsDbContext _claimsDb;
        private readonly Random _random = new Random(42); // Fixed seed for reproducibility

        public DemoDataSeeder(
            IdentityDbContext identityDb,
            PolicyDbContext policyDb,
            ClaimsDbContext claimsDb)
        {
            _identityDb = identityDb;
            _policyDb = policyDb;
            _claimsDb = claimsDb;
        }

        public async Task SeedAllDataAsync()
        {
            Console.WriteLine("🌱 Starting SmartSure Demo Data Seeding...");
            Console.WriteLine("=" .PadRight(60, '='));

            // Step 1: Clean existing data (except admin)
            await CleanExistingDataAsync();

            // Step 2: Create demo users
            var users = await CreateDemoUsersAsync();

            // Step 3: Get insurance types and subtypes
            var insuranceData = await GetInsuranceTypesAsync();

            // Step 4: Create policies for users
            var policies = await CreateDemoPoliciesAsync(users, insuranceData);

            // Step 5: Create claims for policies
            await CreateDemoClaimsAsync(policies);

            Console.WriteLine("=" .PadRight(60, '='));
            Console.WriteLine("✅ Demo data seeding completed successfully!");
            Console.WriteLine($"📊 Summary:");
            Console.WriteLine($"   - Users created: {users.Count}");
            Console.WriteLine($"   - Policies created: {policies.Count}");
            
        }

        private async Task CleanExistingDataAsync()
        {
            Console.WriteLine("\n🧹 Cleaning existing data...");

            // Delete claims first (foreign key constraints)
            var existingClaims = await _claimsDb.Claims.ToListAsync();
            _claimsDb.Claims.RemoveRange(existingClaims);
            await _claimsDb.SaveChangesAsync();
            Console.WriteLine($"   ✓ Deleted {existingClaims.Count} existing claims");

            // Delete claim documents and history
            var claimDocs = await _claimsDb.ClaimDocuments.ToListAsync();
            _claimsDb.ClaimDocuments.RemoveRange(claimDocs);
            var claimHistory = await _claimsDb.ClaimStatusHistories.ToListAsync();
            _claimsDb.ClaimStatusHistories.RemoveRange(claimHistory);
            await _claimsDb.SaveChangesAsync();

            // Delete policies and related data
            var existingPolicies = await _policyDb.Policies.ToListAsync();
            var policyDetails = await _policyDb.PolicyDetails.ToListAsync();
            var homeDetails = await _policyDb.HomeDetails.ToListAsync();
            var vehicleDetails = await _policyDb.VehicleDetails.ToListAsync();
            var payments = await _policyDb.Payments.ToListAsync();

            _policyDb.Policies.RemoveRange(existingPolicies);
            _policyDb.PolicyDetails.RemoveRange(policyDetails);
            _policyDb.HomeDetails.RemoveRange(homeDetails);
            _policyDb.VehicleDetails.RemoveRange(vehicleDetails);
            _policyDb.Payments.RemoveRange(payments);
            await _policyDb.SaveChangesAsync();
            Console.WriteLine($"   ✓ Deleted {existingPolicies.Count} existing policies");

            // Delete customer users (keep admin and ayushi)
            var usersToDelete = await _identityDb.Users
                .Where(u => u.Email != "admin@smartsure.com" && u.Email != "ayushibhutani15@gmail.com")
                .ToListAsync();

            foreach (var user in usersToDelete)
            {
                var userRoles = await _identityDb.UserRoles.Where(ur => ur.UserId == user.UserId).ToListAsync();
                _identityDb.UserRoles.RemoveRange(userRoles);
                
                var password = await _identityDb.Passwords.FirstOrDefaultAsync(p => p.UserId == user.UserId);
                if (password != null) _identityDb.Passwords.Remove(password);
                
                var otps = await _identityDb.OtpRecords.Where(o => o.UserId == user.UserId).ToListAsync();
                _identityDb.OtpRecords.RemoveRange(otps);
            }
            
            _identityDb.Users.RemoveRange(usersToDelete);
            await _identityDb.SaveChangesAsync();
            Console.WriteLine($"   ✓ Deleted {usersToDelete.Count} existing users (kept admin & ayushi)");
        }

        private async Task<List<User>> CreateDemoUsersAsync()
        {
            Console.WriteLine("\n👥 Creating demo users...");

            var customerRole = await _identityDb.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            if (customerRole == null)
            {
                throw new Exception("Customer role not found in database!");
            }

            var demoUsers = new List<(string FullName, string Email, string Phone, string Address)>
            {
                ("Rajesh Kumar", "rajesh.kumar@example.com", "9876543210", "123 MG Road, Bangalore, Karnataka"),
                ("Priya Sharma", "priya.sharma@example.com", "9876543211", "456 Park Street, Kolkata, West Bengal"),
                ("Amit Patel", "amit.patel@example.com", "9876543212", "789 CG Road, Ahmedabad, Gujarat"),
                ("Sneha Reddy", "sneha.reddy@example.com", "9876543213", "321 Banjara Hills, Hyderabad, Telangana"),
                ("Vikram Singh", "vikram.singh@example.com", "9876543214", "654 Connaught Place, New Delhi"),
                ("Ananya Iyer", "ananya.iyer@example.com", "9876543215", "987 Anna Salai, Chennai, Tamil Nadu"),
                ("Rahul Verma", "rahul.verma@example.com", "9876543216", "147 Civil Lines, Jaipur, Rajasthan"),
                ("Kavya Nair", "kavya.nair@example.com", "9876543217", "258 Marine Drive, Kochi, Kerala"),
                ("Arjun Mehta", "arjun.mehta@example.com", "9876543218", "369 FC Road, Pune, Maharashtra"),
                ("Divya Gupta", "divya.gupta@example.com", "9876543219", "741 Hazratganj, Lucknow, Uttar Pradesh"),
                ("Karthik Krishnan", "karthik.k@example.com", "9876543220", "852 Whitefield, Bangalore, Karnataka"),
                ("Meera Joshi", "meera.joshi@example.com", "9876543221", "963 Koregaon Park, Pune, Maharashtra"),
                ("Sanjay Malhotra", "sanjay.m@example.com", "9876543222", "159 Golf Course Road, Gurgaon, Haryana"),
                ("Pooja Desai", "pooja.desai@example.com", "9876543223", "357 Satellite, Ahmedabad, Gujarat"),
                ("Nikhil Rao", "nikhil.rao@example.com", "9876543224", "486 Jubilee Hills, Hyderabad, Telangana")
            };

            var createdUsers = new List<User>();
            var password = "Demo@123"; // Same password for all demo users

            foreach (var (fullName, email, phone, address) in demoUsers)
            {
                var user = new User
                {
                    UserId = Guid.NewGuid(),
                    FullName = fullName,
                    Email = email,
                    PhoneNumber = phone,
                    Address = address,
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(30, 180)) // Created 1-6 months ago
                };

                _identityDb.Users.Add(user);

                // Add password
                var passwordHash = HashPassword(password);
                _identityDb.Passwords.Add(new Password
                {
                    PasswordId = Guid.NewGuid(),
                    UserId = user.UserId,
                    PasswordHash = passwordHash,
                    CreatedAt = user.CreatedAt
                });

                // Assign Customer role
                _identityDb.UserRoles.Add(new UserRole
                {
                    UserRoleId = Guid.NewGuid(),
                    UserId = user.UserId,
                    RoleId = customerRole.RoleId,
                    AssignedAt = user.CreatedAt
                });

                createdUsers.Add(user);
            }

            await _identityDb.SaveChangesAsync();
            Console.WriteLine($"   ✓ Created {createdUsers.Count} demo users");
            Console.WriteLine($"   📝 All users have password: {password}");

            return createdUsers;
        }

        private async Task<Dictionary<string, List<InsuranceSubtype>>> GetInsuranceTypesAsync()
        {
            Console.WriteLine("\n📋 Loading insurance types...");

            var types = await _policyDb.InsuranceTypes
                .Include(t => t.Subtypes)
                .ToListAsync();

            var result = types.ToDictionary(
                t => t.Name,
                t => t.Subtypes.ToList()
            );

            Console.WriteLine($"   ✓ Loaded {types.Count} insurance types with {types.Sum(t => t.Subtypes.Count)} subtypes");
            return result;
        }

        private async Task<List<Policy>> CreateDemoPoliciesAsync(
            List<User> users,
            Dictionary<string, List<InsuranceSubtype>> insuranceData)
        {
            Console.WriteLine("\n🏠🚗 Creating demo policies...");

            var policies = new List<Policy>();
            var policyStatuses = new[] { "Active", "Active", "Active", "Active", "Pending", "Expired", "Cancelled" };

            // Each user gets 1-3 policies
            foreach (var user in users)
            {
                int policyCount = _random.Next(1, 4);
                
                for (int i = 0; i < policyCount; i++)
                {
                    // Randomly select insurance type
                    var insuranceType = insuranceData.Keys.ElementAt(_random.Next(insuranceData.Count));
                    var subtypes = insuranceData[insuranceType];
                    
                    if (subtypes.Count == 0) continue;

                    var subtype = subtypes[_random.Next(subtypes.Count)];
                    var status = policyStatuses[_random.Next(policyStatuses.Length)];
                    
                    var startDate = DateTime.UtcNow.AddDays(-_random.Next(30, 365));
                    var endDate = startDate.AddYears(1);

                    decimal premiumAmount = insuranceType.ToLower() switch
                    {
                        "vehicle" => _random.Next(8000, 25000),
                        "home" => _random.Next(5000, 20000),
                        "health" => _random.Next(10000, 50000),
                        "life" => _random.Next(15000, 100000),
                        _ => _random.Next(5000, 30000)
                    };

                    decimal idv = premiumAmount * _random.Next(20, 50);

                    var policy = new Policy
                    {
                        PolicyId = Guid.NewGuid(),
                        UserId = user.UserId,
                        SubtypeId = subtype.SubtypeId,
                        StartDate = startDate,
                        EndDate = endDate,
                        PremiumAmount = premiumAmount,
                        InsuredDeclaredValue = idv,
                        Status = status,
                        ApprovedClaimsCount = 0,
                        IsTerminated = false,
                        InvoiceGeneratedAt = status == "Active" ? startDate.AddHours(2) : null,
                        CreatedAt = startDate,
                        NomineeName = GenerateRandomName(),
                        NomineeRelation = new[] { "Spouse", "Parent", "Child", "Sibling" }[_random.Next(4)]
                    };

                    _policyDb.Policies.Add(policy);

                    // Add policy details
                    var policyDetail = new PolicyDetail
                    {
                        PolicyDetailId = Guid.NewGuid(),
                        PolicyId = policy.PolicyId,
                        CoverageDetails = $"Comprehensive coverage for {insuranceType}",
                        Terms = "Standard terms and conditions apply",
                        CreatedAt = startDate
                    };
                    _policyDb.PolicyDetails.Add(policyDetail);

                    // Add specific details based on type
                    if (insuranceType.ToLower() == "vehicle")
                    {
                        var vehicleDetail = CreateVehicleDetail(policy.PolicyId, startDate);
                        _policyDb.VehicleDetails.Add(vehicleDetail);
                    }
                    else if (insuranceType.ToLower() == "home")
                    {
                        var homeDetail = CreateHomeDetail(policy.PolicyId, startDate);
                        _policyDb.HomeDetails.Add(homeDetail);
                    }

                    // Add payment if policy is active
                    if (status == "Active")
                    {
                        var payment = new Payment
                        {
                            PaymentId = Guid.NewGuid(),
                            PolicyId = policy.PolicyId,
                            Amount = premiumAmount,
                            PaymentMethod = new[] { "Card", "UPI", "NetBanking" }[_random.Next(3)],
                            Status = "Completed",
                            TransactionId = $"TXN{Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper()}",
                            PaymentDate = startDate.AddHours(1),
                            CreatedAt = startDate.AddHours(1)
                        };
                        _policyDb.Payments.Add(payment);
                    }

                    policies.Add(policy);
                }
            }

            await _policyDb.SaveChangesAsync();
            Console.WriteLine($"   ✓ Created {policies.Count} policies");
            Console.WriteLine($"   📊 Active: {policies.Count(p => p.Status == "Active")}");
            Console.WriteLine($"   📊 Pending: {policies.Count(p => p.Status == "Pending")}");
            Console.WriteLine($"   📊 Expired: {policies.Count(p => p.Status == "Expired")}");
            Console.WriteLine($"   📊 Cancelled: {policies.Count(p => p.Status == "Cancelled")}");

            return policies;
        }

        private VehicleDetail CreateVehicleDetail(Guid policyId, DateTime createdAt)
        {
            var makes = new[] { "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", "Ford" };
            var models = new[] { "Swift", "i20", "Nexon", "XUV700", "City", "Fortuner", "EcoSport" };
            var colors = new[] { "White", "Silver", "Black", "Red", "Blue", "Grey" };

            return new VehicleDetail
            {
                VehicleDetailId = Guid.NewGuid(),
                PolicyId = policyId,
                VehicleType = new[] { "Car", "Bike", "SUV" }[_random.Next(3)],
                Make = makes[_random.Next(makes.Length)],
                Model = models[_random.Next(models.Length)],
                Year = _random.Next(2018, 2024),
                RegistrationNumber = $"{new[] { "KA", "MH", "DL", "TN", "GJ" }[_random.Next(5)]}{_random.Next(10, 99)}{(char)_random.Next('A', 'Z')}{(char)_random.Next('A', 'Z')}{_random.Next(1000, 9999)}",
                ChassisNumber = $"CH{Guid.NewGuid().ToString("N").Substring(0, 15).ToUpper()}",
                EngineNumber = $"EN{Guid.NewGuid().ToString("N").Substring(0, 12).ToUpper()}",
                Color = colors[_random.Next(colors.Length)],
                FuelType = new[] { "Petrol", "Diesel", "CNG", "Electric" }[_random.Next(4)],
                SeatingCapacity = _random.Next(2, 8),
                CreatedAt = createdAt
            };
        }

        private HomeDetail CreateHomeDetail(Guid policyId, DateTime createdAt)
        {
            return new HomeDetail
            {
                HomeDetailId = Guid.NewGuid(),
                PolicyId = policyId,
                PropertyType = new[] { "Apartment", "Villa", "Independent House" }[_random.Next(3)],
                Address = $"{_random.Next(1, 999)} {new[] { "MG Road", "Park Street", "Main Road", "Cross Street" }[_random.Next(4)]}",
                City = new[] { "Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad" }[_random.Next(5)],
                State = new[] { "Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Telangana" }[_random.Next(5)],
                PinCode = _random.Next(100000, 999999).ToString(),
                BuiltUpArea = _random.Next(800, 3000),
                YearBuilt = _random.Next(2000, 2023),
                NumberOfFloors = _random.Next(1, 4),
                ConstructionType = new[] { "RCC", "Brick", "Concrete" }[_random.Next(3)],
                CreatedAt = createdAt
            };
        }

        private async Task CreateDemoClaimsAsync(List<Policy> policies)
        {
            Console.WriteLine("\n📝 Creating demo claims...");

            var activePolicies = policies.Where(p => p.Status == "Active").ToList();
            var claimStatuses = new[] { "Submitted", "UnderReview", "Approved", "Rejected", "Closed" };
            var claimTypes = new[] { "Accident", "Theft", "Fire", "Natural Disaster", "Damage", "Medical" };

            int claimCount = 0;

            // 40% of active policies have claims
            foreach (var policy in activePolicies.Take((int)(activePolicies.Count * 0.4)))
            {
                var status = claimStatuses[_random.Next(claimStatuses.Length)];
                var claimAmount = policy.PremiumAmount * _random.Next(2, 10);
                var claimDate = policy.StartDate.AddDays(_random.Next(10, 300));

                var claim = new Claim
                {
                    ClaimId = Guid.NewGuid(),
                    PolicyId = policy.PolicyId,
                    UserId = policy.UserId,
                    Description = GenerateClaimDescription(claimTypes[_random.Next(claimTypes.Length)]),
                    Status = status,
                    ClaimAmount = claimAmount,
                    ApprovedAmount = status == "Approved" ? claimAmount * (decimal)_random.NextDouble() * 0.3m + claimAmount * 0.7m : null,
                    RejectionReason = status == "Rejected" ? "Insufficient documentation provided" : null,
                    ClaimType = claimTypes[_random.Next(claimTypes.Length)],
                    IsCompletelyDamaged = _random.Next(10) < 2, // 20% chance
                    CreatedAt = claimDate,
                    UpdatedAt = claimDate.AddDays(_random.Next(1, 15))
                };

                _claimsDb.Claims.Add(claim);

                // Add status history
                var statusHistory = new ClaimStatusHistory
                {
                    StatusHistoryId = Guid.NewGuid(),
                    ClaimId = claim.ClaimId,
                    Status = status,
                    ChangedBy = "System",
                    Remarks = $"Claim {status.ToLower()}",
                    ChangedAt = claim.UpdatedAt
                };
                _claimsDb.ClaimStatusHistories.Add(statusHistory);

                // Update policy if claim is approved
                if (status == "Approved")
                {
                    policy.ApprovedClaimsCount++;
                }

                claimCount++;
            }

            await _claimsDb.SaveChangesAsync();
            await _policyDb.SaveChangesAsync();

            Console.WriteLine($"   ✓ Created {claimCount} claims");
            Console.WriteLine($"   📊 Submitted: {claimCount * 0.2:F0}");
            Console.WriteLine($"   📊 Under Review: {claimCount * 0.2:F0}");
            Console.WriteLine($"   📊 Approved: {claimCount * 0.3:F0}");
            Console.WriteLine($"   📊 Rejected: {claimCount * 0.2:F0}");
            Console.WriteLine($"   📊 Closed: {claimCount * 0.1:F0}");
        }

        private string GenerateRandomName()
        {
            var firstNames = new[] { "Amit", "Priya", "Rahul", "Sneha", "Vikram", "Ananya", "Rajesh", "Kavya" };
            var lastNames = new[] { "Kumar", "Sharma", "Patel", "Reddy", "Singh", "Iyer", "Verma", "Nair" };
            return $"{firstNames[_random.Next(firstNames.Length)]} {lastNames[_random.Next(lastNames.Length)]}";
        }

        private string GenerateClaimDescription(string claimType)
        {
            return claimType switch
            {
                "Accident" => "Vehicle involved in road accident. Front bumper and headlight damaged.",
                "Theft" => "Vehicle stolen from parking area. Police complaint filed.",
                "Fire" => "Property damaged due to electrical fire in kitchen area.",
                "Natural Disaster" => "Damage caused by heavy rainfall and flooding.",
                "Damage" => "Accidental damage to property during renovation work.",
                "Medical" => "Medical expenses for treatment after accident.",
                _ => "General claim for damages."
            };
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    // Program to run the seeder
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("🚀 SmartSure Demo Data Seeder");
            Console.WriteLine("This will populate your database with realistic demo data\n");

            // Note: You need to configure your connection strings
            // This is a template - adjust based on your actual setup

            var services = new ServiceCollection();
            
            // Add DbContexts with your connection strings
            // services.AddDbContext<IdentityDbContext>(options => 
            //     options.UseSqlServer("YourIdentityConnectionString"));
            // services.AddDbContext<PolicyDbContext>(options => 
            //     options.UseSqlServer("YourPolicyConnectionString"));
            // services.AddDbContext<ClaimsDbContext>(options => 
            //     options.UseSqlServer("YourClaimsConnectionString"));

            var serviceProvider = services.BuildServiceProvider();

            // Run seeder
            // var identityDb = serviceProvider.GetRequiredService<IdentityDbContext>();
            // var policyDb = serviceProvider.GetRequiredService<PolicyDbContext>();
            // var claimsDb = serviceProvider.GetRequiredService<ClaimsDbContext>();

            // var seeder = new DemoDataSeeder(identityDb, policyDb, claimsDb);
            // await seeder.SeedAllDataAsync();

            Console.WriteLine("\n✅ Seeding complete! Your database is ready for demo.");
            Console.WriteLine("\n📝 Demo User Credentials:");
            Console.WriteLine("   Email: Any user from the list above");
            Console.WriteLine("   Password: Demo@123");
            Console.WriteLine("\n👨‍💼 Admin Credentials:");
            Console.WriteLine("   Email: admin@smartsure.com");
            Console.WriteLine("   Password: Admin@123");
        }
    }
}
