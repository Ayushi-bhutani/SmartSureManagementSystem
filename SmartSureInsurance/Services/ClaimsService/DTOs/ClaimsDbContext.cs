using ClaimsService.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace ClaimsService.Data
{
    public class ClaimsDbContext : DbContext
    {
        public ClaimsDbContext(DbContextOptions<ClaimsDbContext> options) : base(options)
        {
        }

        public DbSet<InsuranceClaim> Claims { get; set; }
        public DbSet<ClaimDocument> ClaimDocuments { get; set; }
        public DbSet<ClaimNote> ClaimNotes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision
            modelBuilder.Entity<InsuranceClaim>()
                .Property(c => c.ClaimAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<InsuranceClaim>()
                .Property(c => c.ApprovedAmount)
                .HasPrecision(18, 2);

            // Indexes for performance
            modelBuilder.Entity<InsuranceClaim>()
                .HasIndex(c => c.ClaimNumber)
                .IsUnique();

            modelBuilder.Entity<InsuranceClaim>()
                .HasIndex(c => c.PolicyId);

            modelBuilder.Entity<InsuranceClaim>()
                .HasIndex(c => c.UserId);

            modelBuilder.Entity<InsuranceClaim>()
                .HasIndex(c => c.Status);

            modelBuilder.Entity<ClaimDocument>()
                .HasIndex(cd => cd.ClaimId);

            modelBuilder.Entity<ClaimNote>()
                .HasIndex(cn => cn.ClaimId);
        }
    }
}