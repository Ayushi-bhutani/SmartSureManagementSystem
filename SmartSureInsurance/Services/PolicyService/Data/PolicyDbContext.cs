using Microsoft.EntityFrameworkCore;
using PolicyService.Models;
using System.Reflection.Emit;
using System.Text.Json;

namespace PolicyService.Data
{
    public class PolicyDbContext : DbContext
    {
        public PolicyDbContext(DbContextOptions<PolicyDbContext> options) : base(options)
        {
        }

        public DbSet<InsuranceProduct> InsuranceProducts { get; set; }
        public DbSet<Policy> Policies { get; set; }
        public DbSet<PremiumPayment> Premiums { get; set; }
        public DbSet<PolicyDocument> PolicyDocuments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Indexes
            modelBuilder.Entity<Policy>()
                .HasIndex(p => p.PolicyNumber)
                .IsUnique();

            modelBuilder.Entity<Policy>()
                .HasIndex(p => p.UserId);

            modelBuilder.Entity<Policy>()
                .HasIndex(p => p.Status);

            modelBuilder.Entity<PremiumPayment>()
                .HasIndex(p => p.PolicyId);

            modelBuilder.Entity<PremiumPayment>()
                .HasIndex(p => p.PaymentStatus);

            // Seed Insurance Products
            modelBuilder.Entity<InsuranceProduct>().HasData(
                new InsuranceProduct
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Term Life Insurance",
                    Description = "Comprehensive life coverage for your family's financial security",
                    Category = "Life",
                    MinCoverageAmount = 500000,
                    MaxCoverageAmount = 10000000,
                    MinTermYears = 5,
                    MaxTermYears = 30,
                    BasePremiumRate = 1.5m,
                    AdminFee = 100,
                    IsActive = true,
                    Features = JsonSerializer.Serialize(new List<string> { "Death Benefit", "Accidental Death", "Critical Illness Cover" }),
                    RequiredDocuments = JsonSerializer.Serialize(new List<string> { "ID Proof", "Address Proof", "Medical Reports" }),
                    CreatedAt = DateTime.UtcNow
                },
                new InsuranceProduct
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Health Shield",
                    Description = "Complete health coverage with cashless treatment",
                    Category = "Health",
                    MinCoverageAmount = 500000,
                    MaxCoverageAmount = 5000000,
                    MinTermYears = 1,
                    MaxTermYears = 10,
                    BasePremiumRate = 3.5m,
                    AdminFee = 200,
                    IsActive = true,
                    Features = JsonSerializer.Serialize(new List<string> { "Hospitalization Cover", "Pre-existing Diseases", "Maternity Cover" }),
                    RequiredDocuments = JsonSerializer.Serialize(new List<string> { "ID Proof", "Medical History" }),
                    CreatedAt = DateTime.UtcNow
                },
                new InsuranceProduct
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "Auto Protect",
                    Description = "Comprehensive car insurance with roadside assistance",
                    Category = "Auto",
                    MinCoverageAmount = 100000,
                    MaxCoverageAmount = 5000000,
                    MinTermYears = 1,
                    MaxTermYears = 5,
                    BasePremiumRate = 2.5m,
                    AdminFee = 150,
                    IsActive = true,
                    Features = JsonSerializer.Serialize(new List<string> { "Third Party Cover", "Own Damage", "Roadside Assistance" }),
                    RequiredDocuments = JsonSerializer.Serialize(new List<string> { "RC Book", "Driving License" }),
                    CreatedAt = DateTime.UtcNow
                },
                new InsuranceProduct
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Name = "Home Shield",
                    Description = "Protect your home against fire, theft, and natural calamities",
                    Category = "Home",
                    MinCoverageAmount = 500000,
                    MaxCoverageAmount = 10000000,
                    MinTermYears = 1,
                    MaxTermYears = 10,
                    BasePremiumRate = 1.0m,
                    AdminFee = 100,
                    IsActive = true,
                    Features = JsonSerializer.Serialize(new List<string> { "Building Cover", "Contents Cover", "Natural Calamities" }),
                    RequiredDocuments = JsonSerializer.Serialize(new List<string> { "Property Proof", "Valuation Report" }),
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}