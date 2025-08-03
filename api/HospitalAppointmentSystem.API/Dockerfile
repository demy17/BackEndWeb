# Use this exact Dockerfile (place in HospitalAppointmentSystem.API/)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["HospitalAppointmentSystem.sln", "."]
COPY ["HospitalAppointmentSystem.API/HospitalAppointmentSystem.API.csproj", "HospitalAppointmentSystem.API/"]
COPY ["HospitalAppointmentSystem.Core/HospitalAppointmentSystem.Core.csproj", "HospitalAppointmentSystem.Core/"]
COPY ["HospitalAppointmentSystem.Infrastructure/HospitalAppointmentSystem.Infrastructure.csproj", "HospitalAppointmentSystem.Infrastructure/"]
COPY ["HospitalAppointmentSystem.Shared/HospitalAppointmentSystem.Shared.csproj", "HospitalAppointmentSystem.Shared/"]

# Verify .NET SDK is available
RUN dotnet --version && \
    dotnet restore "HospitalAppointmentSystem.sln"

# Copy everything else
COPY . .

# Build and publish
RUN dotnet publish "HospitalAppointmentSystem.API" -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "HospitalAppointmentSystem.API.dll"]
CMD ["--urls", "http://0.0.0.0:80"]  # Default port config