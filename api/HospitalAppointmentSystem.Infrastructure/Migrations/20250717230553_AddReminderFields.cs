using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalAppointmentSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Reminder24HourSent",
                table: "Appointments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Reminder2HourSent",
                table: "Appointments",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reminder24HourSent",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "Reminder2HourSent",
                table: "Appointments");
        }
    }
}
