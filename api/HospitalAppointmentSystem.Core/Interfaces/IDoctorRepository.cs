namespace HospitalAppointmentSystem.Core
{
    public interface IDoctorRepository
    {
        Task<IEnumerable<Doctor>> GetAllAsync();
        Task<IEnumerable<Doctor>> GetAllWithDetailsAsync();
        Task<Doctor> GetByIdAsync(int id);
        Task<Doctor> GetByIdWithDetailsAsync(int id);
        Task AddAsync(Doctor doctor);
        Task UpdateAsync(Doctor doctor);
        Task DeleteAsync(Doctor doctor);
        Task<IEnumerable<Doctor>> GetBySpecializationAsync(string specialization);
    }
}