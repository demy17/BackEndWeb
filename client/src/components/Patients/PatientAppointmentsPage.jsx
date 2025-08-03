import { useState } from "react";
import { Button } from "../ui/button";
import { PatientAppointmentsList } from "./PatientAppointmentsList";
import { PatientAppointmentForm } from "./PatientAppointmentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import useUser from "../../services/hooks/useUser";
import { MainLayout } from "../../layout/MainLayout";
import { Card, CardContent } from "../ui/card";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export const PatientAppointmentsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { currentUser } = useUser();

  const handleSuccess = () => {
    alert("Appointment created successfully!");
    setIsDialogOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  // Quick stats (example)
  const stats = [
    {
      label: "Total",
      value: 12,
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
    },
    {
      label: "Upcoming",
      value: 3,
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
    },
    {
      label: "Completed",
      value: 7,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
    {
      label: "Cancelled",
      value: 2,
      icon: <XCircle className="h-6 w-6 text-red-600" />,
    },
  ];

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

  return (
    <MainLayout>
      <div className="space-y-8 mt-8 max-w-full">
        {/* Quick Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-3 bg-gray-100 rounded-full">{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}
        {/* Header & Create Button */}
        <div className="flex justify-between items-center mx-6">
          <h2 className="text-2xl font-bold">My Appointments</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white">
                Create Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
              </DialogHeader>
              <PatientAppointmentForm
                filter={filter}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
        {/* Appointments List */}
        <PatientAppointmentsList
          key={refreshKey}
          filter={filter}
          id={currentUser?.refId}
        />
      </div>
    </MainLayout>
  );
};
