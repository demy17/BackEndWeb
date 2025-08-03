using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Core.Enums;
public class AppointmentDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public PatientDto patient {get; set;}
        public int DoctorId { get; set; }

        public DoctorDto doctor {get; set;}
        public DateTime AppointmentDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Status { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }