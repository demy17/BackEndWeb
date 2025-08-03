namespace HospitalAppointmentSystem.Core.Enums
{
    public enum AppointmentStatus
    {
        Pending,
        Approved,
        Rejected,
        Completed,
        Cancelled
    }

    public static class NewStatus
    {
        public const string Pending = "pending";
        public const string Approved = "approved";
        public const string Rejected = "rejected";
        public const string Completed = "completed";
        public const string Cancelled = "cancelled";

        public static readonly string[] All = new[] 
        { 
            Pending, Approved, Rejected, Completed, Cancelled 
        };

        public static bool IsValid(string status)
        {
            return All.Contains(status);
        }
    }
}