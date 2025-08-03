using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalAppointmentSystem.Core
{
    public class User : IdentityUser
    {
        // public int Id { get; set; }

        [Required(ErrorMessage = "First Name is required")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last Name is required")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Enter a valid email address")]
        public override string Email { get; set; }

        public string Gender { get; set; }
        public override string PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }

        // public User(string firstName, string lastName, string email)
        // {
        //     if (string.IsNullOrEmpty(firstName))
        //         throw new ArgumentNullException(nameof(firstName), "First name cannot be null or empty");
            
        //     if (string.IsNullOrEmpty(lastName))
        //         throw new ArgumentNullException(nameof(lastName), "Last name cannot be null or empty");
            
        //     if (string.IsNullOrEmpty(email))
        //         throw new ArgumentNullException(nameof(email), "Email Address cannot be null or empty");
            
        //     FirstName = firstName;
        //     LastName = lastName;
        //     Email = email;
        // }
    }
}