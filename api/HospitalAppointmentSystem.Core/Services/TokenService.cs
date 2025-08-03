using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HospitalAppointmentSystem.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HospitalAppointmentSystem.Core.Services
{
    public class TokenService
    {
        public string GenerateJwtToken(User user, IConfiguration _configuration, UserManager<User> _userManager)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            };

            // Add roles to claims
            var roles = _userManager.GetRolesAsync(user).Result;
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Check if JWT configuration exists
            var jwtKey = _configuration["JwtSettings:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT Key is not configured. Please check your configuration.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Check if ExpireDays is configured
            var expireDays = _configuration["JwtSettings:ExpireDays"];
            var expires = string.IsNullOrEmpty(expireDays) 
                ? DateTime.Now.AddDays(30) // Default to 30 days if not configured
                : DateTime.Now.AddDays(Convert.ToDouble(expireDays));

            // Check if Issuer and Audience are configured
            var issuer = _configuration["JwtSettings:Issuer"] ?? "DefaultIssuer";
            var audience = _configuration["JwtSettings:Audience"] ?? "DefaultAudience";

            var token = new JwtSecurityToken(
                issuer,
                audience,
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string> GenerateUsername(string firstName, string lastName, UserManager<User> userManager)
        {
            // Generate a username based on the first name and last name
            var username = $"{firstName.Substring(0, 1)}{lastName}";
            var existingUser = await userManager.FindByNameAsync(username);
            while (existingUser != null)
            {
                username = $"{username}{Guid.NewGuid().ToString().Substring(0, 4)}";
                existingUser = await userManager.FindByNameAsync(username);
            }
            return username;
        }
    }
}
