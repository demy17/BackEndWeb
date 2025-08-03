import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format, isBefore, isToday } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  getAllDoctors,
  getAllPatients,
  getDoctorsBySpecialization,
  createAppointment,
  cancelAppointment,
} from "../../functions/allFunctions";
import useUser from "../../services/hooks/useUser";
import { toast } from "sonner";

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Urology",
];

export const PatientAppointmentForm = ({ filter, appointment, onSuccess }) => {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    patientId: currentUser?.refId || "",
    doctorId: appointment?.doctorId || "",
    appointmentDate: appointment?.appointmentDate
      ? new Date(appointment.appointmentDate)
      : new Date(),
    startTime: appointment?.startTime || "09:00",
    endTime: appointment?.endTime || "10:00",
    notes: appointment?.notes || "",
  });
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await getAllPatients();
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    // If editing, fetch the doctor's specialization and set it
    if (appointment?.doctorId) {
      const fetchDoctor = async () => {
        try {
          const doctor = await getAllDoctors();
          const selected = doctor.find((d) => d.id === appointment.doctorId);
          if (selected) {
            setSpecialization(selected.specialization);
            setSelectedDoctor(selected);
            setDoctors([selected]);
            setFormData((prev) => ({
              ...prev,
              doctorId: selected.id,
            }));
          }
        } catch (error) {
          console.error("Error fetching doctor:", error);
        }
      };
      fetchDoctor();
    }
  }, [appointment?.doctorId]);

  useEffect(() => {
    validateTime();
  }, [formData.startTime, formData.endTime, formData.appointmentDate]);

  const handleSpecializationSelect = async (spec) => {
    setSpecialization(spec);
    setDoctors([]);
    setSelectedDoctor(null);
    setFormData((prev) => ({ ...prev, doctorId: "" }));
    try {
      const doctorsData = await getDoctorsBySpecialization(spec);
      // console.log('Doctors Data:', doctorsData);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error("Failed to fetch doctors for specialization");
    }
  };

  const validateTime = () => {
    if (!formData.startTime || !formData.endTime) return;

    const today = new Date();
    const selectedDate = formData.appointmentDate;
    const startDateTime = combineDateAndTime(selectedDate, formData.startTime);
    const endDateTime = combineDateAndTime(selectedDate, formData.endTime);

    if (isBefore(selectedDate, new Date()) && !isToday(selectedDate)) {
      setTimeError("Cannot select past dates");
      return false;
    }
    if (isBefore(endDateTime, startDateTime)) {
      setTimeError("End time must be after start time");
      return false;
    }
    if (isToday(selectedDate) && isBefore(startDateTime, today)) {
      setTimeError("Cannot select past times for today");
      return false;
    }
    setTimeError("");
    return true;
  };

  const combineDateAndTime = (date, timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTime()) {
      toast.error("Please fix time validation errors");
      return;
    }
    setLoading(true);
    try {
      if (appointment) {
        await cancelAppointment(appointment.id, formData);
      } else {
        await createAppointment(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData((prev) => ({
        ...prev,
        doctorId: doctor.id,
      }));
    }
  };

  const disabledPastDates = (date) => {
    return isBefore(date, new Date()) && !isToday(date);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Specialization Dropdown */}
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="space-y-2 w-1/2">
          <Label>Specialization</Label>
          <Select
            value={specialization}
            onValueChange={handleSpecializationSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select specialization">
                {specialization || "Select specialization"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Doctor Dropdown */}
        <div className="space-y-2 w-1/2">
          <Label>Doctor</Label>
          <Select
            value={formData.doctorId}
            onValueChange={handleDoctorSelect}
            disabled={!specialization}
            className='w-full'
          >
            <SelectTrigger>
              <SelectValue placeholder="Select doctor">
                {selectedDoctor
                  ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                  : "Select doctor"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName} (
                  {doctor.specialization})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {doctors.length === 0 && specialization && (
            <div className="text-sm text-gray-500 mt-2 px-2">
              No doctors found for this specialization.
            </div>
          )}
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.appointmentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.appointmentDate ? (
                format(formData.appointmentDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.appointmentDate}
              onSelect={(date) => {
                if (date) {
                  setFormData({ ...formData, appointmentDate: date });
                }
              }}
              initialFocus
              showOutsideDays={true}
              disabled={disabledPastDates}
              fromDate={new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            min={
              isToday(formData.appointmentDate)
                ? format(new Date(), "HH:mm")
                : undefined
            }
          />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
            min={formData.startTime}
          />
        </div>
      </div>

      {timeError && <div className="text-sm text-red-500">{timeError}</div>}

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading || timeError}>
        {loading
          ? "Saving..."
          : appointment
          ? "Update Appointment"
          : "Schedule Appointment"}
      </Button>
    </form>
  );
};
