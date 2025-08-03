import { useState } from "react";
import { Button } from "../ui/button";
import { DoctorAppointmentsList } from "./DoctorAppointmentsList";
import { DoctorAppointmentForm } from "./DoctorAppointmentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CalendarDays, Clock, Plus, Stethoscope } from "lucide-react";
import useUser from "../../services/hooks/useUser";
import { MainLayout } from "../../layout/MainLayout";
import { toast } from "sonner";

export const DoctorAppointmentsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { currentUser } = useUser();

  const handleSuccess = () => {
    toast.success("Appointment scheduled successfully!");
    setIsDialogOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  let filter;
  let role =
    (currentUser && currentUser.roles && currentUser.roles[0]) || "Patient";
  
  switch (role) {
    case "Doctor":
      filter = "doctor";
      break;
    case "Admin":
      filter = "Admin";
      break;
    default:
      filter = "patient";
      break;
  }

  // TechPassword@01

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Appointments
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage your patient appointments and schedule
                  </p>
                </div>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                      Create New Appointment
                    </DialogTitle>
                  </DialogHeader>
                  <DoctorAppointmentForm
                    filter={filter}
                    onSuccess={handleSuccess}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CalendarDays className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Appointments List */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Appointment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DoctorAppointmentsList
                key={refreshKey}
                filter={filter}
                id={currentUser?.refId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
