import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getAllPatients, deletePatient } from '../../functions/allFunctions';

export const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleDelete = async (patientId) => {
    try {
      await deletePatient(patientId);
      setPatients(patients.filter(patient => patient.id !== patientId));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div className="space-y-4">
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
              <TableCell>{patient.firstName} {patient.lastName}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phoneNumber}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {patient.insuranceProvider || 'None'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(patient.id)}>
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