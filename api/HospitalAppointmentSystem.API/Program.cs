using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Infrastructure;
using HospitalAppointmentSystem.Infrastructure.Data.SeedData;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using HospitalAppointmentSystem.API.Messaging;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HospitalAppointmentSystem.Core.Services;
using HospitalAppointmentSystem.API.Profiles;
using System.Text.Json.Serialization;
using HospitalAppointmentSystem.Infrastructure.Repositories;
using HospitalAppointmentSystem.Core.Profiles;
using HospitalAppointmentSystem.Core.Interfaces;
using HospitalAppointmentSystem.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

var connectionString = builder.Configuration.GetConnectionString("SqlConnection");
var liveConString = builder.Configuration.GetConnectionString("PgSqlConnection");
var mssqlConString = builder.Configuration.GetConnectionString("MssqlConnection");


builder.Services.AddAutoMapper(cfg => {
    cfg.AddProfile<AppointmentProfile>();
    cfg.AddProfile<PatientProfile>();
    cfg.AddProfile<DoctorProfile>();
    cfg.AddProfile<PrescriptionProfile>();
    });

// Environment-aware DbContext configuration
if (builder.Environment.IsDevelopment())
{
    // For development, use MsSQL
    builder.Services.AddDbContext<HospitalDbContext>(options => options.UseSqlServer(mssqlConString));

    // For development, use MySQL
    // builder.Services.AddDbContext<HospitalDbContext>(options =>
    //     options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
    // render psql dpg-cvjuaa95pdvs739vifb0-a
    // YourNewStrong@Passw0rd
}
else
{
    builder.Services.AddDbContext<HospitalDbContext>(options =>
        options.UseNpgsql(liveConString, npgsqlOptions =>
            npgsqlOptions.CommandTimeout(60))); // PostgreSQL for production (or change to SQL Server/MySQL)
}

builder.Services.AddIdentity<User, IdentityRole>(options => 
{
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
})
    .AddEntityFrameworkStores<HospitalDbContext>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => 
        policy.RequireRole("Admin"));
    options.AddPolicy("Doctor", policy => 
        policy.RequireRole("Doctor"));
    options.AddPolicy("Patient", policy => 
        policy.RequireRole("Patient"));
    options.AddPolicy("AdminorDoctor", policy => 
        policy.RequireRole("Admin", "Doctor"));
    
});

// Add CORS services (place this before AddControllers)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5174","http://localhost:5175","http://localhost:5176") // Your frontend URL
            // .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // If using cookies/auth
    });
});

builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<TokenService>();

// RabbitMQ services - with error handling
try
{
    builder.Services.AddSingleton<RabbitMqService>();
    builder.Services.AddScoped<AppointmentMessageHandler>();

    // Only add background services if RabbitMQ is available
    builder.Services.AddHostedService<MessageConsumerService>();
    builder.Services.AddHostedService<AppointmentReminderService>();
}
catch (Exception ex)
{
    // Log the error but don't stop the application
    var logger = builder.Services.BuildServiceProvider().GetService<ILogger<Program>>();
    logger?.LogWarning(ex, "RabbitMQ services could not be initialized. Messaging features will be disabled.");
}

builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

if (builder.Environment.IsProduction())
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
        options.ListenAnyIP(Int32.Parse(port));
    });
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Test email service on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var emailService = services.GetRequiredService<IEmailService>();
        var emailConnected = await emailService.TestConnectionAsync();
        logger.LogInformation($"Email service connection test: {(emailConnected ? "SUCCESS" : "FAILED")}");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Email service test failed during startup");
    }
}

// After building the app, database seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<HospitalDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        logger.LogInformation("Db PRovider" + context.Database.ProviderName);

        // Ensure database is created and migrated
        await context.Database.MigrateAsync();

        // Seed roles
        if (!await roleManager.RoleExistsAsync("Admin"))
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        if (!await roleManager.RoleExistsAsync("Doctor"))
            await roleManager.CreateAsync(new IdentityRole("Doctor"));
        if (!await roleManager.RoleExistsAsync("Patient"))
            await roleManager.CreateAsync(new IdentityRole("Patient"));

        // Seed admin user
        var adminEmail = "admin@hospital.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "Admin",
                LastName = "User",
                Gender = "male",
                PhoneNumber = "555-123-4567",
                DateOfBirth = new DateTime(1980, 1, 1),
            };
            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogError($"Failed to create admin user: {errors}");
            }
            else
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Seed other data
        await DataSeeder.SeedAsync(context, userManager, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend"); // Between UseRouting and UseEndpoints
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();