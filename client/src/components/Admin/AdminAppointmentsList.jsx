import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import {
  getAllAppointments,
  adminCancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
} from "../../functions/allFunctions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AdminAppointmentForm } from "./AdminAppointmentForm";
import useUser from '../../services/hooks/useUser';

export const AdminAppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        let data;
        data = await getAllAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentUser]);

  const handleCancel = async (appointmentId) => {
    try {
      await adminCancelAppointment(appointmentId);
      setAppointments(appointments.filter((app) => app.id !== appointmentId));
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="space-y-4 overflow-x-hidden max-w-full">
      {appointment != null && (
        <Dialog open={appointment.id} onOpenChange={() => setAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{`${appointment? 'Update' : 'Create New'} Appointment`}</DialogTitle>
            </DialogHeader>
            <AdminAppointmentForm
              onSuccess={() => {
                setAppointment(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      <Table className='mx-3'>
        <TableHeader>
          <TableRow className="font-medium text-lg">
            {<TableHead>Patient</TableHead>}
            {<TableHead>Doctor</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              {
                <TableCell>
                  {appointment.patient?.firstName}{" "}
                  {appointment.patient?.lastName}
                </TableCell>
              }
              {
                <TableCell>
                  Dr. {appointment.doctor?.firstName}{" "}
                  {appointment.doctor?.lastName}
                </TableCell>
              }
              <TableCell>
                {format(new Date(appointment.appointmentDate), "PPP")}
              </TableCell>
              <TableCell>
                {appointment.startTime} - {appointment.endTime}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    appointment.status === "pending"
                      ? "secondary"
                      : appointment.status === "approved"
                      ? "default"
                      : appointment.status === "cancelled"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {appointment.status}
                </Badge>
              </TableCell>
              <TableCell>
                {appointment.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAppointment(appointment)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(appointment.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};