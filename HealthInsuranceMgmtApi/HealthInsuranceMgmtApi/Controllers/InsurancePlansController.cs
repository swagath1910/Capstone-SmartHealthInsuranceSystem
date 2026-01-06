using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Services.Interfaces;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InsurancePlansController : ControllerBase
{
    private readonly IInsurancePlanService _planService;

    public InsurancePlansController(IInsurancePlanService planService)
    {
        _planService = planService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InsurancePlanDto>>> GetAllPlans()
    {
        var plans = await _planService.GetAllPlansAsync();
        return Ok(plans ?? Enumerable.Empty<InsurancePlanDto>());
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<InsurancePlanDto>>> GetActivePlans()
    {
        var plans = await _planService.GetActivePlansAsync();
        return Ok(plans ?? Enumerable.Empty<InsurancePlanDto>());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InsurancePlanDto>> GetPlan(int id)
    {
        var plan = await _planService.GetPlanByIdAsync(id);
        if (plan == null)
            return NotFound();

        return Ok(plan);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InsurancePlanDto>> CreatePlan([FromBody] CreateInsurancePlanDto createPlanDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var plan = await _planService.CreatePlanAsync(createPlanDto);
        return CreatedAtAction(nameof(GetPlan), new { id = plan.PlanId }, plan);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<InsurancePlanDto>> UpdatePlan(int id, [FromBody] CreateInsurancePlanDto updatePlanDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var plan = await _planService.UpdatePlanAsync(id, updatePlanDto);
        return Ok(plan);
    }

    [HttpDelete("{id}")]
    [Consumes("application/json")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeletePlan(int id)
    {
        var result = await _planService.DeletePlanAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
