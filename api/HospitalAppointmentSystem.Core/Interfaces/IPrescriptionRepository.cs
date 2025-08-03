using HospitalAppointmentSystem.Core;

namespace HospitalAppointmentSystem.Core.Interfaces
{
    public interface IPrescriptionRepository
    {
        Task<Prescription?> GetByIdAsync(int id);
        Task<Prescription?> GetByIdWithDetailsAsync(int id);
        IQueryable<Prescription> GetQueryable();
        Task AddAsync(Prescription prescription);
        Task UpdateAsync(Prescription prescription);
        Task DeleteAsync(Prescription prescription);
        
        Task<(List<Prescription> items, int totalCount)> GetByDoctorWithPagingAsync(
            int doctorId, int pageNumber, int pageSize);
            
        Task<(List<Prescription> items, int totalCount)> GetByPatientWithPagingAsync(
            int patientId, int pageNumber, int pageSize);
    }
}