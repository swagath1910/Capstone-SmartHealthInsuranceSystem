using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Services;

public interface IBusinessValidationService
{
    Task<bool> ValidateClaimAmountAsync(int policyId, decimal claimAmount);
    Task<bool> ValidatePolicyExpiryAsync(int policyId);
    Task<bool> ValidatePremiumPaymentAsync(int policyId, decimal paymentAmount);
    Task<bool> ValidateAnnualPremiumPaymentAsync(int policyId, decimal paymentAmount);
    Task<decimal> GetRemainingCoverageAsync(int policyId);
    Task UpdateRemainingCoverageAsync(int policyId, decimal claimAmount);
}

public class BusinessValidationService : IBusinessValidationService
{
    private readonly IPolicyRepository _policyRepository;
    private readonly IInsurancePlanRepository _planRepository;
    private readonly IClaimRepository _claimRepository;

    public BusinessValidationService(
        IPolicyRepository policyRepository,
        IInsurancePlanRepository planRepository,
        IClaimRepository claimRepository)
    {
        _policyRepository = policyRepository;
        _planRepository = planRepository;
        _claimRepository = claimRepository;
    }

    public async Task<bool> ValidateClaimAmountAsync(int policyId, decimal claimAmount)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null) return false;

        var plan = await _planRepository.GetByIdAsync(policy.PlanId);
        if (plan == null) return false;

        // Check if policy is active
        if (policy.Status != PolicyStatus.Active) return false;

        // Check if policy has not expired (date-only comparison)
        if (policy.EndDate.Date < DateTime.UtcNow.Date) return false;

        // Check if claim amount exceeds remaining coverage
        return claimAmount <= policy.RemainingCoverage;
    }

    public async Task<bool> ValidatePolicyExpiryAsync(int policyId)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null) return false;

        return policy.EndDate.Date > DateTime.UtcNow.Date && policy.Status == PolicyStatus.Active;
    }

    public async Task<bool> ValidatePremiumPaymentAsync(int policyId, decimal paymentAmount)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null) return false;

        var plan = await _planRepository.GetByIdAsync(policy.PlanId);
        if (plan == null) return false;

        // Validate payment amount matches premium (allow some tolerance)
        var tolerance = plan.PremiumAmount * 0.01m; // 1% tolerance
        return Math.Abs(paymentAmount - plan.PremiumAmount) <= tolerance;
    }

    public async Task<bool> ValidateAnnualPremiumPaymentAsync(int policyId, decimal paymentAmount)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null) return false;

        var plan = await _planRepository.GetByIdAsync(policy.PlanId);
        if (plan == null) return false;

        // Allow any payment amount greater than monthly premium
        var monthlyPremium = plan.PremiumAmount;
        if (paymentAmount < monthlyPremium)
            return false;

        // If no previous payment, allow payment
        if (!policy.LastPremiumPaymentDate.HasValue)
            return true;

        // If there was a previous payment, check if it was more than 30 days ago (very lenient)
        var lastPaymentDate = policy.LastPremiumPaymentDate.Value.Date;
        var currentDate = DateTime.UtcNow.Date;
        var daysSinceLastPayment = (currentDate - lastPaymentDate).Days;
        
        // Allow payment if more than 30 days have passed
        return daysSinceLastPayment >= 30;
    }

    public async Task<decimal> GetRemainingCoverageAsync(int policyId)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        return policy?.RemainingCoverage ?? 0;
    }

    public async Task UpdateRemainingCoverageAsync(int policyId, decimal claimAmount)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy != null)
        {
            policy.RemainingCoverage -= claimAmount;
            await _policyRepository.UpdateAsync(policy);
        }
    }
}