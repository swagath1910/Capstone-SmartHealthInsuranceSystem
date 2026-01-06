using HealthInsuranceMgmtApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HealthInsuranceMgmtApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(HealthInsuranceDbContext context, UserManager<User> userManager)
    {
        // Always tries to seed 
        Console.WriteLine("DbSeeder: Starting seeding process...");
        
        // Seeds Users using UserManager
        var users = new List<User>();
        
        var adminUser = new User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@healthinsurance.com",
            UserName = "admin@healthinsurance.com",
            PhoneNumber = "1234567890",
            Address = "123 Admin St, Admin City",
            DateOfBirth = new DateTime(1980, 1, 1),
            Role = UserRole.Admin,
            EmailConfirmed = true
        };
        var result = await userManager.CreateAsync(adminUser, "Admin123!");
        Console.WriteLine($"Admin user creation result: {result.Succeeded}");
        if (!result.Succeeded)
        {
            Console.WriteLine($"Admin user creation errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
        users.Add(adminUser);

        var agentUser = new User
        {
            FirstName = "John",
            LastName = "Agent",
            Email = "agent@healthinsurance.com",
            UserName = "agent@healthinsurance.com",
            PhoneNumber = "1234567891",
            Address = "456 Agent Ave, Agent City",
            DateOfBirth = new DateTime(1985, 5, 15),
            Role = UserRole.InsuranceAgent,
            EmailConfirmed = true
        };
        await userManager.CreateAsync(agentUser, "Agent123!");
        users.Add(agentUser);

        var claimsUser = new User
        {
            FirstName = "Sarah",
            LastName = "Officer",
            Email = "claims@healthinsurance.com",
            UserName = "claims@healthinsurance.com",
            PhoneNumber = "1234567892",
            Address = "789 Claims Blvd, Claims City",
            DateOfBirth = new DateTime(1990, 8, 20),
            Role = UserRole.ClaimsOfficer,
            EmailConfirmed = true
        };
        await userManager.CreateAsync(claimsUser, "Claims123!");
        users.Add(claimsUser);

        var hospitalUser = new User
        {
            FirstName = "City",
            LastName = "Hospital",
            Email = "contact@cityhospital.com",
            UserName = "contact@cityhospital.com",
            PhoneNumber = "1234567893",
            Address = "321 Hospital Rd, Medical City",
            DateOfBirth = new DateTime(1975, 3, 10),
            Role = UserRole.HospitalStaff,
            EmailConfirmed = true,
            HospitalId = 1 // Will be set after hospital is created
        };
        await userManager.CreateAsync(hospitalUser, "Hospital123!");
        users.Add(hospitalUser);

        var policyHolderUser = new User
        {
            FirstName = "Alice",
            LastName = "Johnson",
            Email = "alice@email.com",
            UserName = "alice@email.com",
            PhoneNumber = "1234567894",
            Address = "654 Customer St, Customer City",
            DateOfBirth = new DateTime(1992, 12, 5),
            Role = UserRole.PolicyHolder,
            EmailConfirmed = true
        };
        await userManager.CreateAsync(policyHolderUser, "User123!");
        users.Add(policyHolderUser);

        // Seed Insurance Plans
        var plans = new List<InsurancePlan>
        {
            new InsurancePlan
            {
                PlanName = "Basic Individual Plan",
                Description = "Basic coverage for individuals",
                PremiumAmount = 500.00m,
                CoverageLimit = 50000.00m,
                DurationInMonths = 12,
                DeductiblePercentage = 10.00m,
                PlanType = PlanType.Individual
            },
            new InsurancePlan
            {
                PlanName = "Premium Family Plan",
                Description = "Comprehensive coverage for families",
                PremiumAmount = 1200.00m,
                CoverageLimit = 150000.00m,
                DurationInMonths = 12,
                DeductiblePercentage = 5.00m,
                PlanType = PlanType.Family
            },
            new InsurancePlan
            {
                PlanName = "Corporate Health Plan",
                Description = "Group coverage for corporate employees",
                PremiumAmount = 800.00m,
                CoverageLimit = 100000.00m,
                DurationInMonths = 12,
                DeductiblePercentage = 7.50m,
                PlanType = PlanType.Corporate
            }
        };

        await context.InsurancePlans.AddRangeAsync(plans);
        await context.SaveChangesAsync();

        // Seed Hospitals
        var hospitals = new List<Hospital>
        {
            new Hospital
            {
                HospitalName = "City General Hospital",
                Address = "123 Medical Center Dr",
                PhoneNumber = "555-0101",
                Email = "contact@cityhospital.com", 
                City = "Metro City",
                State = "State1",
                ZipCode = "12345",
                IsNetworkProvider = true
            },
            new Hospital
            {
                HospitalName = "Metro Medical Center",
                Address = "456 Health Plaza",
                PhoneNumber = "555-0102",
                Email = "contact@metromedical.com",
                City = "Metro City",
                State = "State1",
                ZipCode = "12346",
                IsNetworkProvider = true
            }
        };

        await context.Hospitals.AddRangeAsync(hospitals);
        await context.SaveChangesAsync();

        // Seed Policies
        var policies = new List<Policy>
        {
            new Policy
            {
                PolicyNumber = "POL-2024-001",
                UserId = users[4].Id, // Alice Johnson
                PlanId = plans[0].PlanId, // Basic Individual Plan
                StartDate = DateTime.UtcNow.AddMonths(-6),
                EndDate = DateTime.UtcNow.AddMonths(6),
                PremiumPaid = 500.00m,
                Status = PolicyStatus.Active
            }
        };

        await context.Policies.AddRangeAsync(policies);
        await context.SaveChangesAsync();

        // Seed Claims
        var claims = new List<Claim>
        {
            new Claim
            {
                ClaimNumber = "CLM-2024-001",
                PolicyId = policies[0].PolicyId,
                UserId = users[4].Id, // Alice Johnson
                HospitalId = hospitals[0].HospitalId,
                ClaimAmount = 2500.00m,
                TreatmentDate = DateTime.UtcNow.AddDays(-30),
                MedicalNotes = "Emergency room visit for chest pain",
                Notes = "Patient presented with acute chest pain",
                Status = ClaimStatus.Submitted
            }
        };

        await context.Claims.AddRangeAsync(claims);
        await context.SaveChangesAsync();
    }
}
