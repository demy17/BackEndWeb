using AutoMapper;
using HospitalAppointmentSystem.API.Messaging;
using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Core.DTOs;
using HospitalAppointmentSystem.Core.Entites;
using HospitalAppointmentSystem.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalAppointmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PrescriptionsController> _logger;
        private readonly RabbitMqService _rabbitMqService;
        private const int DefaultPageSize = 10;
        private const int MaxPageSize = 50;

        public PrescriptionsController(
            IPrescriptionRepository prescriptionRepository,
            IMapper mapper,
            ILogger<PrescriptionsController> logger,
            RabbitMqService rabbitMqService)
        {
            _prescriptionRepository = prescriptionRepository;
            _mapper = mapper;
            _logger = logger;
            _rabbitMqService = rabbitMqService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResponse<PrescriptionDto>>> GetAll(
            [FromQuery] string search = "",
            [FromQuery] int? doctorId = null,
            [FromQuery] int? patientId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DefaultPageSize)
        {
            try
            {
                pageSize = Math.Min(pageSize, MaxPageSize);
                
                var query = _prescriptionRepository.GetQueryable()
                    .Include(p => p.Doctor)
                    .ThenInclude(d => d.User) // If Doctor has User navigation
                    .Include(p => p.Patient)
                    .ThenInclude(p => p.User) // If Patient has User navigation
                    .AsQueryable();

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p => 
                        p.Medication.Contains(search) ||
                        p.Instructions.Contains(search));
                }

                if (doctorId.HasValue) query = query.Where(p => p.DoctorId == doctorId.Value);
                if (patientId.HasValue) query = query.Where(p => p.PatientId == patientId.Value);
                if (startDate.HasValue) query = query.Where(p => p.PrescribedDate >= startDate.Value);
                if (endDate.HasValue) query = query.Where(p => p.PrescribedDate <= endDate.Value);

                var totalCount = await query.CountAsync();
                
                var items = await query
                    .OrderByDescending(p => p.PrescribedDate)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new PagedResponse<PrescriptionDto>
                {
                    Items = _mapper.Map<List<PrescriptionDto>>(items),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prescriptions");
                return StatusCode(500, "An error occurred while retrieving prescriptions");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PrescriptionDto>> GetById(int id)
        {
            try
            {
                var prescription = await _prescriptionRepository.GetByIdWithDetailsAsync(id);
                if (prescription == null) return NotFound();
                return Ok(_mapper.Map<PrescriptionDto>(prescription));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving prescription with id {id}");
                return StatusCode(500, $"An error occurred while retrieving prescription with id {id}");
            }
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<PagedResponse<PrescriptionDto>>> GetByDoctor(
            int doctorId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DefaultPageSize)
        {
            try
            {
                pageSize = Math.Min(pageSize, MaxPageSize);
                
                var (prescriptions, totalCount) = await _prescriptionRepository
                    .GetByDoctorWithPagingAsync(doctorId, pageNumber, pageSize);

                return Ok(new PagedResponse<PrescriptionDto>
                {
                    Items = _mapper.Map<List<PrescriptionDto>>(prescriptions),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving prescriptions for doctor {doctorId}");
                return StatusCode(500, $"An error occurred while retrieving prescriptions for doctor {doctorId}");
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<PagedResponse<PrescriptionDto>>> GetByPatient(
            int patientId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = DefaultPageSize)
        {
            try
            {
                pageSize = Math.Min(pageSize, MaxPageSize);
                
                var (prescriptions, totalCount) = await _prescriptionRepository
                    .GetByPatientWithPagingAsync(patientId, pageNumber, pageSize);

                return Ok(new PagedResponse<PrescriptionDto>
                {
                    Items = _mapper.Map<List<PrescriptionDto>>(prescriptions),
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving prescriptions for patient {patientId}");
                return StatusCode(500, $"An error occurred while retrieving prescriptions for patient {patientId}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PrescriptionDto>> Create([FromBody] CreatePrescriptionDto dto)
        {
            try
            {
                var prescription = _mapper.Map<Prescription>(dto);
                await _prescriptionRepository.AddAsync(prescription);

                var created = await _prescriptionRepository.GetByIdWithDetailsAsync(prescription.Id);

                // Publish prescription created message
                var message = new PrescriptionCreatedMessage
                {
                    PrescriptionId = created.Id,
                    PatientId = created.PatientId,
                    DoctorId = created.DoctorId,
                    PatientEmail = created.Patient.User.Email,
                    PatientName = $"{created.Patient.User.FirstName} {created.Patient.User.LastName}",
                    DoctorName = $"Dr. {created.Doctor.User.FirstName} {created.Doctor.User.LastName}",
                    Medication = created.Medication,
                    Dosage = created.Dosage,
                    Instructions = created.Instructions,
                    PrescribedDate = created.PrescribedDate,
                    Duration = created.Duration
                };

                await _rabbitMqService.PublishAsync("prescription.created", message);

                return CreatedAtAction(
                    nameof(GetById), 
                    new { id = prescription.Id }, 
                    _mapper.Map<PrescriptionDto>(created));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating prescription");
                return StatusCode(500, "An error occurred while creating prescription");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePrescriptionDto dto)
        {
            try
            {
                var existing = await _prescriptionRepository.GetByIdAsync(id);
                if (existing == null) return NotFound();

                _mapper.Map(dto, existing);
                await _prescriptionRepository.UpdateAsync(existing);

                // Optionally publish prescription updated message
                var message = new PrescriptionCreatedMessage // Reuse the same message structure
                {
                    PrescriptionId = existing.Id,
                    PatientId = existing.PatientId,
                    DoctorId = existing.DoctorId,
                    PatientEmail = existing.Patient.User.Email,
                    PatientName = $"{existing.Patient.User.FirstName} {existing.Patient.User.LastName}",
                    DoctorName = $"Dr. {existing.Doctor.User.FirstName} {existing.Doctor.User.LastName}",
                    Medication = existing.Medication,
                    Dosage = existing.Dosage,
                    Instructions = existing.Instructions,
                    PrescribedDate = existing.PrescribedDate,
                    Duration = existing.Duration
                };

                await _rabbitMqService.PublishAsync("prescription.updated", message);
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating prescription {id}");
                return StatusCode(500, $"An error occurred while updating prescription {id}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var prescription = await _prescriptionRepository.GetByIdAsync(id);
                if (prescription == null) return NotFound();

                await _prescriptionRepository.DeleteAsync(prescription);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting prescription {id}");
                return StatusCode(500, $"An error occurred while deleting prescription {id}");
            }
        }
    }
}