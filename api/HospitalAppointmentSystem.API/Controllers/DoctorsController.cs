using AutoMapper;
using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;


// using HospitalAppointmentSystem.Core.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace HospitalAppointmentSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DoctorsController> _logger;
        private readonly HospitalDbContext _context;
        private readonly UserManager<User> _userManager;

        public DoctorsController(
            IDoctorRepository doctorRepository,
            IMapper mapper,
            ILogger<DoctorsController> logger,
            HospitalDbContext context,
            UserManager<User> userManager
        )
        {
            _doctorRepository = doctorRepository;
            _mapper = mapper;
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetAllDoctors()
        {
            try
            {
                var doctors = await _doctorRepository.GetAllWithDetailsAsync();
                return Ok(_mapper.Map<List<DoctorDto>>(doctors));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctors");
                return StatusCode(500, "An error occurred while retrieving doctors");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctorById(int id)
        {
            try
            {
                var doctor = await _doctorRepository.GetByIdWithDetailsAsync(id);
                if (doctor == null)
                {
                    return NotFound();
                }
                return Ok(_mapper.Map<DoctorDto>(doctor));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving doctor with id {id}");
                return StatusCode(500, $"An error occurred while retrieving doctor with id {id}");
            }
        }

        [HttpGet("spec/{specialization}")]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctorsBySpecialization(string specialization)
        {
            try
            {
                _logger.LogInformation($"Attempting to retrieve doctors with specialization: {specialization}");
                
                var doctors = await _doctorRepository.GetBySpecializationAsync(specialization);
                if (doctors == null || !doctors.Any())
                {
                    return NotFound($"No doctors found with specialization: {specialization}");
                }
                
                return Ok(_mapper.Map<List<DoctorDto>>(doctors));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving doctors with specialization {specialization}");
                return StatusCode(500, $"An error occurred while retrieving doctors with specialization {specialization}");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DoctorDto>> CreateDoctor([FromBody] CreateDoctorDto doctorDto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Create User first
                var user = new User
                {
                    UserName = doctorDto.Email,
                    Email = doctorDto.Email,
                    FirstName = doctorDto.FirstName,
                    LastName = doctorDto.LastName,
                    PhoneNumber = doctorDto.PhoneNumber,
                    Gender = doctorDto.Gender,
                    DateOfBirth = doctorDto.DateOfBirth
                };

                var createUserResult = await _userManager.CreateAsync(user, doctorDto.Password);
                if (!createUserResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(createUserResult.Errors);
                }

                // Assign Doctor role
                await _userManager.AddToRoleAsync(user, "Doctor");

                // Create Doctor
                var doctor = _mapper.Map<Doctor>(doctorDto);
                doctor.UserId = user.Id;
                
                await _doctorRepository.AddAsync(doctor);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var createdDoctor = await _doctorRepository.GetByIdWithDetailsAsync(doctor.Id);
                return CreatedAtAction(
                    nameof(GetDoctorById), 
                    new { id = doctor.Id }, 
                    _mapper.Map<DoctorDto>(createdDoctor));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating doctor");
                return StatusCode(500, "An error occurred while creating doctor");
            }
        }

        // Other actions (GET, PUT, DELETE) remain the same but with transactions added
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] UpdateDoctorDto doctorDto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (id != doctorDto.Id)
                {
                    return BadRequest("ID mismatch");
                }

                var existingDoctor = await _doctorRepository.GetByIdWithDetailsAsync(id);
                if (existingDoctor == null)
                {
                    return NotFound();
                }

                _mapper.Map(doctorDto, existingDoctor);
                // Update User entity
                if (existingDoctor.User != null)
                {
                    existingDoctor.User.FirstName = doctorDto.FirstName;
                    existingDoctor.User.LastName = doctorDto.LastName;
                    existingDoctor.User.Email = doctorDto.Email;
                    existingDoctor.User.PhoneNumber = doctorDto.PhoneNumber;
                    existingDoctor.User.Gender = doctorDto.Gender;
                    existingDoctor.User.DateOfBirth = doctorDto.DateOfBirth;
                    
                    // Update user in database
                    await _userManager.UpdateAsync(existingDoctor.User);
                }
                
                await _doctorRepository.UpdateAsync(existingDoctor);
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error updating doctor with id {id}");
                return StatusCode(500, $"An error occurred while updating doctor with id {id}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var doctor = await _doctorRepository.GetByIdAsync(id);
                if (doctor == null)
                {
                    return NotFound();
                }

                // First delete the associated user
                var user = await _userManager.FindByIdAsync(doctor.UserId);
                if (user != null)
                {
                    var result = await _userManager.DeleteAsync(user);
                    if (!result.Succeeded)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(result.Errors);
                    }
                }

                await _doctorRepository.DeleteAsync(doctor);
                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error deleting doctor with id {id}");
                return StatusCode(500, $"An error occurred while deleting doctor with id {id}");
            }
        }
    }
}