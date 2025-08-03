namespace HospitalAppointmentSystem.Core
{
    public class Doctor
    {
        public int Id { get; set; }
        public string UserId { get; set; }  // Links to Identity User (string)
        public User User { get; set; }      // Navigation to Identity
        public string Specialization { get; set; }
        public string LicenseNumber { get; set; }
        public ICollection<Schedule> Schedules { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
    }
}