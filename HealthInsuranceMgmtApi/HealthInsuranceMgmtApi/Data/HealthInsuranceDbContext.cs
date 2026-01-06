using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.Data;

public class HealthInsuranceDbContext : IdentityDbContext<User, IdentityRole<int>, int>
{
    public HealthInsuranceDbContext(DbContextOptions<HealthInsuranceDbContext> options) : base(options)
    {
    }

    public DbSet<InsurancePlan> InsurancePlans { get; set; }
    public DbSet<Policy> Policies { get; set; }
    public DbSet<Hospital> Hospitals { get; set; }
    public DbSet<Claim> Claims { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<NotificationHistory> NotificationHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration 
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(500);

            entity.HasOne(e => e.Hospital)
                .WithMany()
                .HasForeignKey(e => e.HospitalId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // InsurancePlan Configuration
        modelBuilder.Entity<InsurancePlan>(entity =>
        {
            entity.HasKey(e => e.PlanId);
            entity.Property(e => e.PlanName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.PremiumAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CoverageLimit).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DeductiblePercentage).HasColumnType("decimal(5,2)");
        });

        // Policy Configuration
        modelBuilder.Entity<Policy>(entity =>
        {
            entity.HasKey(e => e.PolicyId);
            entity.HasIndex(e => e.PolicyNumber).IsUnique();
            entity.Property(e => e.PolicyNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PremiumPaid).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Policies)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.InsurancePlan)
                .WithMany(p => p.Policies)
                .HasForeignKey(e => e.PlanId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Hospital Configuration
        modelBuilder.Entity<Hospital>(entity =>
        {
            entity.HasKey(e => e.HospitalId);
            entity.Property(e => e.HospitalName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(15);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.State).HasMaxLength(100);
            entity.Property(e => e.ZipCode).HasMaxLength(10);
        });

        // Claim Configuration
        modelBuilder.Entity<Claim>(entity =>
        {
            entity.HasKey(e => e.ClaimId);
            entity.HasIndex(e => e.ClaimNumber).IsUnique();
            entity.Property(e => e.ClaimNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ClaimAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ApprovedAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MedicalNotes).HasMaxLength(2000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.RejectionReason).HasMaxLength(1000);

            entity.HasOne(e => e.Policy)
                .WithMany(p => p.Claims)
                .HasForeignKey(e => e.PolicyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Claims)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Hospital)
                .WithMany(h => h.Claims)
                .HasForeignKey(e => e.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Reviewer)
                .WithMany()
                .HasForeignKey(e => e.ReviewedBy)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Payment Configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId);
            entity.Property(e => e.PaymentReference).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.PaymentMethod).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasOne(e => e.Policy)
                .WithMany(p => p.Payments)
                .HasForeignKey(e => e.PolicyId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Claim)
                .WithMany()
                .HasForeignKey(e => e.ClaimId)
                .OnDelete(DeleteBehavior.SetNull);
        });


    }
}
