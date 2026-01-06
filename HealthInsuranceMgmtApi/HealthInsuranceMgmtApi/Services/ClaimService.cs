using AutoMapper;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;
using HealthInsuranceMgmtApi.Services.Interfaces;
using HealthInsuranceMgmtApi.Data;
using Microsoft.EntityFrameworkCore;

namespace HealthInsuranceMgmtApi.Services;

public class ClaimService : IClaimService
{
    private readonly IClaimRepository _claimRepository;
    private readonly IPolicyRepository _policyRepository;
    private readonly IUserRepository _userRepository;
    private readonly IHospitalRepository _hospitalRepository;
    private readonly IBusinessValidationService _businessValidationService;
    private readonly IMapper _mapper;
    private readonly HealthInsuranceDbContext _context;

    public ClaimService(
        IClaimRepository claimRepository,
        IPolicyRepository policyRepository,
        IUserRepository userRepository,
        IHospitalRepository hospitalRepository,
        IBusinessValidationService businessValidationService,
        IMapper mapper,
        HealthInsuranceDbContext context)
    {
        _claimRepository = claimRepository;
        _policyRepository = policyRepository;
        _userRepository = userRepository;
        _hospitalRepository = hospitalRepository;
        _businessValidationService = businessValidationService;
        _mapper = mapper;
        _context = context;
    }

    public async Task<IEnumerable<ClaimDto>> GetAllClaimsAsync()
    {
        var claims = await _claimRepository.GetAllAsync();
        return await MapClaimsToDtosAsync(claims);
    }

    public async Task<IEnumerable<ClaimDto>> GetClaimsByUserIdAsync(int userId)
    {
        var claims = await _claimRepository.GetByUserIdAsync(userId);
        return await MapClaimsToDtosAsync(claims);
    }

    public async Task<IEnumerable<ClaimDto>> GetClaimsByStatusAsync(ClaimStatus status)
    {
        var claims = await _claimRepository.GetByStatusAsync(status);
        return await MapClaimsToDtosAsync(claims);
    }

    public async Task<ClaimDto?> GetClaimByIdAsync(int claimId)
    {
        var claim = await _context.Claims
            .Include(c => c.User)
            .Include(c => c.Policy)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ClaimId == claimId);
            
        if (claim == null) return null;

