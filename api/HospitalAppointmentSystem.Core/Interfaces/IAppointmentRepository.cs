namespace HospitalAppointmentSystem.Core
{
    public interface IAppointmentRepository
    {
        Task<Appointment> GetByIdAsync(int id);
        Task<Appointment> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<Appointment>> GetAllAsync();
        IQueryable<Appointment> GetAll();
        // Task<IEnumerable<Appointment>> GetAllWithDetailsAsync(); // Add this new method
        Task AddAsync(Appointment appointment);
        Task UpdateAsync(Appointment appointment);
        Task DeleteAsync(Appointment appointment);
        Task<bool> Exists(int id);
        Task<IEnumerable<Appointment>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<Appointment>> GetByPatientIdAsync(int patientId);
    }
}