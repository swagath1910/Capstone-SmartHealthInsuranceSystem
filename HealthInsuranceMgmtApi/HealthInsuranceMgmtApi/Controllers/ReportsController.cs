using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "InsuranceAgent,ClaimsOfficer")]
public class ReportsController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IPolicyRepository _policyRepository;
    private readonly IClaimRepository _claimRepository;
    private readonly IInsurancePlanRepository _planRepository;
    private readonly IHospitalRepository _hospitalRepository;

    public ReportsController(
        IUserRepository userRepository,
        IPolicyRepository policyRepository,
        IClaimRepository claimRepository,
        IInsurancePlanRepository planRepository,
        IHospitalRepository hospitalRepository)
    {
        _userRepository = userRepository;
        _policyRepository = policyRepository;
        _claimRepository = claimRepository;
        _planRepository = planRepository;
        _hospitalRepository = hospitalRepository;
    }

    // Policies by Type and Status
    [HttpGet("policies-by-type-status")]
    public async Task<ActionResult<object>> GetPoliciesByTypeAndStatus()
    {
        var policies = await _policyRepository.GetAllAsync();
        var plans = await _planRepository.GetAllAsync();

        var result = (from policy in policies
                     join plan in plans on policy.PlanId equals plan.PlanId
                     group new { policy, plan } by new { plan.PlanType, policy.Status } into g
                     select new
                     {
                         PlanType = g.Key.PlanType.ToString(),
                         Status = g.Key.Status.ToString(),
                         Count = g.Count(),
                         TotalPremium = g.Sum(x => x.policy.PremiumPaid)
                     })
                     .OrderBy(x => x.PlanType)
                     .ThenBy(x => x.Status)
                     .ToList();

        return Ok(result);
    }

    // Claims by Status, Amount, and Hospital
    [HttpGet("claims-by-status-amount")]
    public async Task<ActionResult<object>> GetClaimsByStatusAndAmount()
    {
        var claims = await _claimRepository.GetAllAsync();

        var result = claims
            .GroupBy(c => c.Status)
            .Select(g => new
            {
                Status = g.Key.ToString(),
                Count = g.Count(),
                TotalAmount = g.Sum(c => c.ClaimAmount),
                AverageAmount = g.Average(c => c.ClaimAmount),
                ApprovedAmount = g.Where(c => c.ApprovedAmount.HasValue).Sum(c => c.ApprovedAmount!.Value)
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToList();

        return Ok(result);
    }

    [HttpGet("claims-by-hospital-detailed")]
    public async Task<ActionResult<object>> GetClaimsByHospitalDetailed()
    {
        var claims = await _claimRepository.GetAllAsync();
        var hospitals = await _hospitalRepository.GetAllAsync();

        var result = (from claim in claims
                     join hospital in hospitals on claim.HospitalId equals hospital.HospitalId
                     group new { claim, hospital } by new { hospital.HospitalName, hospital.City } into g
                     select new
                     {
                         HospitalName = g.Key.HospitalName,
                         City = g.Key.City,
                         ClaimCount = g.Count(),
                         TotalAmount = g.Sum(x => x.claim.ClaimAmount),
                         AverageAmount = g.Average(x => x.claim.ClaimAmount),
                         ApprovedClaims = g.Count(x => x.claim.Status == ClaimStatus.Approved),
                         PendingClaims = g.Count(x => x.claim.Status == ClaimStatus.Submitted || x.claim.Status == ClaimStatus.InReview)
                     })
                     .OrderByDescending(x => x.TotalAmount)
                     .Take(20)
                     .ToList();

        return Ok(result);
    }

    // Premium vs Payout Report
    [HttpGet("premium-vs-payout")]
    public async Task<ActionResult<object>> GetPremiumVsPayoutReport()
    {
        var policies = await _policyRepository.GetAllAsync();
        var claims = await _claimRepository.GetAllAsync();

        // Get premiums collected per month
        var monthlyPremiums = policies
            .Where(p => p.StartDate >= DateTime.UtcNow.AddMonths(-12))
            .GroupBy(p => new { p.StartDate.Year, p.StartDate.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalPremiums = g.Sum(p => p.PremiumPaid)
            })
            .ToList();

        // Get payouts per month (approved claims)
        var monthlyPayouts = claims
            .Where(c => c.ApprovedAmount.HasValue && c.ReviewedAt.HasValue && 
                        c.ReviewedAt.Value >= DateTime.UtcNow.AddMonths(-12))
            .GroupBy(c => new { c.ReviewedAt!.Value.Year, c.ReviewedAt.Value.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalPayouts = g.Sum(c => c.ApprovedAmount!.Value)
            })
            .ToList();

        // Combines data
        var allMonths = monthlyPremiums
            .Select(p => new { p.Year, p.Month })
            .Union(monthlyPayouts.Select(p => new { p.Year, p.Month }))
            .Distinct()
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month);

        var result = allMonths.Select(m => new
        {
            Month = DateOnly.FromDayNumber(new DateOnly(m.Year, m.Month, 1).DayNumber).ToString("MMMM yyyy"),
            Year = m.Year,
            MonthNumber = m.Month,
            TotalPremiums = monthlyPremiums
                .Where(p => p.Year == m.Year && p.Month == m.Month)
                .Sum(p => p.TotalPremiums),
            TotalPayouts = monthlyPayouts
                .Where(p => p.Year == m.Year && p.Month == m.Month)
                .Sum(p => p.TotalPayouts),
            NetBalance = monthlyPremiums
                .Where(p => p.Year == m.Year && p.Month == m.Month)
                .Sum(p => p.TotalPremiums) - 
                monthlyPayouts
                .Where(p => p.Year == m.Year && p.Month == m.Month)
                .Sum(p => p.TotalPayouts)
        }).Select(x => new
        {
            x.Month,
            x.Year,
            x.MonthNumber,
            x.TotalPremiums,
            x.TotalPayouts,
            x.NetBalance,
            PayoutRatio = x.TotalPremiums > 0 ? (x.TotalPayouts / x.TotalPremiums * 100) : 0
        }).ToList();

        return Ok(result);
    }

    //  High-Value Claim Analysis kept threshold as 5000 but can be changed 
    [HttpGet("high-value-claims")]
    public async Task<ActionResult<object>> GetHighValueClaims([FromQuery] decimal threshold = 5000)
    {
        var claims = await _claimRepository.GetAllAsync();
        var policies = await _policyRepository.GetAllAsync();
        var hospitals = await _hospitalRepository.GetAllAsync();
        var users = await _userRepository.GetAllAsync();

        var result = (from claim in claims
                     where claim.ClaimAmount >= threshold
                     join policy in policies on claim.PolicyId equals policy.PolicyId
                     join hospital in hospitals on claim.HospitalId equals hospital.HospitalId
                     join user in users on claim.UserId equals user.Id
                     orderby claim.ClaimAmount descending
                     select new
                     {
                         ClaimId = claim.ClaimId,
                         PolicyNumber = policy.PolicyNumber,
                         PatientName = $"{user.FirstName} {user.LastName}",
                         HospitalName = hospital.HospitalName,
                         City = hospital.City,
                         ClaimAmount = claim.ClaimAmount,
                         ApprovedAmount = claim.ApprovedAmount,
                         Status = claim.Status.ToString(),
                         SubmittedDate = claim.SubmittedAt.ToString("yyyy-MM-dd"),
                         ReviewedDate = claim.ReviewedAt.HasValue ? claim.ReviewedAt.Value.ToString("yyyy-MM-dd") : null,
                         ProcessingDays = claim.ReviewedAt.HasValue ? 
                             (claim.ReviewedAt.Value - claim.SubmittedAt).Days : 
                             (DateTime.UtcNow - claim.SubmittedAt).Days
                     })
                     .Take(50)
                     .ToList();

        return Ok(result);
    }
}