        var claimDtos = await MapClaimsToDtosAsync(new[] { claim });
        return claimDtos.FirstOrDefault();
    }

    public async Task<ClaimDto> CreateClaimAsync(int userId, CreateClaimDto createClaimDto)
    {
        var policy = await _policyRepository.GetByIdAsync(createClaimDto.PolicyId);
        if (policy == null)
            throw new ArgumentException("Policy not found");

        if (policy.UserId != userId)
            throw new UnauthorizedAccessException("Policy does not belong to the user");

        if (policy.Status != PolicyStatus.Active)
            throw new InvalidOperationException("Policy is not active");

        if (policy.EndDate < DateTime.UtcNow)
            throw new InvalidOperationException("Policy has expired");

        // Validate claim amount using business validation service
        var isValidAmount = await _businessValidationService.ValidateClaimAmountAsync(
            createClaimDto.PolicyId, 
            createClaimDto.ClaimAmount
        );

        if (!isValidAmount)
            throw new InvalidOperationException("Claim amount exceeds available coverage limit or remaining coverage");

        var hospital = await _hospitalRepository.GetByIdAsync(createClaimDto.HospitalId);
        if (hospital == null)
            throw new ArgumentException("Hospital not found");

        var claim = new Claim
        {
            PolicyId = createClaimDto.PolicyId,
            UserId = userId,
            HospitalId = createClaimDto.HospitalId,
            ClaimAmount = createClaimDto.ClaimAmount,
            Notes = createClaimDto.Notes,
            ClaimNumber = await GenerateClaimNumberAsync(),
            Status = ClaimStatus.Submitted,
            SubmittedAt = DateTime.UtcNow
        };

        await _claimRepository.AddAsync(claim);

        var claimDtos = await MapClaimsToDtosAsync(new[] { claim });
        return claimDtos.First();
    }

    public async Task<ClaimDto> AddMedicalNotesAsync(int claimId, int hospitalUserId, AddMedicalNotesDto addMedicalNotesDto)
    {
        var claim = await _claimRepository.GetByIdAsync(claimId);
        if (claim == null)
            throw new ArgumentException("Claim not found");

        if (claim.Status != ClaimStatus.Submitted)
            throw new InvalidOperationException("Medical notes can only be added to submitted claims");

        var hospitalUser = await _userRepository.GetByIdAsync(hospitalUserId);
        if (hospitalUser == null || hospitalUser.Role != UserRole.HospitalStaff)
            throw new UnauthorizedAccessException("Only hospital staff can add medical notes");

        if (hospitalUser.HospitalId != claim.HospitalId)
            throw new UnauthorizedAccessException("Hospital staff can only add notes to claims for their hospital");

        claim.MedicalNotes = addMedicalNotesDto.MedicalNotes;
        claim.Status = ClaimStatus.InReview;

        await _claimRepository.UpdateAsync(claim);

        var claimDtos = await MapClaimsToDtosAsync(new[] { claim });
        return claimDtos.First();
    }

    public async Task<IEnumerable<ClaimDto>> GetHospitalPendingClaimsAsync(int hospitalId)
    {
        var claims = await _claimRepository.GetByHospitalAndStatusAsync(hospitalId, ClaimStatus.Submitted);
        return await MapClaimsToDtosAsync(claims);
    }

    public async Task<IEnumerable<ClaimDto>> GetHospitalClaimsAsync(int hospitalId)
    {
        var claims = await _context.Claims
            .Include(c => c.User)
            .Include(c => c.Policy)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .Where(c => c.HospitalId == hospitalId)
            .AsNoTracking()
            .ToListAsync();
        return await MapClaimsToDtosAsync(claims);
    }

    public async Task<IEnumerable<ClaimDto>> GetClaimsPendingReviewAsync()
    {
        var claims = await _context.Claims
            .Include(c => c.User)
            .Include(c => c.Policy)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .Where(c => (c.Status == ClaimStatus.InReview && !string.IsNullOrEmpty(c.MedicalNotes)) ||
                       c.Status == ClaimStatus.Approved)
            .AsNoTracking()
            .ToListAsync();
        return await MapClaimsToDtosAsync(claims);
    }

    public async Task<ClaimDto> MarkAsPaidAsync(int claimId)
    {
        var claim = await _claimRepository.GetByIdAsync(claimId);
        if (claim == null)
            throw new ArgumentException("Claim not found");

        if (claim.Status != ClaimStatus.Approved)
            throw new InvalidOperationException("Only approved claims can be marked as paid");

        claim.Status = ClaimStatus.Paid;
        claim.ProcessedAt = DateTime.UtcNow;
        
        // Create payment record
        var payment = new Payment
        {
            ClaimId = claim.ClaimId,
            Amount = claim.ApprovedAmount ?? claim.ClaimAmount,
            PaymentDate = DateTime.UtcNow,
            PaymentReference = await GeneratePaymentReferenceAsync(),
            PaymentMethod = "Claim Payout",
            Notes = $"Payment for approved claim {claim.ClaimNumber}",
            Status = PaymentStatus.Completed,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Payments.Add(payment);
        await _claimRepository.UpdateAsync(claim);

        var claimDtos = await MapClaimsToDtosAsync(new[] { claim });
        return claimDtos.First();
    }

    public async Task<ClaimDto> ReviewClaimAsync(int claimId, int reviewerId, ReviewClaimDto reviewClaimDto)
    {
        var claim = await _claimRepository.GetByIdAsync(claimId);
        if (claim == null)
            throw new ArgumentException("Claim not found");

        if (claim.Status != ClaimStatus.InReview)
            throw new InvalidOperationException("Only claims in review can be approved or rejected");

        var reviewer = await _userRepository.GetByIdAsync(reviewerId);
        if (reviewer == null || reviewer.Role != UserRole.ClaimsOfficer)
            throw new UnauthorizedAccessException("Only claims officers can review claims");

        claim.Status = reviewClaimDto.Status;
        claim.ReviewedBy = reviewerId;
        claim.ReviewedAt = DateTime.UtcNow;

        if (reviewClaimDto.Status == ClaimStatus.Approved)
        {
            claim.ApprovedAmount = reviewClaimDto.ApprovedAmount ?? claim.ClaimAmount;
            
            // Update remaining coverage when claim is approved
            await _businessValidationService.UpdateRemainingCoverageAsync(
                claim.PolicyId, 
                claim.ApprovedAmount.Value
            );
        }
        else if (reviewClaimDto.Status == ClaimStatus.Rejected)
        {
            claim.RejectionReason = reviewClaimDto.RejectionReason;
            claim.ProcessedAt = DateTime.UtcNow;
        }

        await _claimRepository.UpdateAsync(claim);

        var claimDtos = await MapClaimsToDtosAsync(new[] { claim });
        return claimDtos.First();
    }

    private async Task<IEnumerable<ClaimDto>> MapClaimsToDtosAsync(IEnumerable<Claim> claims)
    {
        var claimDtos = new List<ClaimDto>();

        foreach (var claim in claims)
        {
            var claimDto = _mapper.Map<ClaimDto>(claim);
            claimDto.PolicyNumber = claim.Policy?.PolicyNumber ?? "Unknown";
            claimDto.UserId = claim.UserId;
            claimDto.UserName = claim.User != null ? $"{claim.User.FirstName} {claim.User.LastName}" : "Unknown";
            claimDto.HospitalName = claim.Hospital?.HospitalName ?? "Unknown";
            claimDto.MedicalNotes = claim.MedicalNotes;
            claimDto.ReviewerName = claim.Reviewer != null ? $"{claim.Reviewer.FirstName} {claim.Reviewer.LastName}" : null;

            claimDtos.Add(claimDto);
        }

        return claimDtos.OrderByDescending(c => c.ClaimNumber);
    }

    private async Task<string> GenerateClaimNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        string claimNumber;
        int attempts = 0;
        const int maxAttempts = 10;
        
        do
        {
            var count = await _claimRepository.CountAsync(c => c.SubmittedAt.Year == year);
            claimNumber = $"CLM-{year}-{(count + 1 + attempts):D3}";
            attempts++;
            
            if (attempts > maxAttempts)
            {
                // Fallback to timestamp-based generation
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                claimNumber = $"CLM-{year}-{timestamp.ToString().Substring(timestamp.ToString().Length - 6)}";
                break;
            }
        }
        while (await _context.Claims.AnyAsync(c => c.ClaimNumber == claimNumber));
        
        return claimNumber;
    }
    
    private async Task<string> GeneratePaymentReferenceAsync()
    {
        var year = DateTime.UtcNow.Year;
        string paymentRef;
        int attempts = 0;
        const int maxAttempts = 10;
        
        do
        {
            var count = await _context.Payments.CountAsync(p => p.PaymentDate.Year == year);
            paymentRef = $"PAY-CLM-{year}-{(count + 1 + attempts):D3}";
            attempts++;
            
            if (attempts > maxAttempts)
            {
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                paymentRef = $"PAY-CLM-{year}-{timestamp.ToString().Substring(timestamp.ToString().Length - 6)}";
                break;
            }
        }
        while (await _context.Payments.AnyAsync(p => p.PaymentReference == paymentRef));
        
        return paymentRef;
    }
}