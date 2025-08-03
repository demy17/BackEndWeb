namespace HospitalAppointmentSystem.Core
{
    public class Patient
    {
        public int Id { get; set; }
        public string UserId { get; set; }  // Links to Identity User (string)
        public User User { get; set; }
        public string Address { get; set; }
        public string InsuranceProvider { get; set; }
        public string InsurancePolicyNumber { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
    }
}