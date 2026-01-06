using Microsoft.EntityFrameworkCore;
using HealthInsuranceMgmtApi.Data;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(HealthInsuranceDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role)
    {
        return await _dbSet.Where(u => u.Role == role && u.IsActive).ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role)
    {
        return await _dbSet.Where(u => u.Role == role && u.IsActive).ToListAsync();
    }

    public async Task<IEnumerable<User>> GetHospitalStaffAsync(int hospitalId)
    {
        return await _dbSet.Where(u => u.Role == UserRole.HospitalStaff && u.HospitalId == hospitalId && u.IsActive).ToListAsync();
    }
}

public class PolicyRepository : GenericRepository<Policy>, IPolicyRepository
{
    public PolicyRepository(HealthInsuranceDbContext context) : base(context) { }

    public override async Task<Policy?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(p => p.InsurancePlan)
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.PolicyId == id);
    }

    public async Task<IEnumerable<Policy>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(p => p.InsurancePlan)
            .Include(p => p.User)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Policy?> GetByPolicyNumberAsync(string policyNumber)
    {
        return await _dbSet
            .Include(p => p.InsurancePlan)
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.PolicyNumber == policyNumber);
    }

    public async Task<bool> ExistsByPolicyNumberAsync(string policyNumber)
    {
        return await _dbSet.AnyAsync(p => p.PolicyNumber == policyNumber);
    }

    public async Task<IEnumerable<Policy>> GetActivePoliciesAsync()
    {
        return await _dbSet
            .Include(p => p.InsurancePlan)
            .Include(p => p.User)
            .Where(p => p.Status == PolicyStatus.Active && p.EndDate > DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task<InsurancePlan?> GetPlanByPolicyIdAsync(int policyId)
    {
        var policy = await _dbSet
            .Include(p => p.InsurancePlan)
            .FirstOrDefaultAsync(p => p.PolicyId == policyId);
        return policy?.InsurancePlan;
    }
}

public class ClaimRepository : GenericRepository<Claim>, IClaimRepository
{
    public ClaimRepository(HealthInsuranceDbContext context) : base(context) { }

    public override async Task<IEnumerable<Claim>> GetAllAsync()
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.User)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .OrderByDescending(c => c.SubmittedAt)
            .ToListAsync();
    }

    public override async Task<Claim?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.User)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .FirstOrDefaultAsync(c => c.ClaimId == id);
    }

    public async Task<IEnumerable<Claim>> GetByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Claim>> GetByPolicyIdAsync(int policyId)
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .Where(c => c.PolicyId == policyId)
            .OrderByDescending(c => c.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Claim>> GetByStatusAsync(ClaimStatus status)
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.User)
            .Include(c => c.Hospital)
            .Where(c => c.Status == status)
            .OrderBy(c => c.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Claim>> GetByHospitalIdAsync(int hospitalId)
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.User)
            .Where(c => c.HospitalId == hospitalId)
            .OrderByDescending(c => c.SubmittedAt)
            .ToListAsync();
    }

    public async Task<Claim?> GetByClaimNumberAsync(string claimNumber)
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.User)
            .Include(c => c.Hospital)
            .Include(c => c.Reviewer)
            .FirstOrDefaultAsync(c => c.ClaimNumber == claimNumber);
    }

    public async Task<IEnumerable<Claim>> GetByHospitalAndStatusAsync(int hospitalId, ClaimStatus status)
    {
        return await _dbSet
            .Include(c => c.Policy)
            .Include(c => c.User)
            .Include(c => c.Hospital)
            .Where(c => c.HospitalId == hospitalId && c.Status == status)
            .OrderBy(c => c.SubmittedAt)
            .ToListAsync();
    }
}

public class InsurancePlanRepository : GenericRepository<InsurancePlan>, IInsurancePlanRepository
{
    public InsurancePlanRepository(HealthInsuranceDbContext context) : base(context) { }

    public async Task<IEnumerable<InsurancePlan>> GetActivePlansAsync()
    {
        return await _dbSet
            .Where(p => p.IsActive)
            .OrderBy(p => p.PlanName)
            .ToListAsync();
    }

    public async Task<IEnumerable<InsurancePlan>> GetByPlanTypeAsync(PlanType planType)
    {
        return await _dbSet
            .Where(p => p.PlanType == planType && p.IsActive)
            .OrderBy(p => p.PremiumAmount)
            .ToListAsync();
    }
}

public class HospitalRepository : GenericRepository<Hospital>, IHospitalRepository
{
    public HospitalRepository(HealthInsuranceDbContext context) : base(context) { }

    public async Task<IEnumerable<Hospital>> GetNetworkProvidersAsync()
    {
        return await _dbSet
            .Where(h => h.IsNetworkProvider)
            .OrderBy(h => h.HospitalName)
            .ToListAsync();
    }
}

public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
{
    public PaymentRepository(HealthInsuranceDbContext context) : base(context) { }

    public async Task<IEnumerable<Payment>> GetByPolicyIdAsync(int policyId)
    {
        return await _dbSet
            .Include(p => p.Policy)
            .Where(p => p.PolicyId == policyId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Payment>> GetByPaymentTypeAsync(PaymentType paymentType)
    {
        return await _dbSet
            .Include(p => p.Policy)
            .Include(p => p.Claim)
            .Where(p => p.PaymentType == paymentType)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
    }

    public async Task<bool> ExistsByReferenceAsync(string paymentReference)
    {
        return await _dbSet.AnyAsync(p => p.PaymentReference == paymentReference);
    }
}

public class NotificationHistoryRepository : GenericRepository<NotificationHistory>, INotificationHistoryRepository
{
    public NotificationHistoryRepository(HealthInsuranceDbContext context) : base(context) { }

    public async Task<IEnumerable<NotificationHistory>> GetByPolicyIdAsync(int policyId)
    {
        return await _dbSet
            .Where(n => n.PolicyId == policyId)
            .ToListAsync();
    }

    public async Task<IEnumerable<NotificationHistory>> GetByClaimIdAsync(int claimId)
    {
        return await _dbSet
            .Where(n => n.ClaimId == claimId)
            .ToListAsync();
    }
}
