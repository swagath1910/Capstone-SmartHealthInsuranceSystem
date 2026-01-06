using Microsoft.Extensions.Configuration;

namespace HealthInsuranceTesting;

public class EnvironmentConfigurationTests
{
    [Theory]
    [InlineData("Development")]
    [InlineData("Production")]
    public void Configuration_LoadsForEnvironment(string environment)
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = $"Server=test;Database=HealthInsurance{environment}Db;",
                ["JwtSettings:SecretKey"] = "TestSecretKeyThatIsAtLeast32CharactersLong",
                ["JwtSettings:Issuer"] = $"HealthInsurance{environment}API",
                ["JwtSettings:Audience"] = $"HealthInsurance{environment}Client"
            })
            .Build();

        // Act & Assert
        Assert.NotNull(config);
        var connectionString = config.GetConnectionString("DefaultConnection");
        Assert.Contains($"HealthInsurance{environment}Db", connectionString);
    }

    [Fact]
    public void JwtConfiguration_ValidatesCorrectly()
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "TestSecretKeyThatIsAtLeast32CharactersLong",
                ["JwtSettings:Issuer"] = "HealthInsuranceAPI",
                ["JwtSettings:Audience"] = "HealthInsuranceClient",
                ["JwtSettings:ExpiryInHours"] = "24"
            })
            .Build();

        // Act & Assert
        var secretKey = config["JwtSettings:SecretKey"];
        var issuer = config["JwtSettings:Issuer"];
        var audience = config["JwtSettings:Audience"];
        var expiry = config["JwtSettings:ExpiryInHours"];
        
        Assert.NotNull(secretKey);
        Assert.True(secretKey.Length >= 32, "JWT Secret key must be at least 32 characters");
        Assert.Equal("HealthInsuranceAPI", issuer);
        Assert.Equal("HealthInsuranceClient", audience);
        Assert.Equal("24", expiry);
    }

    [Fact]
    public void DatabaseConfiguration_ValidatesConnectionString()
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=(localdb)\\mssqllocaldb;Database=HealthInsuranceDb;Trusted_Connection=true;"
            })
            .Build();

        // Act
        var connectionString = config.GetConnectionString("DefaultConnection");
        
        // Assert
        Assert.NotNull(connectionString);
        Assert.Contains("HealthInsuranceDb", connectionString);
        Assert.Contains("Trusted_Connection=true", connectionString);
    }

    [Theory]
    [InlineData("Information", "Warning")]
    [InlineData("Debug", "Error")]
    public void LoggingConfiguration_ValidatesLogLevels(string defaultLevel, string aspNetLevel)
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Logging:LogLevel:Default"] = defaultLevel,
                ["Logging:LogLevel:Microsoft.AspNetCore"] = aspNetLevel
            })
            .Build();

        // Act
        var defaultLogLevel = config["Logging:LogLevel:Default"];
        var aspNetCoreLogLevel = config["Logging:LogLevel:Microsoft.AspNetCore"];
        
        // Assert
        Assert.Equal(defaultLevel, defaultLogLevel);
        Assert.Equal(aspNetLevel, aspNetCoreLogLevel);
    }
}