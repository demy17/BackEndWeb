using AutoMapper;
using HospitalAppointmentSystem.Core;
// using HospitalAppointmentSystem.Core;

namespace HospitalAppointmentSystem.API.Profiles
{
    public class AppointmentProfile : Profile
    {
        public AppointmentProfile()
        {
            // Appointment mappings
            CreateMap<Appointment, AppointmentDto>();
            CreateMap<CreateAppointmentDto, Appointment>();

            // Patient mappings
            CreateMap<Patient, PatientDto>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.User.DateOfBirth));

            // Doctor mappings
            CreateMap<Doctor, DoctorDto>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber));
        }
    }
}