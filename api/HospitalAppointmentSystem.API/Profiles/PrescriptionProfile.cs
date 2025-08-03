using AutoMapper;
using HospitalAppointmentSystem.Core;
using HospitalAppointmentSystem.Core.DTOs;

namespace HospitalAppointmentSystem.Core.Profiles
{
    public class PrescriptionProfile : Profile
    {
        public PrescriptionProfile()
        {
            CreateMap<Prescription, PrescriptionDto>()
                .ForMember(dest => dest.Doctor, opt => opt.MapFrom(src => src.Doctor))
                .ForMember(dest => dest.Patient, opt => opt.MapFrom(src => src.Patient));

            CreateMap<CreatePrescriptionDto, Prescription>()
                .ForMember(dest => dest.PrescribedDate, opt => opt.MapFrom(_ => DateTime.UtcNow));

            CreateMap<UpdatePrescriptionDto, Prescription>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Doctor, DoctorDto>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName));

            CreateMap<Patient, PatientDto>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.User.DateOfBirth));

        }
    }
}