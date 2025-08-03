using Bogus;
using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalAppointmentSystem.Infrastructure.Data.SeedData
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(HospitalDbContext context, UserManager<User> userManager, ILogger logger = null)
        {
            // First check if we need to seed at all
            if (await context.Doctors.AnyAsync() && await context.Patients.AnyAsync())
            {
                logger?.LogInformation("Database already seeded. Skipping seed operation.");
                return;
            }

            logger?.LogInformation("Starting database seeding...");

            // Create doctors
            if (!await context.Doctors.AnyAsync())
            {
                logger?.LogInformation("Seeding doctors...");
                var doctorsList = new List<Doctor>();
                
                var userFaker = new Faker<User>()
                    .RuleFor(d => d.FirstName, f => f.Name.FirstName())
                    .RuleFor(d => d.LastName, f => f.Name.LastName())
                    .RuleFor(d => d.Email, (f, d) => f.Internet.Email(d.FirstName, d.LastName))
                    .RuleFor(d => d.UserName, (f, d) => d.Email) // Ensure UserName is set
                    .RuleFor(d => d.Gender, f => f.PickRandom(new[] { "male", "femaile" }))
                    .RuleFor(d => d.PhoneNumber, f => f.Phone.PhoneNumber())
                    .RuleFor(d => d.DateOfBirth, f => f.Date.Past(30, DateTime.Now.AddYears(-25)));

                // Generate doctor data
                for (int i = 0; i < 20; i++)
                {
                    var user = userFaker.Generate();
                    
                    // Create the user with Identity
                    var result = await userManager.CreateAsync(user, "Doctor123!");
                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        logger?.LogError($"Failed to create doctor user: {errors}");
                        continue;
                    }
                    
                    // Add to role
                    result = await userManager.AddToRoleAsync(user, "Doctor");
                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        logger?.LogError($"Failed to add doctor to role: {errors}");
                        continue;
                    }
                    
                    // Create doctor entity
                    var doctor = new Doctor
                    {
                        UserId = user.Id,
                        Specialization = new Faker().PickRandom(new[] { "Cardiology","Dermatology","Endocrinology","Gastroenterology","Neurology","Oncology","Orthopedics","Pediatrics","Psychiatry","Radiology","Surgery","Urology" }),
                        LicenseNumber = new Faker().Random.AlphaNumeric(10).ToUpper()
                    };
                    
                    doctorsList.Add(doctor);
                }
                
                // Add doctors to context
                await context.Doctors.AddRangeAsync(doctorsList);
                await context.SaveChangesAsync();
                logger?.LogInformation($"Successfully seeded {doctorsList.Count} doctors");
            }

            // Create patients
            if (!await context.Patients.AnyAsync())
            {
                logger?.LogInformation("Seeding patients...");
                var patientsList = new List<Patient>();
                
                var userFaker = new Faker<User>()
                    .RuleFor(p => p.FirstName, f => f.Name.FirstName())
                    .RuleFor(p => p.LastName, f => f.Name.LastName())
                    .RuleFor(p => p.Email, (f, p) => f.Internet.Email(p.FirstName, p.LastName))
                    .RuleFor(p => p.UserName, (f, p) => p.Email) // Ensure UserName is set
                    .RuleFor(d => d.Gender, f => f.PickRandom(new[] { "male", "femaile" }))
                    .RuleFor(p => p.PhoneNumber, f => f.Phone.PhoneNumber())
                    .RuleFor(p => p.DateOfBirth, f => f.Date.Past(60, DateTime.Now.AddYears(-18)));

                // Generate patient data
                for (int i = 0; i < 50; i++) // Reduced from 100 to 50 for faster seeding
                {
                    var user = userFaker.Generate();
                    
                    // Create the user with Identity
                    var result = await userManager.CreateAsync(user, "Patient123!");
                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        logger?.LogError($"Failed to create patient user: {errors}");
                        continue;
                    }
                    
                    // Add to role
                    result = await userManager.AddToRoleAsync(user, "Patient");
                    if (!result.Succeeded)
                    {
                        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                        logger?.LogError($"Failed to add patient to role: {errors}");
                        continue;
                    }
                    
                    // Create patient entity
                    var patient = new Patient
                    {
                        UserId = user.Id,
                        Address = new Faker().Address.FullAddress(),
                        InsuranceProvider = new Faker().PickRandom(new[] { "Aetna", "Blue Cross", "UnitedHealth", "Cigna", "Humana" }),
                        InsurancePolicyNumber = new Faker().Random.AlphaNumeric(10).ToUpper()
                    };
                    
                    patientsList.Add(patient);
                }
                
                // Add patients to context
                await context.Patients.AddRangeAsync(patientsList);
                await context.SaveChangesAsync();
                logger?.LogInformation($"Successfully seeded {patientsList.Count} patients");
            }

            // Create schedules
            if (!await context.Schedules.AnyAsync())
            {
                logger?.LogInformation("Seeding schedules...");
                var doctors = await context.Doctors.ToListAsync();
                var schedulesList = new List<Schedule>();
                
                foreach (var doctor in doctors)
                {
                    for (int i = 0; i < 5; i++) // 5 days per doctor
                    {
                        var schedule = new Schedule
                        {
                            DoctorId = doctor.Id,
                            DayOfWeek = (DayOfWeek)(i % 7),
                            StartTime = new TimeSpan(9, 0, 0),
                            EndTime = new TimeSpan(17, 0, 0),
                            IsAvailable = true
                        };
                        schedulesList.Add(schedule);
                    }
                }
                
                await context.Schedules.AddRangeAsync(schedulesList);
                await context.SaveChangesAsync();
                logger?.LogInformation($"Successfully seeded {schedulesList.Count} schedules");
            }

            // Create appointments
            if (!await context.Appointments.AnyAsync())
            {
                logger?.LogInformation("Seeding appointments...");
                var doctors = await context.Doctors.Include(d => d.User).ToListAsync();
                var patients = await context.Patients.Include(p => p.User).ToListAsync();
                
                if (doctors.Any() && patients.Any())
                {
                    var appointmentsList = new List<Appointment>();
                    var faker = new Faker();
                    
                    for (int i = 0; i < 40; i++)
                    {
                        var startTime = new TimeSpan(faker.Random.Int(9, 16), 0, 0);
                        var endTime = startTime.Add(new TimeSpan(1, 0, 0));
                        
                        var appointment = new Appointment
                        {
                            Patient = faker.PickRandom(patients),
                            Doctor = faker.PickRandom(doctors),
                            AppointmentDate = faker.Date.Future(1),
                            StartTime = startTime,
                            EndTime = endTime,
                            Notes = faker.Lorem.Sentence(),
                            Status = faker.PickRandom(new[] { 
                                NewStatus.Pending, 
                                NewStatus.Approved, 
                                NewStatus.Rejected,
                                NewStatus.Completed,
                                NewStatus.Cancelled
                            })
                        };
                        
                        appointmentsList.Add(appointment);
                    }
                    
                    await context.Appointments.AddRangeAsync(appointmentsList);
                    await context.SaveChangesAsync();
                    logger?.LogInformation($"Successfully seeded {appointmentsList.Count} appointments");
                }
                else
                {
                    logger?.LogWarning("Cannot seed appointments: No doctors or patients found");
                }
            }

            if (!await context.Prescriptions.AnyAsync())
            {
                logger?.LogInformation("Seeding prescriptions...");
                var doctors = await context.Doctors.ToListAsync();
                var patients = await context.Patients.ToListAsync();
                var appointments = await context.Appointments.ToListAsync();
                
                if (doctors.Any() && patients.Any())
                {
                    var prescriptionsList = new List<Prescription>();
                    var faker = new Faker();
                    var medications = new[] 
                    {
                        "Amoxicillin", "Ibuprofen", "Lisinopril", "Metformin", "Atorvastatin",
                        "Albuterol", "Omeprazole", "Losartan", "Simvastatin", "Gabapentin"
                    };

                    for (int i = 0; i < 50; i++)
                    {
                        var prescription = new Prescription
                        {
                            Doctor = faker.PickRandom(doctors),
                            Patient = faker.PickRandom(patients),
                            Medication = faker.PickRandom(medications),
                            Dosage = $"{faker.Random.Int(1, 500)}mg",
                            Instructions = faker.PickRandom(new[] 
                            {
                                "Take once daily with food",
                                "Take twice daily with water",
                                "Apply to affected area twice daily",
                                "Take as needed for pain",
                                "Take every 8 hours"
                            }),
                            PrescribedDate = faker.Date.Recent(30),
                            Duration = TimeSpan.FromDays(faker.Random.Int(7, 30))
                        };
                        
                        prescriptionsList.Add(prescription);
                    }
                    
                    await context.Prescriptions.AddRangeAsync(prescriptionsList);
                    await context.SaveChangesAsync();
                    logger?.LogInformation($"Successfully seeded {prescriptionsList.Count} prescriptions");
                }
                else
                {
                    logger?.LogWarning("Cannot seed prescriptions: No doctors or patients found");
                }
            }

            logger?.LogInformation("Database seeding completed successfully");
        }
    }
}
