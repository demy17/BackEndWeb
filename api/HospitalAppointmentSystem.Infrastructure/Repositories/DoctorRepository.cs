using HospitalAppointmentSystem.Core;
using Microsoft.EntityFrameworkCore;

namespace HospitalAppointmentSystem.Infrastructure
{
    public class DoctorRepository : IDoctorRepository
    {
        private readonly HospitalDbContext _context;

        public DoctorRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Doctor>> GetAllWithDetailsAsync()
        {
            return await _context.Doctors
                .Include(d => d.User)
                .ToListAsync();
        }

        public async Task<Doctor> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task AddAsync(Doctor doctor)
        {
            await _context.Doctors.AddAsync(doctor);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Doctor doctor)
        {
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> Exists(int id)
        {
            return await _context.Doctors.AnyAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<Doctor>> GetAllAsync()
        {
            return await _context.Doctors.ToListAsync();
        }

        public async Task<Doctor> GetByIdAsync(int id)
        {
            return await _context.Doctors.FindAsync(id);
        }

        public async Task<IEnumerable<Doctor>> GetBySpecializationAsync(string specialization)
        {
            if (string.IsNullOrWhiteSpace(specialization))
                return await _context.Doctors.Include(d => d.User).ToListAsync();

            return await _context.Doctors
                .Include(d => d.User)
                .Where(d => d.Specialization.ToLower().Contains(specialization.ToLower()))
                .ToListAsync();
        }

        // public async Task<IEnumerable<Appointment>> GetByPatientIdAsync(int patientId)
        // {
        //     return await _context.Appointments
        //         .Where(a => a.PatientId == patientId)
        //         .ToListAsync();
        // }

        public async Task UpdateAsync(Doctor doctor)
        {
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
        }
    }

    // Similar implementations for DoctorRepository, PatientRepository, ScheduleRepository
    // Omitted for brevity
}