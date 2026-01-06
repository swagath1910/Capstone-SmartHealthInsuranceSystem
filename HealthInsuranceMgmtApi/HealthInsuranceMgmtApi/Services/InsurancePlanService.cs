using AutoMapper;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Repositories.Interfaces;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceMgmtApi.Services;

public class InsurancePlanService : IInsurancePlanService
{
    private readonly IInsurancePlanRepository _planRepository;
    private readonly IMapper _mapper;

    public InsurancePlanService(IInsurancePlanRepository planRepository, IMapper mapper)
    {
        _planRepository = planRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<InsurancePlanDto>> GetAllPlansAsync()
    {
        var plans = await _planRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<InsurancePlanDto>>(plans);
    }

    public async Task<IEnumerable<InsurancePlanDto>> GetActivePlansAsync()
    {
        var plans = await _planRepository.GetActivePlansAsync();
        return _mapper.Map<IEnumerable<InsurancePlanDto>>(plans);
    }

    public async Task<InsurancePlanDto?> GetPlanByIdAsync(int planId)
    {
        var plan = await _planRepository.GetByIdAsync(planId);
        return plan != null ? _mapper.Map<InsurancePlanDto>(plan) : null;
    }

    public async Task<InsurancePlanDto> CreatePlanAsync(CreateInsurancePlanDto createPlanDto)
    {
        var plan = _mapper.Map<InsurancePlan>(createPlanDto);
        plan.CreatedAt = DateTime.UtcNow;

        await _planRepository.AddAsync(plan);
        return _mapper.Map<InsurancePlanDto>(plan);
    }

    public async Task<InsurancePlanDto> UpdatePlanAsync(int planId, CreateInsurancePlanDto updatePlanDto)
    {
        var plan = await _planRepository.GetByIdAsync(planId);
        if (plan == null)
            throw new ArgumentException("Insurance plan not found");

        _mapper.Map(updatePlanDto, plan);
        plan.UpdatedAt = DateTime.UtcNow;

        await _planRepository.UpdateAsync(plan);
        return _mapper.Map<InsurancePlanDto>(plan);
    }

    public async Task<bool> DeletePlanAsync(int planId)
    {
        var plan = await _planRepository.GetByIdAsync(planId);
        if (plan == null) return false;

        await _planRepository.DeleteAsync(plan);
        return true;
    }
}

public class HospitalService : IHospitalService
{
    private readonly IHospitalRepository _hospitalRepository;
    private readonly IMapper _mapper;

    public HospitalService(IHospitalRepository hospitalRepository, IMapper mapper)
    {
        _hospitalRepository = hospitalRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<HospitalDto>> GetAllHospitalsAsync()
    {
        var hospitals = await _hospitalRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<HospitalDto>>(hospitals);
    }

    public async Task<IEnumerable<HospitalDto>> GetNetworkProvidersAsync()
    {
        var hospitals = await _hospitalRepository.GetNetworkProvidersAsync();
        return _mapper.Map<IEnumerable<HospitalDto>>(hospitals);
    }

    public async Task<HospitalDto?> GetHospitalByIdAsync(int hospitalId)
    {
        var hospital = await _hospitalRepository.GetByIdAsync(hospitalId);
        return hospital != null ? _mapper.Map<HospitalDto>(hospital) : null;
    }

    public async Task<HospitalDto> CreateHospitalAsync(CreateHospitalDto createHospitalDto)
    {
        var hospital = _mapper.Map<Hospital>(createHospitalDto);
        hospital.CreatedAt = DateTime.UtcNow;

        await _hospitalRepository.AddAsync(hospital);
        return _mapper.Map<HospitalDto>(hospital);
    }

    public async Task<HospitalDto> UpdateHospitalAsync(int hospitalId, UpdateHospitalDto updateHospitalDto)
    {
        var hospital = await _hospitalRepository.GetByIdAsync(hospitalId);
        if (hospital == null)
            throw new ArgumentException("Hospital not found");

        _mapper.Map(updateHospitalDto, hospital);
        hospital.UpdatedAt = DateTime.UtcNow;

        await _hospitalRepository.UpdateAsync(hospital);
        return _mapper.Map<HospitalDto>(hospital);
    }

    public async Task<bool> DeleteHospitalAsync(int hospitalId)
    {
        var hospital = await _hospitalRepository.GetByIdAsync(hospitalId);
        if (hospital == null) return false;

        await _hospitalRepository.DeleteAsync(hospital);
        return true;
    }
}
