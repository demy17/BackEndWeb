namespace HospitalAppointmentSystem.Core
{
    public interface IPatientRepository
    {
        Task<IEnumerable<Patient>> GetAllAsync();
        Task<IEnumerable<Patient>> GetAllWithDetailsAsync();
        Task<Patient> GetByIdAsync(int id);
        Task<Patient> GetByIdWithDetailsAsync(int id);
        Task AddAsync(Patient patient);
        Task UpdateAsync(Patient patient);
        Task DeleteAsync(Patient patient);
    }
}