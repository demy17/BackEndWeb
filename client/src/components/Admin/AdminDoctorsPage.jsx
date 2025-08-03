import { useState } from 'react';
import { Button } from '../ui/button';
import { AdminDoctorsList } from "./AdminDoctorsList";
import { AdminDoctorForm } from "./AdminDoctorForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { MainLayout } from "../../layout/MainLayout";

export const AdminDoctorsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    alert("Doctor added successfully!");
    setIsDialogOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center mt-4 mx-8">
          <h2 className="text-2xl font-bold">Doctors</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Doctor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
              </DialogHeader>
              <AdminDoctorForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        <AdminDoctorsList key={refreshKey} />
      </div>
    </MainLayout>
  );
};