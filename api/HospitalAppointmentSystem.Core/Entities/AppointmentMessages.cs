namespace HospitalAppointmentSystem.Core.Entites
{
    public class AppointmentCreatedMessage
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string PatientEmail { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AppointmentUpdatedMessage
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string PatientEmail { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string OldStatus { get; set; }
        public string NewStatus { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AppointmentCancelledMessage
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string PatientEmail { get; set; }
        public string DoctorEmail { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string CancelledBy { get; set; }
        public DateTime CancelledAt { get; set; }
        public string Reason { get; set; }
    }

    public class AppointmentReminderMessage
    {
        public int AppointmentId { get; set; }
        public string PatientEmail { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string ReminderType { get; set; } // "24hours", "2hours", etc.
    }

    public class PrescriptionCreatedMessage
    {
        public int PrescriptionId { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string PatientEmail { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public string Medication { get; set; }
        public string Dosage { get; set; }
        public string Instructions { get; set; }
        public DateTime PrescribedDate { get; set; }
        public TimeSpan Duration { get; set; }
    }
}
