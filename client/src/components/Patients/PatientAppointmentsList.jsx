import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import {
  cancelAppointment,
  getPatientAppointments,
} from "../../functions/allFunctions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { PatientAppointmentForm } from "./PatientAppointmentForm";
import useUser from "../../services/hooks/useUser";
import { toast } from "sonner";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

export const PatientAppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        let data = await getPatientAppointments(currentUser?.refId);
        setAppointments(data || []);
        setFilteredAppointments(data || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.refId) {
      fetchAppointments();
    }
  }, [currentUser]);

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          `Dr. ${app.doctor?.firstName} ${app.doctor?.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.doctor?.specialization
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      setAppointments(appointments.filter((app) => app.id !== appointmentId));
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      alert(`Error: ${error || "Failed to cancel appointment"}`);
      toast.error("Error cancelling appointment");
      console.error("Error cancelling appointment:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        variant: "secondary",
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
      },
      approved: {
        variant: "default",
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
      },
      cancelled: {
        variant: "destructive",
        icon: XCircle,
        color: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Edit Appointment Dialog */}
      {appointment && (
        <Dialog open={!!appointment} onOpenChange={() => setAppointment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Edit Appointment
              </DialogTitle>
            </DialogHeader>
            <PatientAppointmentForm
              appointment={appointment}
              onSuccess={() => {
                setAppointment(null);
                toast.success("Appointment updated successfully");
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by doctor name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredAppointments.length} of {appointments.length}{" "}
              appointments
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="border-0 shadow-lg mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="hover:bg-blue-50 transition"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          Dr. {appointment.doctor?.firstName}{" "}
                          {appointment.doctor?.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {format(
                          new Date(appointment.appointmentDate),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      {appointment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(appointment.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-900">
                          No appointments found
                        </p>
                        <p className="text-gray-500 mt-1">
                          You don't have any scheduled appointments yet
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
