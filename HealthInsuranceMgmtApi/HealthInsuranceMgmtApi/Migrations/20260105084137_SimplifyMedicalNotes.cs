using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsuranceMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyMedicalNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Claims_AspNetUsers_MedicalNotesAddedBy",
                table: "Claims");

            migrationBuilder.DropIndex(
                name: "IX_Claims_MedicalNotesAddedBy",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "MedicalNotesAddedAt",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "MedicalNotesAddedBy",
                table: "Claims");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
