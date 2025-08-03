import { useState } from 'react';
import { Button } from '../ui/button';
import { AdminPatientsList } from './AdminPatientsList';
import { AdminPatientForm } from './AdminPatientForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { MainLayout } from '../../layout/MainLayout';

export const AdminPatientsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    alert("Patient added successfully!");
    setIsDialogOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <MainLayout>
      <div className="py-4 space-y-4 mx-3">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Patients</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Patient</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <AdminPatientForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        <AdminPatientsList key={refreshKey} />
      </div>
    </MainLayout>
  );
};