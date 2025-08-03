## Student Name: Daniel Adejare

## Student ID: 24080


# Hospital Appointment System

A full-stack web application for managing hospital appointments, users (patients, doctors, admins), and prescriptions.  
Built with **.NET Core** (API), **React** (client), **Entity Framework Core** (ORM), and **Docker** for easy development and deployment.

---

## Features

- **User Authentication:** Patients, Doctors, and Admins with role-based access.
- **Appointment Management:** Book, approve, cancel, and view appointments.
- **Doctor & Patient Management:** View and manage profiles and schedules.
- **Prescription Management:** Doctors can prescribe and patients can view prescriptions.
- **Email Confirmation:** Users must confirm their email before logging in.
- **Password Reset:** Secure password reset via email.
- **Admin Dashboard:** Manage users, appointments, and prescriptions.
- **Responsive UI:** Modern, mobile-friendly React interface.
- **Messaging Service:** Uses RabbitMQ for appointment notifications.

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [dotnet-ef](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (for migrations)
- [Node.js & npm](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/compose/) (for database and messaging services)
- A running SQL Server/PostgreSQL/MySQL database (see your `appsettings.json` for connection string)

---

## Getting Started

### 1. **Clone the Repository**



---

### 2. **Set Up the Database**

- Ensure your database server is running.
- Create a database for the project (e.g., `hospital_appointment_db`).
- Update the connection string in `api/HospitalAppointmentSystem.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=hospital_appointment_db;User Id=youruser;Password=yourpassword;TrustServerCertificate=True;"
}
```

- You can use Docker Compose to spin up a database (e.g., SQL Server, PostgreSQL).  
  Example for SQL Server in `docker-compose.yml`:

```yaml
services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong!Passw0rd"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
```

Start with:

```bash
docker-compose up -d
```

---

### 3. **Start RabbitMQ Messaging Service**

The system uses RabbitMQ for messaging.  
Start RabbitMQ with Docker Compose:

```bash
docker-compose up -d rabbitmq
```

---

### 4. **Install .NET EF Tools**

```bash
dotnet tool install --global dotnet-ef
```

---

### 5. **Apply Database Migrations**

Navigate to the API directory:

```bash
cd api/HospitalAppointmentSystem.API
```

Restore dependencies:

```bash
dotnet restore
```

Add a migration (if you want to create a new one):

```bash
dotnet ef migrations add InitialCreate
```

Apply migrations to your database:

```bash
dotnet ef database update
```

---

### 6. **Run the API**

```bash
dotnet run
```

The API will start on `https://localhost:5001` or `http://localhost:5000` by default.

---

### 7. **Set Up the Client**

Open a new terminal, navigate to the client directory:

```bash
cd client
npm install
npm run dev
```

The React app will start on `http://localhost:5174` (or similar).

---

## Environment Variables

- **API:** Set your connection string and email settings in `api/HospitalAppointmentSystem.API/appsettings.json`.
- **Client:** If you need to change the API base URL, update the relevant config or `.env` file in the `client` directory.

---

## Useful Commands

- **Add Migration:**  
  `dotnet ef migrations add MigrationName`
- **Update Database:**  
  `dotnet ef database update`
- **Remove Last Migration:**  
  `dotnet ef migrations remove`
- **Run API:**  
  `dotnet run --project HospitalAppointmentSystem.API`
- **Run Client:**  
  `npm run dev` (from `client` directory)
- **Start RabbitMQ:**  
  `docker-compose up -d rabbitmq`

---

## Project Structure

```
hospital-appointment-system/
│
├── api/                        # .NET Core Web API
│   ├── HospitalAppointmentSystem.API/
│   ├── HospitalAppointmentSystem.Core/
│   ├── HospitalAppointmentSystem.Infrastructure/
│   └── ...
│
├── client/                     # React frontend
│   ├── src/
│   └── ...
│
├── docker-compose.yml          # For database and services
└── ReadMe.md
```

---

## Troubleshooting

- **Database Connection Issues:**  
  Ensure your database is running and the connection string is correct.
- **Migrations:**  
  If you get errors, try removing the last migration or deleting the `Migrations` folder and re-adding.
- **Email Sending:**  
  Configure your SMTP/email settings in `appsettings.json` for email confirmation and password reset.
- **RabbitMQ Issues:**  
  Make sure RabbitMQ is running with `docker-compose up -d rabbitmq`.

---

## License

MIT

---

## Credits

- Built with [ASP.NET Core](https://dotnet.microsoft.com/),
