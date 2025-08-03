using System.ComponentModel.DataAnnotations;

namespace HospitalAppointmentSystem.Core.DTOs
{
    public class PrescriptionDto
    {
        public int Id { get; set; }
        public DoctorDto Doctor { get; set; }
        public PatientDto Patient { get; set; }
        public string Medication { get; set; }
        public string Dosage { get; set; }
        public string Instructions { get; set; }
        public DateTime PrescribedDate { get; set; }
        public TimeSpan Duration { get; set; }
    }

    public class CreatePrescriptionDto
    {
        [Required]
        public int DoctorId { get; set; }
        
        [Required]
        public int PatientId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Medication { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Dosage { get; set; }
        
        [MaxLength(500)]
        public string Instructions { get; set; }
        
        public TimeSpan Duration { get; set; } = TimeSpan.FromDays(30);
    }

    public class UpdatePrescriptionDto
    {
        [MaxLength(100)]
        public string? Medication { get; set; }
        
        [MaxLength(50)]
        public string? Dosage { get; set; }
        
        [MaxLength(500)]
        public string? Instructions { get; set; }
        
        public TimeSpan? Duration { get; set; }
    }

    public class PagedResponse<T>
    {
        public List<T> Items { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }
}