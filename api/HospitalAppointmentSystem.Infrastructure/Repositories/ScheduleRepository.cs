using HospitalAppointmentSystem.Core;
using Microsoft.EntityFrameworkCore;

namespace HospitalAppointmentSystem.Infrastructure
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly HospitalDbContext _context;

        public ScheduleRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Schedule schedule)
        {
            await _context.Schedules.AddAsync(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Schedule schedule)
        {
            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> Exists(int id)
        {
            return await _context.Schedules.AnyAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Schedule>> GetAllAsync()
        {
            return await _context.Schedules.ToListAsync();
        }

        public async Task<Schedule> GetByIdAsync(int id)
        {
            return await _context.Schedules.FindAsync(id);
        }

        public async Task UpdateAsync(Schedule schedule)
        {
            _context.Schedules.Update(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Schedule>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.Schedules
                .Where(s => s.DoctorId == doctorId)
                .ToListAsync();
        }
    }

    // Similar implementations for DoctorRepository, PatientRepository, ScheduleRepository
    // Omitted for brevity
}