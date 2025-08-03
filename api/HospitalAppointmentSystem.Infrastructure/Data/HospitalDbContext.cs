using HospitalAppointmentSystem.Core;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace HospitalAppointmentSystem.Infrastructure
{
    public class HospitalDbContext : IdentityDbContext<User>
    {
        public HospitalDbContext(DbContextOptions<HospitalDbContext> options) 
            : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Provider-specific configurations
            ConfigureForDatabaseProvider(modelBuilder);

            // Configure entity relationships
            ConfigureUserRelationships(modelBuilder);
            ConfigureAppointmentRelationships(modelBuilder);
            ConfigureScheduleRelationships(modelBuilder);
            ConfigurePrescriptionRelationships(modelBuilder);
        }

        private void ConfigureForDatabaseProvider(ModelBuilder modelBuilder)
        {
            if (Database.ProviderName.Contains("MySql"))
            {
                foreach (var entityType in modelBuilder.Model.GetEntityTypes())
                {
                    foreach (var property in entityType.GetProperties())
                    {
                        if (property.ClrType == typeof(string))
                        {
                            property.SetColumnType("varchar(256)");
                        }
                        else if (property.ClrType == typeof(decimal))
                        {
                            property.SetColumnType("decimal(18,2)");
                        }
                        else if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                        {
                            property.SetColumnType("datetime(6)");
                        }
                    }
                }
            }
            else if (Database.ProviderName.Contains("SqlServer"))
            {
                foreach (var entityType in modelBuilder.Model.GetEntityTypes())
                {
                    foreach (var property in entityType.GetProperties())
                    {
                        if (property.ClrType == typeof(string))
                        {
                            property.SetColumnType("nvarchar(256)");
                        }
                        else if (property.ClrType == typeof(decimal))
                        {
                            property.SetColumnType("decimal(18,2)");
                        }
                        else if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                        {
                            property.SetColumnType("datetime2"); // Use datetime2 instead of datetime(6)
                        }
                    }
                }
            }
            else if (Database.ProviderName.Contains("Npgsql"))
            {
                foreach (var entityType in modelBuilder.Model.GetEntityTypes())
                {
                    foreach (var property in entityType.GetProperties())
                    {
                        if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                        {
                            property.SetColumnType("timestamp with time zone");
                            property.SetValueConverter(
                                new ValueConverter<DateTime, DateTime>(
                                    v => v.Kind == DateTimeKind.Unspecified
                                        ? DateTime.SpecifyKind(v, DateTimeKind.Utc)
                                        : v.ToUniversalTime(),
                                    v => v
                                ));
                        }
                    }
                }
            }
        }

        private void ConfigureUserRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Patient>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigureAppointmentRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private void ConfigureScheduleRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Schedule>()
                .HasOne(s => s.Doctor)
                .WithMany(d => d.Schedules)
                .HasForeignKey(s => s.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private void ConfigurePrescriptionRelationships(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.HasKey(p => p.Id);

                // Doctor relationship (no inverse navigation in Doctor)
                entity.HasOne(p => p.Doctor)
                    .WithMany()
                    .HasForeignKey(p => p.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Patient relationship (no inverse navigation in Patient)
                entity.HasOne(p => p.Patient)
                    .WithMany()
                    .HasForeignKey(p => p.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Property configurations
                entity.Property(p => p.Medication)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(p => p.Dosage)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.Instructions)
                    .HasMaxLength(500);

                // Universal default timestamp handling
                entity.Property(p => p.PrescribedDate)
                    .HasDefaultValueSql(GetDefaultTimestampSql());

                // Duration configuration
                entity.Property(p => p.Duration)
                    .IsRequired()
                    .HasConversion(
                        v => v.Ticks,
                        v => TimeSpan.FromTicks(v));
            });
        }

        private string GetDefaultTimestampSql()
        {
            return Database.ProviderName switch
            {
                string p when p.Contains("MySql", StringComparison.OrdinalIgnoreCase) => "CURRENT_TIMESTAMP",
                string p when p.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) => "CURRENT_TIMESTAMP",
                string p when p.Contains("SqlServer", StringComparison.OrdinalIgnoreCase) => "GETDATE()",
                string p when p.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) => "DATETIME('now')",
                _ => throw new NotSupportedException($"Unsupported provider: {Database.ProviderName}")
            };
        }
    }
}