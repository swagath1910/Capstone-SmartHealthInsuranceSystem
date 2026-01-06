using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using HealthInsuranceMgmtApi.Data;

namespace HealthInsuranceTesting.Helpers;

public class TestConfigurationHelper
{
    public static IConfiguration GetTestConfiguration()
    {
        return new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.Test.json", optional: false)
            .AddEnvironmentVariables()
            .Build();
    }

    public static IConfiguration GetEnvironmentConfiguration(string environment)
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables();

        return builder.Build();
    }

    public static ServiceCollection GetTestServices()
    {
        var services = new ServiceCollection();
        var configuration = GetTestConfiguration();
        
        services.AddSingleton<IConfiguration>(configuration);
        
        // Use In-Memory database for testing
        services.AddDbContext<HealthInsuranceDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));
            
        return services;
    }

    public static void ValidateTestEnvironment()
    {
        var config = GetTestConfiguration();
        
        // Verify test database connection string
        var connectionString = Microsoft.Extensions.Configuration.ConfigurationExtensions.GetConnectionString(config, "DefaultConnection");
        Assert.Contains("HealthInsuranceTestDb", connectionString);
        
        // Verify test JWT settings
        var jwtIssuer = config["JwtSettings:Issuer"];
        Assert.Equal("HealthInsuranceTestAPI", jwtIssuer);
        
        var jwtExpiry = config["JwtSettings:ExpiryInHours"];
        Assert.Equal("1", jwtExpiry);
    }
}