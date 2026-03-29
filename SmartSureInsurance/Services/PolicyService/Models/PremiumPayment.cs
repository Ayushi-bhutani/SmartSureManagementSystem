using SmartSure.SharedKernel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PolicyService.Models
{
    public class PremiumPayment : BaseEntity
    {
        public Guid PolicyId { get; set; }
        public virtual Policy? Policy { get; set; }

        public int InstallmentNumber { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public DateTime? PaidDate { get; set; }

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        [MaxLength(100)]
        public string? TransactionId { get; set; }

        public string? PaymentMethod { get; set; }
        public decimal LateFee { get; set; } = 0;
        public bool IsGracePeriod { get; set; } = false;
    }
}