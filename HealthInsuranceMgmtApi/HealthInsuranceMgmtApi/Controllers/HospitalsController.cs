using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HospitalsController : ControllerBase
{
    private readonly IHospitalService _hospitalService;

    public HospitalsController(IHospitalService hospitalService)
    {
        _hospitalService = hospitalService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HospitalDto>>> GetAllHospitals()
    {
        var hospitals = await _hospitalService.GetAllHospitalsAsync();
        return Ok(hospitals);
    }

    [HttpGet("network-providers")]
    public async Task<ActionResult<IEnumerable<HospitalDto>>> GetNetworkProviders()
    {
        var hospitals = await _hospitalService.GetNetworkProvidersAsync();
        return Ok(hospitals);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HospitalDto>> GetHospital(int id)
    {
        var hospital = await _hospitalService.GetHospitalByIdAsync(id);
        if (hospital == null)
            return NotFound();

        return Ok(hospital);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<HospitalDto>> CreateHospital([FromBody] CreateHospitalDto createHospitalDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var hospital = await _hospitalService.CreateHospitalAsync(createHospitalDto);
        return CreatedAtAction(nameof(GetHospital), new { id = hospital.HospitalId }, hospital);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<HospitalDto>> UpdateHospital(int id, [FromBody] UpdateHospitalDto updateHospitalDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var hospital = await _hospitalService.UpdateHospitalAsync(id, updateHospitalDto);
        return Ok(hospital);
    }
}
