using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HospitalAppointmentSystem.Core.Models
{
    // Model classes
    public class RegisterModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        [JsonConverter(typeof(CustomDateTimeConverter))]
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }

        public string Gender { get; set; }
        public string InsuranceProvider { get; set; }
        public string InsurancePolicyNumber { get; set; }
        // public string Specialization { get; set; }
        // public string LicenseNumber { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }

    public class LoginModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }

    public class ForgotPasswordModel
    {
        public string Email { get; set; }
    }

    public class ResetPasswordModel
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string Password { get; set; }
    }
}