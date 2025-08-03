import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  getPrescriptions,
  deletePrescription,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
} from "../../functions/allFunctions";
import { format } from "date-fns";
import useUser from "../../services/hooks/useUser";

export const DoctorPrescriptionsList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterId, setFilterId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {currentUser} = useUser();
  const pageSize = 10;

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        let data;
        data = await getPrescriptionsByDoctor(
            currentUser?.refId,
            currentPage,
            pageSize,
        );
        console.log(data);
        setPrescriptions(data?.items);
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [searchTerm, filterType, filterId, currentPage]);

  const handleDelete = async (prescriptionId) => {
    try {
      await deletePrescription(prescriptionId);
      setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionId));
    } catch (error) {
      console.error("Error deleting prescription:", error);
    }
  };

  if (loading) return <div>Loading prescriptions...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by medication or instructions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="space-y-2">
            <Label>Filter By</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prescriptions</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(filterType === "doctor" || filterType === "patient") && (
            <div className="space-y-2">
              <Label>ID</Label>
              <Input
                type="number"
                placeholder={`Enter ${filterType} ID`}
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medication</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Prescribed To</TableHead>
            <TableHead>Prescribed By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions &&
            prescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>{prescription.medication}</TableCell>
                <TableCell>{prescription.dosage}</TableCell>
                <TableCell>
                  {prescription.patient?.firstName}{" "}
                  {prescription.patient?.lastName}
                </TableCell>
                <TableCell>
                  Dr. {prescription.doctor?.firstName}{" "}
                  {prescription.doctor?.lastName}
                </TableCell>
                <TableCell>
                  {format(new Date(prescription.prescribedDate), "MM/dd/yyyy")}
                </TableCell>
                <TableCell>{prescription.duration} days</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2">
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(prescription.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {
                
            }
        </TableBody>
      </Table>

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
