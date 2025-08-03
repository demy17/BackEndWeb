import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getAllPatients, deletePatient } from '../../functions/allFunctions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AdminPatientForm } from './AdminPatientForm';


export const AdminPatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSuccess = () => {
    alert("Patient added successfully!");
    setPatient(null);
  }

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleDelete = async (patientId) => {
    try {
      await deletePatient(patientId);
      setPatients(patients.filter((patient) => patient.id !== patientId));
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div className="space-y-4">
      <Dialog open={patient != null} onOpenChange={() => setPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <AdminPatientForm patient={patient} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>
                {patient.firstName} {patient.lastName}
              </TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phoneNumber}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {patient.insuranceProvider || "None"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => setPatient(patient)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(patient.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};