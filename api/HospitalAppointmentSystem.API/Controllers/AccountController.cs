using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mail;
using System.Net;
using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Infrastructure;
using HospitalAppointmentSystem.Core.Models;
using HospitalAppointmentSystem.Core.Services;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;


namespace HospitalAppointmentSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly HospitalDbContext _context;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ILogger<AccountController> _logger;
        private readonly HospitalAppointmentSystem.Core.Services.TokenService _tokenService;

        public AccountController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration,
            IEmailService emailService,
            HospitalDbContext context,
            ILogger<AccountController> logger,
            TokenService tokenService
        )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _context = context;
            _logger = logger;
            _tokenService = tokenService;
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUser()
        {
            _logger.LogInformation($"User claim: {User?.Identity?.Name}");
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogWarning("User not found for claims principal");
                return Unauthorized(new { message = "User not found" });
            }
            var roles = await _userManager.GetRolesAsync(user);
            // if(roles.Contains("Doctor")){
            //     await _userManager.RemoveFromRolesAsync(user, new List<string> { "Doctor", "Admin" });
            // }
            var data = new {
                roles = roles,
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                isEmailConfirmed = user.EmailConfirmed,
                isPhoneNumberConfirmed = user.PhoneNumberConfirmed,
                isTwoFactorEnabled = user.TwoFactorEnabled,
                username = user.UserName,
                gender = user.Gender,
                dateOfBirth = user.DateOfBirth,
                refId = null as string
            };

            try
            {
                if(roles.Contains("Doctor"))
                {
                    var doctor = await _context.Doctors.FirstOrDefaultAsync(
                        d => d.UserId == user.Id
                    );
                    if(doctor != null) data = data with { refId = doctor.Id.ToString()};
                }
                else if(roles.Contains("Patient"))
                {
                    var patient = await _context.Patients.FirstOrDefaultAsync(
                        p => p.UserId == user.Id
                    );
                    if(patient != null) data = data with { refId = patient.Id.ToString()};
                }
                return Ok(data);
            } catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetchin Ref Id");
                return Ok(data);
            }
        }


        [HttpPost("user/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogInformation("Invalid model state" + ModelState.Values);
                return BadRequest(ModelState);
            }
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    _logger.LogInformation("User not found");
                    return NotFound();
                }
                var roles = await _userManager.GetRolesAsync(user);
                var data = new {
                    roles = roles,
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName= user.LastName,
                    email = user.Email,
                    phoneNumber = user.PhoneNumber,
                    refId = null as string
                };
                try
                {
                    if(roles.Contains("Doctor"))
                    {
                        var doctor = await _context.Doctors.FirstOrDefaultAsync(
                            d => d.UserId == user.Id
                        );
                        if(doctor != null) data = data with { refId = doctor.Id.ToString()};
                    }
                    else if(roles.Contains("Patient"))
                    {
                        var patient = await _context.Patients.FirstOrDefaultAsync(
                            p => p.UserId == user.Id
                        );
                        if(patient != null) data = data with { refId = patient.Id.ToString()};
                    }
                    return Ok(data);
                } catch (Exception ex)
                {
                    _logger.LogError(ex, "Error fetchin Ref Id");
                    return Ok(data);
                }
            }
            catch (System.Exception)
            {
                
                throw;
            }
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogInformation("Invalid model state" + ModelState.Values);
                return BadRequest(ModelState);
            }
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create user and patient
                string username = await _tokenService.GenerateUsername(model.FirstName, model.LastName, _userManager);

                // First create Identity User
                var user = new User
                {
                    UserName = username,
                    Email = model.Email,
                    PhoneNumber = model.PhoneNumber,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    DateOfBirth = model.DateOfBirth,
                    Gender = model.Gender
                };

                

                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {

                    // Then create Patient
                    var patient = new Patient
                    {
                        UserId = user.Id,
                        Address = model.Address,
                        InsuranceProvider = model.InsuranceProvider,
                        InsurancePolicyNumber = model.InsurancePolicyNumber
                    };

                    _context.Patients.Add(patient);
                    await _context.SaveChangesAsync();

                    // Add user to Patient role
                    await _userManager.AddToRoleAsync(user, "Patient");

                    _logger.LogInformation("User created a new account with password.");

                    // Send confirmation email
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(patient.User);
                    var confirmUrlBase = $"{_configuration["AppUrl"]}/confirm-email";
                    var confirmationLink = $"{confirmUrlBase}?userId={user.Id}&token={Uri.EscapeDataString(token)}";
                    
                    await transaction.CommitAsync();
                    // Send email
                    try {
                        await _emailService.SendEmailAsync(
                            patient.User.Email,
                            "Confirm your email",
                            $"Please confirm your account by clicking this link: <a href='{confirmationLink}'>link</a>");

                        return Ok(new { message = "User created successfully. Please check your email to confirm your account.", data = confirmationLink });
                    } catch (Exception ex) {
                        _logger.LogError(ex, "Error sending email");
                        return Ok(new { 
                            message = "User created successfully but confirmation email failed to send.",
                            data = confirmationLink 
                        });
                    }
                }

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            return BadRequest(ModelState);
        }

        [HttpPost("login")]
        // [IgnoreAntiforgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // Early rejection for obviously bad requests
            if (model == null || 
                string.IsNullOrWhiteSpace(model.Email) || 
                string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest("Email and password are required");
            }

            if (string.IsNullOrWhiteSpace(model?.Email) || string.IsNullOrWhiteSpace(model?.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }
            // Log the raw request to see what's being received
            _logger.LogInformation($"Received login request with email: {model?.Email ?? "null"} and password: {(model?.Password != null ? "provided" : "null")}");
            
            // // Check if model is null
            if (model == null)
            {
                _logger.LogWarning("Login model is null");
                return BadRequest(new { message = "Invalid request format" });
            }
            
            // Check for specific property nulls
            if (string.IsNullOrEmpty(model.Email))
            {
                _logger.LogWarning("Email is null or empty");
                ModelState.AddModelError("Email", "The Email field is required.");
            }
            
            if (string.IsNullOrEmpty(model.Password))
            {
                _logger.LogWarning("Password is null or empty");
                ModelState.AddModelError("Password", "The Password field is required.");
            }
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState is invalid: " + string.Join(", ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogInformation("User not found");
                return Unauthorized(new { message = "Invalid email or password" });
            }
            _logger.LogInformation($"User Found with Email : {user.Email}");

            // Check if email is confirmed (if required)
            if (_userManager.Options.SignIn.RequireConfirmedEmail && !await _userManager.IsEmailConfirmedAsync(user))
            {
                _logger.LogInformation("Email not confirmed");
                return Unauthorized(new { message = "Email not confirmed. Please confirm your email before logging in." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            _logger.LogInformation($"Password check result: {result.Succeeded}");
            if (result.Succeeded)
            {
                // Clear any ModelState errors
                ModelState.Clear();

                var token = _tokenService.GenerateJwtToken(user, _configuration, _userManager);
                var roles = await _userManager.GetRolesAsync(user);

                var response = new
                {
                    token = token,
                    user = new
                    {
                        roles = roles,
                        id = user.Id,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        email = user.Email,
                        phoneNumber = user.PhoneNumber,
                        isEmailConfirmed = user.EmailConfirmed,
                        isPhoneNumberConfirmed = user.PhoneNumberConfirmed,
                        isTwoFactorEnabled = user.TwoFactorEnabled,
                        username = user.UserName,
                        gender = user.Gender,
                        dateOfBirth = user.DateOfBirth,
                    }
                };

                return new JsonResult(response) { StatusCode = 200 };
            }
            
            _logger.LogInformation("Invalid password");
            return Unauthorized(new { message = "Invalid email or password" });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetLink = $"{_configuration["AppUrl"]}/reset-password?email={user.Email}&token={Uri.EscapeDataString(token)}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Reset your password",
                $"Please reset your password by clicking this link: <a href='{resetLink}'>Reset Password</a>");

            return Ok(new { message = "If your email is registered, you will receive a password reset link." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogError("Model validation failed: {Errors}", 
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogError("User does not exist for email: {Email}", model.Email);
                return BadRequest(new { message = "Password reset failed" });
            }
            
            _logger.LogInformation("User found: {UserId}", user.Id);
            _logger.LogInformation("Token length: {TokenLength}", model.Token?.Length ?? 0);

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.Password);
            if (result.Succeeded)
            {
                _logger.LogInformation("Password reset successful for user: {UserId}", user.Id);
                return Ok(new { message = "Password has been reset successfully" });
            }
            
            _logger.LogError("Password reset failed for user: {UserId}. Errors: {Errors}", 
                user.Id, string.Join(", ", result.Errors.Select(e => e.Description)));

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }

            return BadRequest(ModelState);
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
            {
                return BadRequest(new { message = "Invalid email confirmation link" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (result.Succeeded)
            {
                _logger.LogInformation("User confirmed their email address.");
                // return Redirect($"{_configuration["AppUrl"]}/login?emailConfirmed=true");
                return Ok(new { message = "Email confirmed successfully" });
            }

            return BadRequest(new { message = "Email confirmation failed" });
        }
        
    

    [HttpGet("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out.");
            return Ok(new { Message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, "An error occurred while logging out");
        }
    }

    [HttpGet("health")]
    public async Task<IActionResult> Health()
    {
        try
        {
            _logger.LogInformation("Health Check");
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during health check ");
            return StatusCode(500, "An error occured during health check");
        }
    }

    [HttpPost("resend-confirmation")]
    [AllowAnonymous]
    public async Task<IActionResult> ResendConfirmation([FromBody] string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return BadRequest(new { message = "User not found" });
        }
        if (user.EmailConfirmed)
        {
            return BadRequest(new { message = "Email already confirmed" });
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmUrl = $"{_configuration["AppUrl"]}/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

        try
        {
            await _emailService.SendEmailAsync(
                user.Email,
                "Confirm your email",
                $"Please confirm your account by clicking this link: <a href='{confirmUrl}'>link</a>");
            return Ok(new { message = "Confirmation email resent successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resending confirmation email");
            return StatusCode(500, new { message = "Failed to resend confirmation email." });
        }
    }
}
}