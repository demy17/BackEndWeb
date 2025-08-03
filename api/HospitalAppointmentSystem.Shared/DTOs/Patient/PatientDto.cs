public class PatientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; }
    public string InsuranceProvider { get; set; }
    public string InsurancePolicyNumber { get; set; }
}

public class CreatePatientDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; }
    public string Gender { get; set; }
    public string InsuranceProvider { get; set; }
    public string InsurancePolicyNumber { get; set; }
    public string Password { get; set; }
}

public class UpdatePatientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Gender { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; }
    public string InsuranceProvider { get; set; }
    public string InsurancePolicyNumber { get; set; }
}