using AutoMapper;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceMgmtApi.Services;

public class PolicyService : IPolicyService
{
    private readonly IPolicyRepository _policyRepository;
    private readonly IUserRepository _userRepository;
    private readonly IInsurancePlanRepository _planRepository;
    private readonly IMapper _mapper;

    public PolicyService(
        IPolicyRepository policyRepository,
        IUserRepository userRepository,
        IInsurancePlanRepository planRepository,
        IMapper mapper)
    {
        _policyRepository = policyRepository;
        _userRepository = userRepository;
        _planRepository = planRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PolicyDto>> GetAllPoliciesAsync()
    {
        var policies = await _policyRepository.GetAllAsync();
        var policyDtos = new List<PolicyDto>();

        foreach (var policy in policies)
        {
            var user = await _userRepository.GetByIdAsync(policy.UserId);
            var plan = await _planRepository.GetByIdAsync(policy.PlanId);
            
            var policyDto = _mapper.Map<PolicyDto>(policy);
            policyDto.UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown";
            policyDto.PlanName = plan?.PlanName ?? "Unknown";
            policyDto.CoverageLimit = plan?.CoverageLimit;
            
            policyDtos.Add(policyDto);
        }

        return policyDtos.OrderByDescending(p => p.PolicyId);
    }

    public async Task<IEnumerable<PolicyDto>> GetPoliciesByUserIdAsync(int userId)
    {
        var policies = await _policyRepository.GetByUserIdAsync(userId);
        var policyDtos = new List<PolicyDto>();

        foreach (var policy in policies)
        {
            var policyDto = _mapper.Map<PolicyDto>(policy);
            policyDto.UserName = policy.User != null ? $"{policy.User.FirstName} {policy.User.LastName}" : "Unknown";
            policyDto.PlanName = policy.InsurancePlan?.PlanName ?? "Unknown";
            policyDto.CoverageLimit = policy.InsurancePlan?.CoverageLimit;
            
            policyDtos.Add(policyDto);
        }

        return policyDtos;
    }

    public async Task<PagedResult<PolicyDto>> GetPagedPoliciesAsync(int pageNumber, int pageSize, string? sortBy, bool ascending)
    {
        var pagedPolicies = await _policyRepository.GetPagedAsync(pageNumber, pageSize, sortBy, ascending);
        var policyDtos = new List<PolicyDto>();

        foreach (var policy in pagedPolicies.Items)
        {
            var user = await _userRepository.GetByIdAsync(policy.UserId);
            var plan = await _planRepository.GetByIdAsync(policy.PlanId);
            
            var policyDto = _mapper.Map<PolicyDto>(policy);
            policyDto.UserName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown";
            policyDto.PlanName = plan?.PlanName ?? "Unknown";
            policyDto.CoverageLimit = plan?.CoverageLimit;
            
            policyDtos.Add(policyDto);
        }

        return new PagedResult<PolicyDto>
        {
            Items = policyDtos,
            TotalCount = pagedPolicies.TotalCount,
            PageNumber = pagedPolicies.PageNumber,
            PageSize = pagedPolicies.PageSize
        };
    }

    public async Task<PolicyDto?> GetPolicyByIdAsync(int policyId)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null) return null;

        // Use included data instead of separate queries
        var policyDto = _mapper.Map<PolicyDto>(policy);
        policyDto.UserName = policy.User != null ? $"{policy.User.FirstName} {policy.User.LastName}" : "Unknown";
        policyDto.UserEmail = policy.User?.Email;
        policyDto.PlanName = policy.InsurancePlan?.PlanName ?? "Unknown";
        policyDto.CoverageLimit = policy.InsurancePlan?.CoverageLimit;
        
