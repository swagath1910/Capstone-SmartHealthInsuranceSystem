using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsuranceMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPolicyRenewalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoRenew",
                table: "Policies",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "RenewedOn",
                table: "Policies",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoRenew",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "RenewedOn",
                table: "Policies");
        }
    }
}
