using HospitalAppointmentSystem.Core;
using Microsoft.EntityFrameworkCore;

namespace HospitalAppointmentSystem.Infrastructure
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly HospitalDbContext _context;

        public AppointmentRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public IQueryable<Appointment> GetAll()
        {
            return _context.Appointments.AsQueryable();
        }

        // public async Task<IEnumerable<Appointment>> GetAllWithDetailsAsync()
        // {
        //     return await _context.Appointments
        //         .Include(a => a.Patient)
        //         .Include(a => a.Doctor)
        //         .ToListAsync();
        // }

        public async Task<IEnumerable<Appointment>> GetAllAsync()
        {
            return await _context.Appointments.Include(a => a.Patient).Include(a => a.Doctor).ToListAsync();
        }

        public async Task AddAsync(Appointment appointment)
        {
            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Appointment appointment)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> Exists(int id)
        {
            return await _context.Appointments.AnyAsync(a => a.Id == id);
        }

        public async Task<Appointment> GetByIdAsync(int id)
        {
            return await _context.Appointments.FindAsync(id);
        }

        public async Task<Appointment> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Patient.User)
                .Include(a => a.Doctor.User)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.Appointments
                .Where(a => a.Doctor.Id == doctorId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByPatientIdAsync(int patientId)
        {
            return await _context.Appointments
                .Where(a => a.Patient.Id == patientId)
                .ToListAsync();
        }

        public async Task UpdateAsync(Appointment appointment)
        {
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();
        }
    }
}