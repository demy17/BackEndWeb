using AutoMapper;
using HospitalAppointmentSystem.Core;

public class DoctorProfile : Profile
{
    public DoctorProfile()
    {
        CreateMap<Doctor, DoctorDto>()
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User.PhoneNumber));

        CreateMap<CreateDoctorDto, Doctor>();
        CreateMap<UpdateDoctorDto, Doctor>();
    }
}