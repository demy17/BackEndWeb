using HospitalAppointmentSystem.Core;
using Microsoft.EntityFrameworkCore;

namespace HospitalAppointmentSystem.Infrastructure
{
    public class PatientRepository : IPatientRepository
    {
        private readonly HospitalDbContext _context;

        public PatientRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Patient patient)
        {
            await _context.Patients.AddAsync(patient);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Patient patient)
        {
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> Exists(int id)
        {
            return await _context.Patients.AnyAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Patient>> GetAllAsync()
        {
            return await _context.Patients.ToListAsync();
        }

        public async Task<Patient> GetByIdAsync(int id)
        {
            return await _context.Patients.FindAsync(id);
        }

        public async Task<Patient> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Patients
                .Include(p => p.Appointments)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Patient>> GetAllWithDetailsAsync()
        {
            return await _context.Patients
                .Include(p => p.Appointments)
                .Include(p => p.User)
                .ToListAsync();
        }

        public async Task UpdateAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
        }
    }

    // Similar implementations for DoctorRepository, PatientRepository, ScheduleRepository
    // Omitted for brevity
}