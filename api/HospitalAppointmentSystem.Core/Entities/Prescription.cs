namespace HospitalAppointmentSystem.Core
{
    public class Prescription
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }
        public int PatientId { get; set; }
        public Patient Patient { get; set; }
        public string Medication { get; set; }
        public string Dosage { get; set; }
        public string Instructions { get; set; }
        public DateTime PrescribedDate { get; set; } = DateTime.UtcNow;
        public TimeSpan Duration { get; set; } // e.g. 30 days supply
    }
}