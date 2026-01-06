using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;
using HealthInsuranceMgmtApi.Services.Interfaces;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IPaymentRepository _paymentRepository;

    public PaymentsController(IPaymentService paymentService, IPaymentRepository paymentRepository)
    {
        _paymentService = paymentService;
        _paymentRepository = paymentRepository;
    }

    [HttpGet("my-payments")]
    [Authorize(Roles = "PolicyHolder")]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetMyPayments()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
        var payments = await _paymentService.GetPaymentsByUserIdAsync(userId);
        return Ok(payments);
    }

    [HttpPost("premium")]
    [Authorize(Roles = "PolicyHolder")]
    public async Task<ActionResult<PaymentDto>> ProcessPremiumPayment([FromBody] ProcessPaymentDto processPaymentDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found in token"));
            var payment = await _paymentService.ProcessPremiumPaymentAsync(userId, processPaymentDto);
            
            return CreatedAtAction("GetMyPayments", payment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] CreatePaymentDto createPaymentDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var payment = await _paymentService.CreatePaymentAsync(createPaymentDto);
        return CreatedAtAction("GetMyPayments", payment);
    }


}
