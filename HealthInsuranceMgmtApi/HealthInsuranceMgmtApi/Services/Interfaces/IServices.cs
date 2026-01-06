using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<UserDto?> GetUserByIdAsync(int userId);
}

public interface IPolicyService
{
    Task<IEnumerable<PolicyDto>> GetAllPoliciesAsync();
    Task<PagedResult<PolicyDto>> GetPagedPoliciesAsync(int pageNumber, int pageSize, string? sortBy, bool ascending);
    Task<IEnumerable<PolicyDto>> GetPoliciesByUserIdAsync(int userId);
    Task<PolicyDto?> GetPolicyByIdAsync(int policyId);
    Task<PolicyDto> CreatePolicyAsync(CreatePolicyDto createPolicyDto, int? createdByUserId = null);
    Task<PolicyDto> UpdatePolicyAsync(int policyId, CreatePolicyDto updatePolicyDto);
    Task<PolicyDto> RenewPolicyAsync(int policyId);
    Task<bool> DeletePolicyAsync(int policyId);
}

public interface IClaimService
{
    Task<IEnumerable<ClaimDto>> GetAllClaimsAsync();
    Task<IEnumerable<ClaimDto>> GetClaimsByUserIdAsync(int userId);
    Task<IEnumerable<ClaimDto>> GetClaimsByStatusAsync(ClaimStatus status);
    Task<ClaimDto?> GetClaimByIdAsync(int claimId);
    Task<ClaimDto> CreateClaimAsync(int userId, CreateClaimDto createClaimDto);
    Task<ClaimDto> AddMedicalNotesAsync(int claimId, int hospitalUserId, AddMedicalNotesDto addMedicalNotesDto);
    Task<IEnumerable<ClaimDto>> GetHospitalPendingClaimsAsync(int hospitalId);
    Task<IEnumerable<ClaimDto>> GetHospitalClaimsAsync(int hospitalId);
    Task<IEnumerable<ClaimDto>> GetClaimsPendingReviewAsync();
    Task<ClaimDto> ReviewClaimAsync(int claimId, int reviewerId, ReviewClaimDto reviewClaimDto);
    Task<ClaimDto> MarkAsPaidAsync(int claimId);
}

public interface IInsurancePlanService
{
    Task<IEnumerable<InsurancePlanDto>> GetAllPlansAsync();
    Task<IEnumerable<InsurancePlanDto>> GetActivePlansAsync();
    Task<InsurancePlanDto?> GetPlanByIdAsync(int planId);
    Task<InsurancePlanDto> CreatePlanAsync(CreateInsurancePlanDto createPlanDto);
    Task<InsurancePlanDto> UpdatePlanAsync(int planId, CreateInsurancePlanDto updatePlanDto);
    Task<bool> DeletePlanAsync(int planId);
}

public interface IHospitalService
{
    Task<IEnumerable<HospitalDto>> GetAllHospitalsAsync();
    Task<IEnumerable<HospitalDto>> GetNetworkProvidersAsync();
    Task<HospitalDto?> GetHospitalByIdAsync(int hospitalId);
    Task<HospitalDto> CreateHospitalAsync(CreateHospitalDto createHospitalDto);
    Task<HospitalDto> UpdateHospitalAsync(int hospitalId, UpdateHospitalDto updateHospitalDto);
}
