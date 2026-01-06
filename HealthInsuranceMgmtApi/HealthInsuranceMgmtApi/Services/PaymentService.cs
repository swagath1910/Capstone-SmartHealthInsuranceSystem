using AutoMapper;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceMgmtApi.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPolicyRepository _policyRepository;
    private readonly IClaimRepository _claimRepository;
    private readonly IBusinessValidationService _businessValidationService;
    private readonly IMapper _mapper;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IPolicyRepository policyRepository,
        IClaimRepository claimRepository,
        IBusinessValidationService businessValidationService,
        IMapper mapper)
    {
        _paymentRepository = paymentRepository;
        _policyRepository = policyRepository;
        _claimRepository = claimRepository;
        _businessValidationService = businessValidationService;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync()
    {
        var payments = await _paymentRepository.GetAllAsync();
        return await MapPaymentsToDtosAsync(payments);
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByUserIdAsync(int userId)
    {
        // Get user's policies
        var policies = await _policyRepository.GetByUserIdAsync(userId);
        var policyIds = policies.Select(p => p.PolicyId).ToList();
        
        // Get user's claims
        var claims = await _claimRepository.GetByUserIdAsync(userId);
        var claimIds = claims.Select(c => c.ClaimId).ToList();
        
        // Get all payments related to user's policies or claims
        var allPayments = await _paymentRepository.GetAllAsync();
        var userPayments = allPayments.Where(p => 
            (p.PolicyId.HasValue && policyIds.Contains(p.PolicyId.Value)) ||
            (p.ClaimId.HasValue && claimIds.Contains(p.ClaimId.Value))
        );

        return await MapPaymentsToDtosAsync(userPayments);
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByPolicyIdAsync(int policyId)
    {
        var payments = await _paymentRepository.GetByPolicyIdAsync(policyId);
        return await MapPaymentsToDtosAsync(payments);
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByTypeAsync(PaymentType paymentType)
    {
        var payments = await _paymentRepository.GetByPaymentTypeAsync(paymentType);
        return await MapPaymentsToDtosAsync(payments);
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(int paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment == null) return null;

        var paymentDtos = await MapPaymentsToDtosAsync(new[] { payment });
        return paymentDtos.FirstOrDefault();
    }

    public async Task<PaymentDto> ProcessPremiumPaymentAsync(int userId, ProcessPaymentDto processPaymentDto)
    {
        var policy = await _policyRepository.GetByIdAsync(processPaymentDto.PolicyId);
        if (policy == null)
            throw new ArgumentException("Policy not found");

        if (policy.UserId != userId)
            throw new UnauthorizedAccessException("Policy does not belong to the user");

        if (policy.Status != PolicyStatus.Active)
            throw new InvalidOperationException("Cannot make payment for inactive policy");

        // Get plan details for logging
        var plan = await _policyRepository.GetPlanByPolicyIdAsync(processPaymentDto.PolicyId);
        var expectedAnnualPremium = plan?.PremiumAmount * 12 ?? 0;
        
        // Log payment details for debugging
        Console.WriteLine($"Payment Debug - Policy: {processPaymentDto.PolicyId}, Sent Amount: {processPaymentDto.Amount}, Expected Annual: {expectedAnnualPremium}, Monthly Premium: {plan?.PremiumAmount}");

        // Validate annual premium payment using business validation
        var isValidPayment = await _businessValidationService.ValidateAnnualPremiumPaymentAsync(
            processPaymentDto.PolicyId, 
            processPaymentDto.Amount
        );

        if (!isValidPayment)
        {
            throw new InvalidOperationException("Payment not allowed. You must wait at least 30 days between premium payments.");
        }

        var payment = new Payment
        {
            PolicyId = processPaymentDto.PolicyId,
            Amount = processPaymentDto.Amount,
            PaymentType = PaymentType.Premium,
            Status = PaymentStatus.Completed,
            PaymentDate = DateTime.UtcNow,
            PaymentMethod = processPaymentDto.PaymentMethod,
            Notes = processPaymentDto.Notes,
            PaymentReference = await GeneratePaymentReferenceAsync(),
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment);

        // Update policy with payment information and reset remaining coverage
        policy.LastPremiumPaymentDate = DateTime.UtcNow.Date;
        
        // Reset remaining coverage to full coverage limit
        if (plan != null)
        {
            policy.RemainingCoverage = plan.CoverageLimit;
        }
        
        await _policyRepository.UpdateAsync(policy);

        var paymentDtos = await MapPaymentsToDtosAsync(new[] { payment });
        return paymentDtos.First();
    }

    public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto)
    {
        var payment = _mapper.Map<Payment>(createPaymentDto);
        payment.PaymentReference = await GeneratePaymentReferenceAsync();
        payment.Status = PaymentStatus.Completed;
        payment.CreatedAt = DateTime.UtcNow;

        await _paymentRepository.AddAsync(payment);

        var paymentDtos = await MapPaymentsToDtosAsync(new[] { payment });
        return paymentDtos.First();
    }

    private async Task<IEnumerable<PaymentDto>> MapPaymentsToDtosAsync(IEnumerable<Payment> payments)
    {
        var paymentDtos = new List<PaymentDto>();

        foreach (var payment in payments)
        {
            var policy = payment.PolicyId.HasValue ? await _policyRepository.GetByIdAsync(payment.PolicyId.Value) : null;
            var claim = payment.ClaimId.HasValue ? await _claimRepository.GetByIdAsync(payment.ClaimId.Value) : null;

            var paymentDto = _mapper.Map<PaymentDto>(payment);
            paymentDto.PolicyNumber = policy?.PolicyNumber;
            paymentDto.ClaimNumber = claim?.ClaimNumber;

            paymentDtos.Add(paymentDto);
        }

        return paymentDtos.OrderByDescending(p => p.PaymentDate);
    }

    private async Task<string> GeneratePaymentReferenceAsync()
    {
        var year = DateTime.UtcNow.Year;
        string paymentRef;
        int attempts = 0;
        const int maxAttempts = 10;
        
        do
        {
            var count = await _paymentRepository.CountAsync(p => p.CreatedAt.Year == year);
            paymentRef = $"PAY-{year}-{(count + 1 + attempts):D6}";
            attempts++;
            
            if (attempts > maxAttempts)
            {
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                paymentRef = $"PAY-{year}-{timestamp.ToString().Substring(timestamp.ToString().Length - 6)}";
                break;
            }
        }
        while (await _paymentRepository.ExistsByReferenceAsync(paymentRef));
        
        return paymentRef;
    }
}
