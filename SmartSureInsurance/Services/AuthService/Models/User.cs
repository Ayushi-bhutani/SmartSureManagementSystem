using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartSure.SharedKernel;

namespace AuthService.Models
{
    public class User : BaseEntity
    {
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;  // ← Added default value

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;  // ← Added default value

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;  // ← Added default value

        [Required]
        public string PasswordHash { get; set; } = string.Empty;  // ← Added default value

        public string? PasswordSalt { get; set; }  // ← Made nullable

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }  // ← Made nullable

        [MaxLength(500)]
        public string? Address { get; set; }  // ← Made nullable

        public DateTime? DateOfBirth { get; set; }

        public UserRole Role { get; set; } = UserRole.Customer;

        public bool IsActive { get; set; } = true;

        public bool IsEmailVerified { get; set; } = false;

        public DateTime? LastLoginAt { get; set; }

        public string? ProfilePictureUrl { get; set; }  // ← Made nullable

        // Navigation properties
        public virtual ICollection<RefreshToken>? RefreshTokens { get; set; } = new List<RefreshToken>();  // ← Added initialization
                                                                                                           // Add these properties to your User class (inside the User class)

        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpiry { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

    }

    public class RefreshToken : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User? User { get; set; }  // ← Made nullable

        [Required]
        [MaxLength(500)]
        public string Token { get; set; } = string.Empty;  // ← Added default value

        public DateTime ExpiryDate { get; set; }

        public bool IsRevoked { get; set; } = false;

        public string? RevokedByIp { get; set; }  // ← Made nullable

        public string? CreatedByIp { get; set; }  // ← Made nullable

        public bool IsExpired => DateTime.UtcNow >= ExpiryDate;

        public bool IsActive => !IsRevoked && !IsExpired;
    }
}