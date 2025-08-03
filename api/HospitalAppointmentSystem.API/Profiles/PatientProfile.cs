using AutoMapper;
using HospitalAppointmentSystem.Core;

public class PatientProfile : Profile
{
    public PatientProfile()
    {
        CreateMap<Patient, PatientDto>()
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber))
            .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.User.DateOfBirth));

        CreateMap<CreatePatientDto, Patient>();
        CreateMap<UpdatePatientDto, Patient>();
    }
}