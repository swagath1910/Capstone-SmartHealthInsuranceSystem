using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.Repositories.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
    Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role);
    Task<IEnumerable<User>> GetHospitalStaffAsync(int hospitalId);
}

public interface IPolicyRepository : IGenericRepository<Policy>
{
    Task<IEnumerable<Policy>> GetByUserIdAsync(int userId);
    Task<Policy?> GetByPolicyNumberAsync(string policyNumber);
    Task<bool> ExistsByPolicyNumberAsync(string policyNumber);
    Task<IEnumerable<Policy>> GetActivePoliciesAsync();
    Task<InsurancePlan?> GetPlanByPolicyIdAsync(int policyId);
}

public interface IClaimRepository : IGenericRepository<Claim>
{
    Task<IEnumerable<Claim>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Claim>> GetByPolicyIdAsync(int policyId);
    Task<IEnumerable<Claim>> GetByStatusAsync(ClaimStatus status);
    Task<IEnumerable<Claim>> GetByHospitalIdAsync(int hospitalId);
    Task<IEnumerable<Claim>> GetByHospitalAndStatusAsync(int hospitalId, ClaimStatus status);
    Task<Claim?> GetByClaimNumberAsync(string claimNumber);
}

public interface IInsurancePlanRepository : IGenericRepository<InsurancePlan>
{
    Task<IEnumerable<InsurancePlan>> GetActivePlansAsync();
    Task<IEnumerable<InsurancePlan>> GetByPlanTypeAsync(PlanType planType);
}

public interface IHospitalRepository : IGenericRepository<Hospital>
{
    Task<IEnumerable<Hospital>> GetNetworkProvidersAsync();
}

public interface IPaymentRepository : IGenericRepository<Payment>
{
    Task<IEnumerable<Payment>> GetByPolicyIdAsync(int policyId);
    Task<IEnumerable<Payment>> GetByPaymentTypeAsync(PaymentType paymentType);
    Task<bool> ExistsByReferenceAsync(string paymentReference);
}

public interface INotificationHistoryRepository : IGenericRepository<NotificationHistory>
{
    Task<IEnumerable<NotificationHistory>> GetByPolicyIdAsync(int policyId);
    Task<IEnumerable<NotificationHistory>> GetByClaimIdAsync(int claimId);
}
