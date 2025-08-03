using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Infrastructure;
using Microsoft.AspNetCore.Identity;


// using HospitalAppointmentSystem.Core.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HospitalAppointmentSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PatientsController> _logger;
        private readonly HospitalDbContext _context;
        private readonly UserManager<User> _userManager;

        public PatientsController(
            IPatientRepository patientRepository,
            IMapper mapper,
            ILogger<PatientsController> logger,
            HospitalDbContext context,
            UserManager<User> userManager)
        {
            _patientRepository = patientRepository;
            _mapper = mapper;
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientDto>>> GetAllPatients()
        {
            try
            {
                var patients = await _patientRepository.GetAllWithDetailsAsync();
                return Ok(_mapper.Map<List<PatientDto>>(patients));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patients");
                return StatusCode(500, "An error occurred while retrieving patients");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientDto>> GetPatientById(int id)
        {
            try
            {
                var patient = await _patientRepository.GetByIdWithDetailsAsync(id);
                if (patient == null)
                {
                    return NotFound();
                }
                return Ok(_mapper.Map<PatientDto>(patient));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving patient with id {id}");
                return StatusCode(500, $"An error occurred while retrieving patient with id {id}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PatientDto>> CreatePatient([FromBody] CreatePatientDto patientDto)
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
                    UserName = patientDto.Email,
                    Email = patientDto.Email,
                    FirstName = patientDto.FirstName,
                    LastName = patientDto.LastName,
                    PhoneNumber = patientDto.PhoneNumber,
                    Gender = patientDto.Gender,
                    DateOfBirth = patientDto.DateOfBirth
                };

                var createUserResult = await _userManager.CreateAsync(user, patientDto.Password);
                if (!createUserResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(createUserResult.Errors);
                }

                // Assign Patient role
                await _userManager.AddToRoleAsync(user, "Patient");

                // Create Patient
                var patient = _mapper.Map<Patient>(patientDto);
                patient.UserId = user.Id;
                
                await _patientRepository.AddAsync(patient);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var createdPatient = await _patientRepository.GetByIdWithDetailsAsync(patient.Id);
                return CreatedAtAction(
                    nameof(GetPatientById), 
                    new { id = patient.Id }, 
                    _mapper.Map<PatientDto>(createdPatient));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating patient");
                return StatusCode(500, "An error occurred while creating patient");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] UpdatePatientDto patientDto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (id != patientDto.Id)
                {
                    return BadRequest("ID mismatch");
                }

                var existingPatient = await _patientRepository.GetByIdAsync(id);
                if (existingPatient == null)
                {
                    return NotFound();
                }

                _mapper.Map(patientDto, existingPatient);
                // Update User entity
                if (existingPatient.User != null)
                {
                    existingPatient.User.FirstName = patientDto.FirstName;
                    existingPatient.User.LastName = patientDto.LastName;
                    existingPatient.User.Email = patientDto.Email;
                    existingPatient.User.PhoneNumber = patientDto.PhoneNumber;
                    existingPatient.User.Gender = patientDto.Gender;
                    existingPatient.User.DateOfBirth = patientDto.DateOfBirth;
                    
                    // Update user in database
                    await _userManager.UpdateAsync(existingPatient.User);
                }
                await _patientRepository.UpdateAsync(existingPatient);
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error updating patient with id {id}");
                return StatusCode(500, $"An error occurred while updating patient with id {id}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var patient = await _patientRepository.GetByIdAsync(id);
                if (patient == null)
                {
                    return NotFound();
                }

                // First delete the associated user
                var user = await _userManager.FindByIdAsync(patient.UserId);
                if (user != null)
                {
                    var result = await _userManager.DeleteAsync(user);
                    if (!result.Succeeded)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(result.Errors);
                    }
                }

                await _patientRepository.DeleteAsync(patient);
                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Error deleting patient with id {id}");
                return StatusCode(500, $"An error occurred while deleting patient with id {id}");
            }
        }
    }
}