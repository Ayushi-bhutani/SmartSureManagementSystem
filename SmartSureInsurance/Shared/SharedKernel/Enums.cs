namespace SmartSure.SharedKernel
{
    public enum UserRole
    {
        Customer = 1,
        Admin = 2
    }

    public enum PolicyStatus
    {
        Draft = 1,
        Active = 2,
        Expired = 3,
        Cancelled = 4
    }

    public enum ClaimStatus
    {
        Draft = 1,
        Submitted = 2,
        UnderReview = 3,
        Approved = 4,
        Rejected = 5,
        Closed = 6
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Completed = 2,
        Failed = 3,
        Refunded = 4
    }
    // In SharedKernel/Enums.cs, add this enum
    public enum DocumentType
    {
        Identity = 1,
        PolicyDocument = 2,
        ClaimDocument = 3,
        MedicalReport = 4,
        PoliceReport = 5,
        Other = 6
    }
}