namespace HospitalAppointmentSystem.Core
{
    public interface IScheduleRepository
    {
        Task<Schedule> GetByIdAsync(int id);
        Task<IEnumerable<Schedule>> GetAllAsync();
        Task AddAsync(Schedule schedule);
        Task UpdateAsync(Schedule schedule);
        Task DeleteAsync(Schedule schedule);
        Task<IEnumerable<Schedule>> GetByDoctorIdAsync(int doctorId);
    }
}