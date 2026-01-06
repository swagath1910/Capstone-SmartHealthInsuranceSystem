using AutoMapper;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.DTOs;

namespace HealthInsuranceMgmtApi.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<User, UserListDto>()
            .ForMember(dest => dest.HospitalName, opt => opt.MapFrom(src => src.Hospital != null ? src.Hospital.HospitalName : null));
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(src => true));
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.SecurityStamp, opt => opt.Ignore())
            .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
            .ForMember(dest => dest.Hospital, opt => opt.Ignore())
            .ForMember(dest => dest.Policies, opt => opt.Ignore())
            .ForMember(dest => dest.Claims, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserName, opt => opt.Ignore())
            .ForMember(dest => dest.NormalizedUserName, opt => opt.Ignore())
            .ForMember(dest => dest.NormalizedEmail, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.SecurityStamp, opt => opt.Ignore())
            .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Policy mappings
        CreateMap<Policy, PolicyDto>()
            .ForMember(dest => dest.UserName, opt => opt.Ignore())
            .ForMember(dest => dest.PlanName, opt => opt.Ignore());
        CreateMap<CreatePolicyDto, Policy>()
            .ForMember(dest => dest.PolicyNumber, opt => opt.Ignore())
            .ForMember(dest => dest.EndDate, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => PolicyStatus.Active))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Claim mappings
        CreateMap<Claim, ClaimDto>()
            .ForMember(dest => dest.UserName, opt => opt.Ignore())
            .ForMember(dest => dest.PolicyNumber, opt => opt.Ignore())
            .ForMember(dest => dest.HospitalName, opt => opt.Ignore());
        CreateMap<CreateClaimDto, Claim>()
            .ForMember(dest => dest.ClaimNumber, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ClaimStatus.Submitted))
            .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Insurance Plan mappings
        CreateMap<InsurancePlan, InsurancePlanDto>();
        CreateMap<CreateInsurancePlanDto, InsurancePlan>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Hospital mappings
        CreateMap<Hospital, HospitalDto>();
        CreateMap<CreateHospitalDto, Hospital>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        CreateMap<UpdateHospitalDto, Hospital>();

        // Payment mappings
        CreateMap<Payment, PaymentDto>();
        CreateMap<CreatePaymentDto, Payment>()
            .ForMember(dest => dest.PaymentReference, opt => opt.Ignore())
            .ForMember(dest => dest.PaymentDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => PaymentStatus.Completed));
        CreateMap<ProcessPaymentDto, Payment>()
            .ForMember(dest => dest.PaymentReference, opt => opt.Ignore())
            .ForMember(dest => dest.PaymentDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => PaymentStatus.Completed));
    }
}