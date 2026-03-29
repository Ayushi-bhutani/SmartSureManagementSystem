using ClaimsService.Data;
using ClaimsService.DTOs;
using ClaimsService.Models;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.EntityFrameworkCore;
using SmartSure.SharedKernel;

namespace ClaimsService.Services
{
    public class ClaimsService : IClaimsService
    {
        private readonly ClaimsDbContext _context;
        private readonly ILogger<ClaimsService> _logger;

        public ClaimsService(ClaimsDbContext context, ILogger<ClaimsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ClaimDto> CreateClaimAsync(CreateClaimRequest request, Guid userId)
        {
            _logger.LogInformation($"Creating claim for user: {userId}, Policy: {request.PolicyId}");

            // Verify policy exists (you might want to call PolicyService via HTTP)
            // For now, we'll assume policy exists

            // Generate claim number
            var claimNumber = GenerateClaimNumber();

            // Create claim
            var claim = new InsuranceClaim
            {
                Id = Guid.NewGuid(),
                PolicyId = request.PolicyId,
                UserId = userId,
                ClaimNumber = claimNumber,
                ClaimAmount = request.ClaimAmount,
                IncidentDescription = request.IncidentDescription,
                IncidentDate = request.IncidentDate,
                Status = ClaimStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };

            _context.Claims.Add(claim);
            await _context.SaveChangesAsync();

            // Upload documents if provided
            if (request.Documents != null && request.Documents.Any())
            {
                foreach (var docRequest in request.Documents)
                {
                    await UploadDocumentAsync(claim.Id, docRequest, userId);
                }
            }

            _logger.LogInformation($"Claim created successfully: {claimNumber}");

            return await MapToClaimDto(claim);
        }

        public async Task<ClaimDto> GetClaimByIdAsync(Guid claimId, Guid userId)
        {
            var claim = await _context.Claims
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.Id == claimId);

            if (claim == null)
                throw new KeyNotFoundException("Claim not found");

            if (claim.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to view this claim");

            return await MapToClaimDto(claim);
        }

        public async Task<IEnumerable<ClaimDto>> GetUserClaimsAsync(Guid userId)
        {
            var claims = await _context.Claims
                .Include(c => c.Documents)
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var claimDtos = new List<ClaimDto>();
            foreach (var claim in claims)
            {
                claimDtos.Add(await MapToClaimDto(claim));
            }

            return claimDtos;
        }

        public async Task<ClaimDocumentDto> UploadDocumentAsync(Guid claimId, DocumentUploadRequest request, Guid userId)
        {
            var claim = await _context.Claims.FindAsync(claimId);
            if (claim == null)
                throw new KeyNotFoundException("Claim not found");

            if (claim.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to upload documents for this claim");

            var document = new ClaimDocument
            {
                Id = Guid.NewGuid(),
                ClaimId = claimId,
                DocumentName = request.DocumentName,
                DocumentUrl = request.DocumentUrl,
                DocumentType = request.DocumentType,
                UploadDate = DateTime.UtcNow,
                IsVerified = false
            };

            _context.ClaimDocuments.Add(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Document uploaded for claim {claim.ClaimNumber}: {request.DocumentName}");

            return new ClaimDocumentDto
            {
                Id = document.Id,
                DocumentName = document.DocumentName,
                DocumentUrl = document.DocumentUrl,
                DocumentType = document.DocumentType.ToString(),
                UploadDate = document.UploadDate,
                IsVerified = document.IsVerified,
                VerificationNotes = document.VerificationNotes
            };
        }

        public async Task<IEnumerable<ClaimDocumentDto>> GetClaimDocumentsAsync(Guid claimId, Guid userId)
        {
            var claim = await _context.Claims.FindAsync(claimId);
            if (claim == null)
                throw new KeyNotFoundException("Claim not found");

            if (claim.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to view documents for this claim");

            var documents = await _context.ClaimDocuments
                .Where(d => d.ClaimId == claimId)
                .OrderByDescending(d => d.UploadDate)
                .ToListAsync();

            return documents.Select(d => new ClaimDocumentDto
            {
                Id = d.Id,
                DocumentName = d.DocumentName,
                DocumentUrl = d.DocumentUrl,
                DocumentType = d.DocumentType.ToString(),
                UploadDate = d.UploadDate,
                IsVerified = d.IsVerified,
                VerificationNotes = d.VerificationNotes
            });
        }

        public async Task<ClaimDto> SubmitClaimAsync(Guid claimId, Guid userId)
        {
            var claim = await _context.Claims
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.Id == claimId);

            if (claim == null)
                throw new KeyNotFoundException("Claim not found");

            if (claim.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to submit this claim");

            if (claim.Status != ClaimStatus.Draft)
                throw new InvalidOperationException($"Cannot submit claim in {claim.Status} status");

            // Validate at least one document is uploaded
            if (!claim.Documents.Any())
                throw new InvalidOperationException("Please upload at least one document before submitting");

            claim.Status = ClaimStatus.Submitted;
            claim.SubmittedDate = DateTime.UtcNow;
            claim.UpdateTimestamp();

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Claim submitted: {claim.ClaimNumber}");

            return await MapToClaimDto(claim);
        }

        // Admin Methods
        public async Task<IEnumerable<ClaimDto>> GetAllClaimsAsync()
        {
            var claims = await _context.Claims
                .Include(c => c.Documents)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var claimDtos = new List<ClaimDto>();
            foreach (var claim in claims)
            {
                claimDtos.Add(await MapToClaimDto(claim));
            }

            return claimDtos;
        }

        public async Task<IEnumerable<ClaimDto>> GetClaimsByStatusAsync(ClaimStatus status)
        {
            var claims = await _context.Claims
                .Include(c => c.Documents)
                .Where(c => c.Status == status)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var claimDtos = new List<ClaimDto>();
            foreach (var claim in claims)
            {
                claimDtos.Add(await MapToClaimDto(claim));
            }

            return claimDtos;
        }

        public async Task<ClaimDto> ReviewClaimAsync(Guid claimId, ClaimReviewRequest request, string adminName)
        {
            var claim = await _context.Claims
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.Id == claimId);

            if (claim == null)
                throw new KeyNotFoundException("Claim not found");

            if (claim.Status != ClaimStatus.Submitted && claim.Status != ClaimStatus.UnderReview)
                throw new InvalidOperationException($"Cannot review claim in {claim.Status} status");

            claim.Status = request.Status;
            claim.ReviewedDate = DateTime.UtcNow;
            claim.AdjusterNotes = request.AdjusterNotes;

            if (request.Status == ClaimStatus.Approved)
            {
                claim.ApprovedAmount = request.ApprovedAmount ?? claim.ClaimAmount;
                claim.ApprovedDate = DateTime.UtcNow;
                _logger.LogInformation($"Claim approved: {claim.ClaimNumber} by {adminName}");
            }
            else if (request.Status == ClaimStatus.Rejected)
            {
                claim.RejectionReason = request.RejectionReason;
                claim.RejectedDate = DateTime.UtcNow;
                _logger.LogInformation($"Claim rejected: {claim.ClaimNumber} by {adminName}");
            }
            else if (request.Status == ClaimStatus.UnderReview)
            {
                _logger.LogInformation($"Claim under review: {claim.ClaimNumber} by {adminName}");
            }

            claim.UpdateTimestamp();
            await _context.SaveChangesAsync();

            return await MapToClaimDto(claim);
        }

        public async Task<ClaimDto> ApproveClaimAsync(Guid claimId, decimal approvedAmount, string adminName)
        {
            var claim = await _context.Claims.FindAsync(claimId);
            if (claim == null)
                throw new KeyNotFoundException("Claim not found");

            if (claim.Status != ClaimStatus.Submitted && claim.Status != ClaimStatus.UnderReview)
                throw new InvalidOperationException($"Cannot approve claim in {claim.Status} status");

            claim.Status = ClaimStatus.Approved;
            claim.ApprovedAmount = approvedAmount;
            claim.ApprovedDate = DateTime.UtcNow;
            claim.ReviewedDate = DateTime.UtcNow;
            claim.UpdateTimestamp();

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Claim approved: {claim.ClaimNumber} by {adminName}, Amount: {approvedAmount}");

            return await MapToClaimDto(claim);
        }

        public async Task<ClaimDto> RejectClaimAsync(Guid claimId, string reason, string adminName)
        {
            var claim = await _context.Claims.FindAsync(claimId);
            if (claim == null)
                throw new KeyNotFoundException("Claim not found");

            if (claim.Status != ClaimStatus.Submitted && claim.Status != ClaimStatus.UnderReview)
                throw new InvalidOperationException($"Cannot reject claim in {claim.Status} status");

            claim.Status = ClaimStatus.Rejected;
            claim.RejectionReason = reason;
            claim.RejectedDate = DateTime.UtcNow;
            claim.ReviewedDate = DateTime.UtcNow;
            claim.UpdateTimestamp();

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Claim rejected: {claim.ClaimNumber} by {adminName}, Reason: {reason}");

            return await MapToClaimDto(claim);
        }

        public async Task<ClaimDto> MapToClaimDto(InsuranceClaim claim)
        {
            var documentCount = claim.Documents?.Count ?? await _context.ClaimDocuments.CountAsync(d => d.ClaimId == claim.Id);
            var verifiedCount = claim.Documents?.Count(d => d.IsVerified) ?? await _context.ClaimDocuments.CountAsync(d => d.ClaimId == claim.Id && d.IsVerified);

            return new ClaimDto
            {
                Id = claim.Id,
                ClaimNumber = claim.ClaimNumber,
                PolicyId = claim.PolicyId,
                ClaimAmount = claim.ClaimAmount,
                IncidentDescription = claim.IncidentDescription,
                IncidentDate = claim.IncidentDate,
                Status = claim.Status.ToString(),
                SubmittedDate = claim.SubmittedDate,
                ReviewedDate = claim.ReviewedDate,
                RejectionReason = claim.RejectionReason,
                ApprovedAmount = claim.ApprovedAmount,
                DocumentCount = documentCount,
                VerifiedDocumentCount = verifiedCount
            };
        }

        public string GenerateClaimNumber()
        {
            return $"CLM-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }
    }
}