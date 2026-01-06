using HealthInsuranceMgmtApi.DTOs;
using HealthInsuranceMgmtApi.Models;

namespace HealthInsuranceMgmtApi.Services.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync();
    Task<IEnumerable<PaymentDto>> GetPaymentsByUserIdAsync(int userId);
    Task<IEnumerable<PaymentDto>> GetPaymentsByPolicyIdAsync(int policyId);
    Task<IEnumerable<PaymentDto>> GetPaymentsByTypeAsync(PaymentType paymentType);
    Task<PaymentDto?> GetPaymentByIdAsync(int paymentId);
    Task<PaymentDto> ProcessPremiumPaymentAsync(int userId, ProcessPaymentDto processPaymentDto);
    Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto);
}
