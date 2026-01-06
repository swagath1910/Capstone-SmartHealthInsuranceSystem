using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsuranceMgmtApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedByUserToPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Policies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Policies_CreatedByUserId",
                table: "Policies",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Policies_AspNetUsers_CreatedByUserId",
                table: "Policies",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Policies_AspNetUsers_CreatedByUserId",
                table: "Policies");

            migrationBuilder.DropIndex(
                name: "IX_Policies_CreatedByUserId",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Policies");
        }
    }
}