        return policyDto;
    }

    public async Task<PolicyDto> CreatePolicyAsync(CreatePolicyDto createPolicyDto, int? createdByUserId = null)
    {
        var user = await _userRepository.GetByIdAsync(createPolicyDto.UserId);
        if (user == null)
            throw new ArgumentException("User not found");

        var plan = await _planRepository.GetByIdAsync(createPolicyDto.PlanId);
        if (plan == null)
            throw new ArgumentException("Insurance plan not found");

        var policy = _mapper.Map<Policy>(createPolicyDto);
        policy.PolicyNumber = await GeneratePolicyNumberAsync();
        policy.EndDate = createPolicyDto.StartDate.AddMonths(plan.DurationInMonths);
        policy.Status = PolicyStatus.Active;
        policy.RemainingCoverage = plan.CoverageLimit; // Initialize with full coverage
        policy.CreatedAt = DateTime.UtcNow;
        policy.CreatedByUserId = createdByUserId;

        await _policyRepository.AddAsync(policy);

        var policyDto = _mapper.Map<PolicyDto>(policy);
        policyDto.UserName = $"{user.FirstName} {user.LastName}";
        policyDto.PlanName = plan.PlanName;
        policyDto.CoverageLimit = plan.CoverageLimit;

        return policyDto;
    }

    public async Task<PolicyDto> UpdatePolicyAsync(int policyId, CreatePolicyDto updatePolicyDto)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null)
            throw new ArgumentException("Policy not found");

        var user = await _userRepository.GetByIdAsync(updatePolicyDto.UserId);
        if (user == null)
            throw new ArgumentException("User not found");

        var plan = await _planRepository.GetByIdAsync(updatePolicyDto.PlanId);
        if (plan == null)
            throw new ArgumentException("Insurance plan not found");

        policy.UserId = updatePolicyDto.UserId;
        policy.PlanId = updatePolicyDto.PlanId;
        policy.StartDate = updatePolicyDto.StartDate;
        policy.EndDate = updatePolicyDto.StartDate.AddMonths(plan.DurationInMonths);
        policy.PremiumPaid = updatePolicyDto.PremiumPaid;
        policy.AutoRenew = updatePolicyDto.AutoRenew;
        
        // Update status if provided
        if (updatePolicyDto.Status.HasValue)
        {
            policy.Status = updatePolicyDto.Status.Value;
        }
        
        policy.UpdatedAt = DateTime.UtcNow;

        await _policyRepository.UpdateAsync(policy);

        var policyDto = _mapper.Map<PolicyDto>(policy);
        policyDto.UserName = $"{user.FirstName} {user.LastName}";
        policyDto.PlanName = plan.PlanName;
        policyDto.CoverageLimit = plan.CoverageLimit;

        return policyDto;
    }

    public async Task<PolicyDto> RenewPolicyAsync(int policyId)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null)
            throw new ArgumentException("Policy not found");

        if (policy.Status != PolicyStatus.Active && policy.Status != PolicyStatus.Expired)
            throw new InvalidOperationException("Only active or expired policies can be renewed");

        var plan = await _planRepository.GetByIdAsync(policy.PlanId);
        if (plan == null)
            throw new ArgumentException("Insurance plan not found");

        var user = await _userRepository.GetByIdAsync(policy.UserId);
        if (user == null)
            throw new ArgumentException("User not found");

        // Update policy for renewal
        policy.StartDate = DateTime.UtcNow;
        policy.EndDate = DateTime.UtcNow.AddMonths(plan.DurationInMonths);
        policy.Status = PolicyStatus.Active;
        policy.RenewedOn = DateTime.UtcNow;
        policy.UpdatedAt = DateTime.UtcNow;

        await _policyRepository.UpdateAsync(policy);

        var policyDto = _mapper.Map<PolicyDto>(policy);
        policyDto.UserName = $"{user.FirstName} {user.LastName}";
        policyDto.PlanName = plan.PlanName;
        policyDto.CoverageLimit = plan.CoverageLimit;

        return policyDto;
    }

    public async Task<bool> DeletePolicyAsync(int policyId)
    {
        var policy = await _policyRepository.GetByIdAsync(policyId);
        if (policy == null) return false;

        await _policyRepository.DeleteAsync(policy);
        return true;
    }

    private async Task<string> GeneratePolicyNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await _policyRepository.CountAsync(p => p.CreatedAt.Year == year);
        var policyNumber = $"POL-{year}-{(count + 1):D6}";
        
        // Ensure uniqueness by checking if policy number already exists
        while (await _policyRepository.ExistsByPolicyNumberAsync(policyNumber))
        {
            count++;
            policyNumber = $"POL-{year}-{count:D6}";
        }
        
        return policyNumber;
    }
}
