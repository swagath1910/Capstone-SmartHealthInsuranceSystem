using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsuranceMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTreatmentRequirementToClaims : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ClaimDeadline",
                table: "Treatments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasAssociatedClaim",
                table: "Treatments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsClaimEligible",
                table: "Treatments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TreatmentId",
                table: "Claims",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Create dummy treatments for existing claims
            migrationBuilder.Sql(@"
                INSERT INTO Treatments (PatientUserId, HospitalId, TreatmentDate, TreatmentDetails, TreatmentCost, Status, IsClaimEligible, HasAssociatedClaim, CreatedAt)
                SELECT UserId, HospitalId, TreatmentDate, TreatmentDetails, ClaimAmount, 2, 1, 1, SubmittedAt
                FROM Claims WHERE TreatmentId = 0;
                
                UPDATE Claims 
                SET TreatmentId = (
                    SELECT TOP 1 TreatmentId 
                    FROM Treatments t 
                    WHERE t.PatientUserId = Claims.UserId 
                    AND t.HospitalId = Claims.HospitalId 
                    AND t.TreatmentDate = Claims.TreatmentDate
                    ORDER BY t.TreatmentId DESC
                )
                WHERE TreatmentId = 0;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_TreatmentId",
                table: "Claims",
                column: "TreatmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_Treatments_TreatmentId",
                table: "Claims",
                column: "TreatmentId",
                principalTable: "Treatments",
                principalColumn: "TreatmentId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Claims_Treatments_TreatmentId",
                table: "Claims");

            migrationBuilder.DropIndex(
                name: "IX_Claims_TreatmentId",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "ClaimDeadline",
                table: "Treatments");

            migrationBuilder.DropColumn(
                name: "HasAssociatedClaim",
                table: "Treatments");

            migrationBuilder.DropColumn(
                name: "IsClaimEligible",
                table: "Treatments");

            migrationBuilder.DropColumn(
                name: "TreatmentId",
                table: "Claims");
        }
    }
}
