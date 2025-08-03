import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format, isBefore, isToday } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAllDoctors, getAllPatients, createAppointment, cancelAppointment } from '../../functions/allFunctions';
import { toast } from 'sonner';

export const AdminAppointmentForm = ({ filter, appointment, onSuccess }) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    doctorId: appointment?.doctorId || '',
    appointmentDate: appointment?.appointmentDate ? new Date(appointment.appointmentDate) : new Date(),
    startTime: appointment?.startTime || '09:00',
    endTime: appointment?.endTime || '10:00',
    notes: appointment?.notes || '',
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, patientsData] = await Promise.all([
          getAllDoctors(),
          getAllPatients()
        ]);
        setDoctors(doctorsData);
        setPatients(patientsData);

        // Set initial selected patient and doctor if editing
        if (appointment?.patientId) {
          const patient = patientsData.find(p => p.id === appointment.patientId);
          setSelectedPatient(patient);
        }
        if (appointment?.doctorId) {
          const doctor = doctorsData.find(d => d.id === appointment.doctorId);
          setSelectedDoctor(doctor);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [appointment?.patientId, appointment?.doctorId]);

  useEffect(() => {
    validateTime();
  }, [formData.startTime, formData.endTime, formData.appointmentDate]);

  const validateTime = () => {
    if (!formData.startTime || !formData.endTime) return;

    const today = new Date();
    const selectedDate = formData.appointmentDate;
    const startDateTime = combineDateAndTime(selectedDate, formData.startTime);
    const endDateTime = combineDateAndTime(selectedDate, formData.endTime);

    if (isBefore(selectedDate, new Date())) {
      setTimeError("Cannot select past dates");
      return false;
    }

    if (isBefore(endDateTime, startDateTime)) {
      setTimeError("End time must be after start time");
      return false;
    }

    if (isToday(selectedDate)) {
      const currentTime = format(today, 'HH:mm');
      if (isBefore(formData.startTime, currentTime)) {
        setTimeError("Cannot select past times for today");
        return false;
      }
    }

    setTimeError("");
    return true;
  };

  const combineDateAndTime = (date, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
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
      console.error('Error saving appointment:', error);
      toast.error("Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patientId
    }));}
  };

  const handleDoctorSelect = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    setSelectedDoctor(doctor);
    if (doctor) {setFormData(prev => ({
      ...prev,
      doctorId: doctorId
    }));}
  };

  const disabledPastDates = (date) => {
    return isBefore(date, new Date()) && !isToday(date);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Patient</Label>
        <Select
          value={formData.patientId}
          onValueChange={handlePatientSelect}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select patient">
              {selectedPatient 
                ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                : "Select patient"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {patients.map(patient => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Doctor</Label>
        <Select
          value={formData.doctorId}
          onValueChange={handleDoctorSelect}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select doctor">
              {selectedDoctor 
                ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                : "Select doctor"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {doctors.map(doctor => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              onSelect={(date) => date && setFormData({...formData, appointmentDate: date})}
              initialFocus
              showOutsideDays={true}
              disabled={disabledPastDates}
              fromDate={new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input 
            type="time" 
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            min={isToday(formData.appointmentDate) ? format(new Date(), 'HH:mm') : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input 
            type="time" 
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            min={formData.startTime}
          />
        </div>
      </div>

      {timeError && (
        <div className="text-sm text-red-500">{timeError}</div>
      )}

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input 
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || timeError}
      >
        {loading ? 'Saving...' : 'Save Appointment'}
      </Button>
    </form>
  );
};