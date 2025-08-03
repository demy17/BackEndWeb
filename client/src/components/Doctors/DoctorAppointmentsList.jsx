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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format } from "date-fns";
import {
  cancelAppointment,
  getDoctorAppointments,
  acceptAppointment,
} from "../../functions/allFunctions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DoctorAppointmentForm } from "./DoctorAppointmentForm";
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
  MoreHorizontal,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const DoctorAppointmentsList = () => {
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
        let data = await getDoctorAppointments(currentUser?.refId);
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

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        `${app.patient?.firstName} ${app.patient?.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      const updatedAppointments = appointments.map(app => 
        app.id === appointmentId ? 
          { ...app, status: "cancelled" } 
          : app
      );
      setAppointments(updatedAppointments);
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleAccept = async (appointmentId) => {
    try {
      await acceptAppointment(appointmentId);
      setAppointments(appointments.map(app => 
        app.id === appointmentId 
          ? { ...app, status: "approved" }
          : app
      ));
      // alert('Appointment approved successfully');
      toast.success("Appointment approved successfully");
    } catch (error) {
      console.error("Error approving appointment:", error);
      alert(`Errpr: ${error || "Failed to approve appointment"}`);
      toast.error("Failed to approve appointment");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      approved: { variant: "default", icon: CheckCircle, color: "text-green-600" },
      cancelled: { variant: "destructive", icon: XCircle, color: "text-red-600" },
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
        <p className="text-gray-600 text-lg">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
            <DoctorAppointmentForm
              appointment={appointment}
              onSuccess={() => {
                setAppointment(null);
                getDoctorAppointments(currentUser?.refId).then((data) => {
                  setAppointments(data || []);
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by patient name..."
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
          {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment?.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {appointment?.patient?.firstName} {appointment?.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment?.patient?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {format(new Date(appointment?.appointmentDate), "MMM dd, yyyy")}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(appointment?.appointmentDate), "EEEE")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {appointment?.startTime} - {appointment?.endTime}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(appointment?.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {appointment?.status === "pending" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAccept(appointment?.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(appointment?.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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
                      <p className="text-lg font-medium text-gray-900">No appointments found</p>
                      <p className="text-gray-500 mt-1">
                        {searchTerm || statusFilter !== "all" 
                          ? "Try adjusting your search or filter criteria"
                          : "You don't have any scheduled appointments yet"
                        }
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
