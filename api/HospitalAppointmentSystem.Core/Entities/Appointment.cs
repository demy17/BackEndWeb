using HospitalAppointmentSystem.Core.Enums;

namespace HospitalAppointmentSystem.Core
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient Patient { get; set; }
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        // public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
        public string Status { get; set; } = NewStatus.Pending;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool Reminder24HourSent { get; set; } = false;
        public bool Reminder2HourSent { get; set; } = false;
    }
}