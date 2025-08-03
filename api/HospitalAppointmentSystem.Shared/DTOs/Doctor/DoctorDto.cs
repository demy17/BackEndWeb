public class DoctorDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Specialization { get; set; }
    public string LicenseNumber { get; set; }
}

public class CreateDoctorDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Specialization { get; set; }
    public string LicenseNumber { get; set; }
    public string Gender { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Password { get; set; }
}

public class UpdateDoctorDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }

    public string Gender {get; set;}
    public DateTime DateOfBirth {get; set;}
    public string PhoneNumber { get; set; }
    public string Specialization { get; set; }
    public string LicenseNumber { get; set; }
}