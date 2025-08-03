import { useState } from "react";
import { Button } from "../ui/button";
import { AdminPrescriptionsList } from "./AdminPrescriptionsList";
import { AdminPrescriptionForm } from "./AdminPrescriptionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { MainLayout } from "../../layout/MainLayout";

export const AdminPrescriptionsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    alert("Prescription saved successfully!");
    setIsDialogOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center mt-4 mx-8">
          <h2 className="text-2xl font-bold">Prescriptions Management</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Prescription</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Prescription</DialogTitle>
              </DialogHeader>
              <AdminPrescriptionForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        <AdminPrescriptionsList key={refreshKey} />
      </div>
    </MainLayout>
  );
};
