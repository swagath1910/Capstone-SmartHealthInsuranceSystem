using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsuranceMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTreatmentTableFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Claims_Treatments_TreatmentId",
                table: "Claims");

            migrationBuilder.DropTable(
                name: "Treatments");

            migrationBuilder.DropIndex(
                name: "IX_Claims_TreatmentId",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "TreatmentDetails",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "TreatmentId",
                table: "Claims");

            migrationBuilder.AlterColumn<DateTime>(
                name: "TreatmentDate",
                table: "Claims",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<string>(
                name: "MedicalNotes",
                table: "Claims",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "MedicalNotesAddedAt",
                table: "Claims",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MedicalNotesAddedBy",
                table: "Claims",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Claims_MedicalNotesAddedBy",
                table: "Claims",
                column: "MedicalNotesAddedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_AspNetUsers_MedicalNotesAddedBy",
                table: "Claims",
                column: "MedicalNotesAddedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Claims_AspNetUsers_MedicalNotesAddedBy",
                table: "Claims");

            migrationBuilder.DropIndex(
                name: "IX_Claims_MedicalNotesAddedBy",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "MedicalNotes",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "MedicalNotesAddedAt",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "MedicalNotesAddedBy",
                table: "Claims");

            migrationBuilder.AlterColumn<DateTime>(
                name: "TreatmentDate",
                table: "Claims",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TreatmentDetails",
                table: "Claims",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TreatmentId",
                table: "Claims",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Treatments",
                columns: table => new
                {
                    TreatmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HospitalId = table.Column<int>(type: "int", nullable: false),
                    PatientUserId = table.Column<int>(type: "int", nullable: false),
                    RelatedClaimId = table.Column<int>(type: "int", nullable: true),
                    ClaimDeadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Diagnosis = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    HasAssociatedClaim = table.Column<bool>(type: "bit", nullable: false),
                    IsClaimEligible = table.Column<bool>(type: "bit", nullable: false),
                    Prescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TreatmentCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TreatmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TreatmentDetails = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Treatments", x => x.TreatmentId);
                    table.ForeignKey(
                        name: "FK_Treatments_AspNetUsers_PatientUserId",
                        column: x => x.PatientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Treatments_Claims_RelatedClaimId",
                        column: x => x.RelatedClaimId,
                        principalTable: "Claims",
                        principalColumn: "ClaimId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Treatments_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "HospitalId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Claims_TreatmentId",
                table: "Claims",
                column: "TreatmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Treatments_HospitalId",
                table: "Treatments",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Treatments_PatientUserId",
                table: "Treatments",
                column: "PatientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Treatments_RelatedClaimId",
                table: "Treatments",
                column: "RelatedClaimId");

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_Treatments_TreatmentId",
                table: "Claims",
                column: "TreatmentId",
                principalTable: "Treatments",
                principalColumn: "TreatmentId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
