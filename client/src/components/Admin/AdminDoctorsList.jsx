import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getAllDoctors, deleteDoctor } from '../../functions/allFunctions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AdminDoctorForm } from './AdminDoctorForm';

export const AdminDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleEdit = () => {
    alert("Doctor updated successfully!");
    setDoctor(null);
    // setRefreshKey((prev) => prev + 1);
  }

  const handleDelete = async (doctorId) => {
    try {
      await deleteDoctor(doctorId);
      setDoctors(doctors.filter((doctor) => doctor.id !== doctorId));
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  if (loading) return <div>Loading doctors...</div>;

  return (
    <div className="space-y-4">
      <Table className="mx-3">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>License</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>
                Dr. {doctor.firstName} {doctor.lastName}
              </TableCell>
              <TableCell>{doctor.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {doctor.specialization}
                </Badge>
              </TableCell>
              <TableCell>{doctor.licenseNumber}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => setDoctor(doctor)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(doctor.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={doctor != null} onOpenChange={() => setDoctor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <AdminDoctorForm doctor={doctor} onSuccess={handleEdit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};